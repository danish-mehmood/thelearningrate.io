import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

export interface TagGroup {
  /** original label as written in frontmatter, e.g. "intuition" */
  label: string;
  /** url-safe slug, e.g. "intuition" */
  slug: string;
  /** posts carrying this tag, newest first */
  posts: Post[];
}

/** Turn a free-form tag into a url-safe slug. */
export function slugifyTag(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** All non-draft posts, newest first. */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** Every tag, each with its posts, sorted by popularity then name. */
export async function getAllTags(): Promise<TagGroup[]> {
  const posts = await getPublishedPosts();
  const map = new Map<string, TagGroup>();
  for (const post of posts) {
    for (const raw of post.data.tags) {
      const slug = slugifyTag(raw);
      if (!slug) continue;
      if (!map.has(slug)) map.set(slug, { label: raw, slug, posts: [] });
      map.get(slug)!.posts.push(post);
    }
  }
  return [...map.values()].sort(
    (a, b) => b.posts.length - a.posts.length || a.label.localeCompare(b.label)
  );
}
