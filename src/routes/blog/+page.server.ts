import type { Content } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	let essays: Content[] = [];

	const paths = import.meta.glob('../../posts/*.md', {
		eager: true
	});

	for (const path in paths) {
		const file = paths[path];
		const title = path.split('/').at(-1)?.replace('.md', '');

		if (!title) continue;

		const slug = title.replaceAll(' ', '_');

		if (file && typeof file === 'object' && 'metadata' in file && slug) {
			const metadata = file.metadata as Omit<Content, 'slug'>;
			const post = { ...metadata, slug } satisfies Content;
			essays.push(post);
		}
	}

	essays = essays.sort(
		(first, second) => new Date(second.date).getTime() - new Date(first.date).getTime()
	);

	return { essays };
};
