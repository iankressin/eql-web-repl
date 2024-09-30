# EVM Query Language Alpha Release
Today marks the alpha release of the EVM Query Language (EQL), a SQL-like language designed to query EVM chains. Its ultimate goal is to support complex relational queries on EVM chain first-class citizens (blocks, accounts, and transactions) while providing developers and researchers with an ergonomic syntax for everyday use.

In this post, we will cover the problems EQL aims to solve, explore the current landscape of EVM queries, and review past work on query languages designed for Ethereum. We will then discuss possible solutions, the current implementation of EQL and its limitations, and outline future development.

Beyond being a alpha release, this marks a commitment to making EVM data more accessible for researchers, analysts, and developers, with the goal of accelerating Ethereum development and adoption by providing builders with tools to move faster.
## The Problem
Ethereum and other major L2s are open and permissionless data platforms, allowing anyone to access, manipulate, and analyze the ever-growing collection of bytes. Ethereum clients store blocks, transactions, and accounts using a key-value model, where an instance of any first-class entity can be accessed directly using a unique key. For example, the information of an account can be retrieved by providing the key-value store with the account's address.

Hash-map-based databases are ideal when you have an ID and need to fetch its content, and EVM clients require nothing beyond that. However, while this storage model fits internal node operations, it makes complex blockchain data analysis non-trivial.
Key-value stores are not designed for relational look-ups. Consider the situation where someone requires the data of all transactions that sent more than 1 ETH in the last hour. We would need to:
- Run a linear search on the blocks hash-map to find timestamps greater than `now - 1 hour`.
- Run another linear search on the blocks returned from the last step, to filter out transactions with values different than 1 ETH.

This simple example illustrates how poorly this approach scales in terms of performance for more complex analyses.

Beyond the storage model, developers and researchers face the inconvenience of boilerplate code when accessing on-chain data. For example, fetching all transaction values from a given block requires a disproportionate amount of code for a simple query. A TypeScript implementation would look something like this:
```typescript
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

async function fetchTransactionsFromBlock(blockTag: BlockTag): Promise<BigInt[]> {
  const client = createPublicClient({
    chain: mainnet,
    transport: http(),
  });

  const block = await client.getBlock({ blockTag });
  const values: BigInt[] = [];

  for (const hash of block.transactions) {
    const tx = await client.getTransaction({ hash });
    values.push(tx.value);
  }

  return values;
}
```
_Listing 1 - Fetching values from all transactions in a block_

While switching from a `for of` loop to an `await Promise.all(tx.map(...))` could improve performance, it doesn't account for public RPC rate limits, and the "faster" version would likely crash due to excessive calls in a short period.

Dapp developers and researchers shouldn't face these issues as they hinder productivity by forcing them to deal with minor hiccups.
## Current Landscape
There are various options for accessing blockchain data from EVM chains.
### JSON-RPCs
The native alternative for all EVM nodes is JSON-RPCs. Nodes expose an API to read the blockchain's state and logs. RPCs are widely used as the backbone of applications requiring on-chain data interaction. Methods like `eth_getBlockByNumber` or `eth_getBalance` receive an identifier (block number or account address) and return their values. Internally, these methods read from some key-value store and return the value to the user.

