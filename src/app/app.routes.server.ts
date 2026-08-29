import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';

interface LatestPostSlug {
  slug?: string;
}

async function getLatestPostParams(): Promise<Record<string, string>[]> {
  try {
    const response = await fetch(
      'https://karolsliwa.com/wp-json/wp/v2/posts?per_page=12&_fields=slug',
      { signal: AbortSignal.timeout(8000) }
    );
    if (!response.ok) return [];

    const posts = await response.json() as LatestPostSlug[];
    return posts
      .map((post) => post.slug?.trim())
      .filter((slug): slug is string => Boolean(slug))
      .map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: ':slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Server,
    getPrerenderParams: getLatestPostParams
  },
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
