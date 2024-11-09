const keywords = new Set(['GET', 'FROM', 'ON', 'WHERE']);

export function highlightKeywords(q: string[]) {
  let beforeWord: string = '';
  let entity: string = '';
  return q
    .map((word) => {
      if (keywords.has(word)) {
        beforeWord = word;
        return `<span class="text-purple-700">${word}</span>`;
      } else {
        if (beforeWord === 'ON') {
          beforeWord = word;
          entity = '';
          return `<span class="text-amber-200">${word}</span>`;
        } else if (beforeWord === 'FROM') {
          beforeWord = word;
          entity = word;
          return word;
        } else if (entity !== '') {
          beforeWord = word;
          return `<span class="text-amber-200">${word}</span>`;
        } else {
          beforeWord = word;
          return word;
        }
      }
    })
    .join(' ');
}