Since JSON-RPCs are part of Ethereum specs, they are widely available through both free and paid service providers like [llama rpc](https://llamarpc.com/), [ankr](https://www.ankr.com/), and [infura](https://www.infura.io/). Free tiers often provide adequate service for small-scale apps and analyses of a small blockchain section.

However, accessing large amounts of data with this approach can show limitations. As discussed in _Listing 1_, RPC providers implement rate limiters, which should be considered when trying to fetch data in sequential calls. Strategies like alternating between different providers or using a client-side rate-limiter can avoid bans but don't address the underlying problem.
### The Graph
A popular solution for querying, aggregating, and indexing data from EVM and non-EVM chains is [The Graph](https://thegraph.com/). It allows map-reduce EVM events from smart contracts into custom structures, making querying and searching on-chain data easier than with public/view methods of contracts.

Subgraphs excel at parsing EVM events, indexing the results, and making them available through a GraphQL API, eliminating the need to create and maintain the entire map-reduce-index structure manually.

However, its reliance on smart-contract events means subgraphs require a smart-contract address to listen to events from. Therefore, queries strictly dependent on EOAs, blocks, and transactions are not supported out-of-the-box.
Subgraphs are built using [AssemblyScript](https://www.assemblyscript.org/introduction.html), a variant of TypeScript that compiles down to WebAssembly. Despite being similar to TS, AS has its limitations that new developers must understand and manage.
### Dune
[Dune](https://dune.com/) is the industry standard for data analysis, offering a platform where users can query blockchains with a SQL-like language called DuneSQL, fine-tuned for blockchain needs. Results can be streamed into dashboards for data visualization.

The platform provides an extensive data catalog that users can leverage to create complex relational queries. However, Dune doesn't provide native access to basic on-chain data like the nonce of an account. The query below was generated by Dune's AI assistant using the prompt: `fetch the nonce of account 0xd8dA...A96045 on ethereum`
```SQL
SELECT 'The nonce value for an account cannot be determined using SQL queries on the provided tables. Nonce retrieval requires access to node or API data that specifically tracks the state and transaction count for each account.' AS message
```
_Listing 2 - Dune AI assistant response_

While the AI assistant is still in beta, and this could be a false positive, a scan of the collections revealed no `nonce` or `transaction_count` fields.

Another drawback of Dune is that queries must be defined in their web app and then called from an application, passing in parameters. Defining the query directly in project repositories can save developers the hassle of managing another platform and API key.
## How EQL Wants to Solve It
All the tools and products mentioned have limitations when it comes to complex queries and/or ergonomics. EVM Query Language aims to bridge the gap between data exploration and developer/researcher experience. EQL focuses on two main areas:
### Query Performance
Research is being conducted to determine the path to providing fully relational queries for Ethereum's first-class citizens. Key principles guiding R&D include:
- **Data access:** Data should be easily accessible. Running a full-node should not be required to fetch blockchain state.
- **Avoid centralization:** No single entity should hold all queried data. Centralized databases are not an option.

An instinctive approach is parsing Ethereum's state into a B+ Tree, a data structure used by many SQL databases. B+ Trees are excellent for:
- Minimizing the number of disk reads
- Efficient range queries

This idea was explored in a paper called [EBTrees](https://dl.acm.org/doi/10.1145/3399871.3399892), proposing a B+ Tree-like data structure to index Ethereum state. The proposed model boasts fast insertion, searches, and relatively low storage space compared to a regular Geth node's disk usage.
Despite promising results, all data was collected on a machine running a forked Geth client with the EBTree stored on disk, conflicting with the first principle of not requiring a full-node due to prohibitive specs and sync time.

This research aims to distribute the nodes of the tree in a peer network, ideally an existing one (e.g., IPFS), and build the tree or sub-tree representation locally. Clients would hold internal nodes, requiring less disk space than leaf nodes, while the actual data is stored remotely.

This work is in its early stages, with no experiments on distributed EBTrees yet. As R&D progresses, articles will be written to share updates.
### Ergonomics
Developers face steep learning curves and productivity hindrances due to the many languages, frameworks, libraries, and services they must master and manage for consistent, scalable applications.
Researchers' most valuable work involves analyzing data and writing about their methods and conclusions. Every minute spent learning a new tool and its intricacies is a minute lost on the actual research.

With that in mind, EQL aims to provide:
- **Small footprint:** Minimize the impact on existing codebases that decide to adopt EQL.
- **Productivity for beginners:** Enhance productivity for new users through a simple yet powerful syntax, reducing the time needed to learn and use the tool effectively.
## What is EQL capable of now?
Currently, EQL doesn't support relational queries as it uses a regular JSON-RPCs as the backbone of the execution engine, inheriting all its limitations.

An EQL query follows a simple structure: which fields to fetch, from which entity, on which chain.
```sql
GET <[fields, ]> FROM <entity> <entity_id> ON <chain>
```
_Listing 3 - EQL get syntax_

Below is a series of supported expressions:
- Account's `nonce` and `balance` on Ethereum:
```sql
GET nonce, balance FROM vitalik.eth ON eth
```

- Block's `size` and `timestamp` on Base:
```sql
GET size, timestamp FROM block 1 ON base
```

- Transaction's `from`, `value`, and `to` on Arbitrum:
```sql
GET from, value, to FROM tx 0x... ON arb
```

You can see a full list of supported entities, fields, and chains [here](https://github.com/iankressin/eql).
## Try the alpha now
Web-based REPL: [https://eql.sh/](https://eql.sh/)  
CLI and REPL: [https://github.com/iankressin/eql](https://github.com/iankressin/eql)  
Rust: [https://crates.io/crates/eql_core](https://crates.io/crates/eql_core)  
Typescript: soon!

Thanks for reading. If you want to chat about EQL and on-chain data analysis, shoot me a DM on [X](https://x.com/iankguimaraes).
