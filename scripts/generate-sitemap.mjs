import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_URL = 'https://karolsliwa.com';
const API_URL = 'https://karolsliwa.com/wp-json/wp/v2/posts';
const OUTPUT_PATH = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'sitemap.xml');

const staticUrls = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/archiwum', changefreq: 'daily', priority: '0.8' },
  { path: '/o-mnie', changefreq: 'monthly', priority: '0.6' },
  { path: '/wspolpraca', changefreq: 'monthly', priority: '0.5' }
];

async function fetchAllPosts() {
  const posts = [];
  let page = 1;
  let totalPages = 1;

  do {
    const url = new URL(API_URL);
    url.searchParams.set('per_page', '100');
    url.searchParams.set('page', String(page));
    url.searchParams.set('_fields', 'slug,modified');

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`WordPress returned ${response.status} for sitemap page ${page}`);
    }

    totalPages = Number(response.headers.get('X-WP-TotalPages') ?? totalPages);
    posts.push(...await response.json());
    page += 1;
  } while (page <= totalPages);

  return posts;
}

function buildUrl({ loc, lastmod, changefreq, priority }) {
  return [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
    lastmod ? `    <lastmod>${escapeXml(lastmod)}</lastmod>` : '',
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : '',
    priority ? `    <priority>${priority}</priority>` : '',
    '  </url>'
  ].filter(Boolean).join('\n');
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

async function writeSitemap(posts) {
  const urls = [
    ...staticUrls.map((item) => ({
      loc: `${SITE_URL}${item.path}`,
      changefreq: item.changefreq,
      priority: item.priority
    })),
    ...posts.map((post) => ({
      loc: `${SITE_URL}/${post.slug}`,
      lastmod: post.modified,
      changefreq: 'weekly',
      priority: '0.7'
    }))
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls.map(buildUrl).join('\n'),
    '</urlset>',
    ''
  ].join('\n');

  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, xml, 'utf8');
  console.log(`Generated sitemap.xml with ${urls.length} URLs.`);
}

try {
  await writeSitemap(await fetchAllPosts());
} catch (error) {
  console.warn(`Sitemap generation skipped: ${error.message}`);
}
