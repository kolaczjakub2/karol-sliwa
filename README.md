# Karol Śliwa — Angular 22 redesign concept

Dark/light cinematic frontend concept for `karolsliwa.com`, built as a modern Angular app using the WordPress REST API:

```txt
https://karolsliwa.com/wp-json/wp/v2/posts
```

The app extends the endpoint with `_embed=1`, so it can read featured images, author data and categories when WordPress exposes them.

## Tech stack

- Angular 22
- Angular Material
- Standalone components
- Signals and computed state
- New Angular control flow: `@if`, `@for`, `@empty`
- `provideHttpClient(withFetch())`
- Lazy-loaded routes
- WordPress REST API integration
- Responsive dark/light editorial UI with a persistent Material icon theme switcher
- Official Karol Mówi logo in the header, adapted with CSS variables for dark and light themes
- More robust hero section that prefers posts with featured images and falls back to a custom NBA editorial SVG
- WordPress comments integration: approved comments list and comment form on the article page

## Main screens

- `/` — homepage with hero, featured posts, latest feed, podcast block, format tiles, author/newsletter section
- `/archiwum` — searchable archive with pagination
- `/post/:slug` — article detail page using WordPress content and a comments section

## Run locally

```bash
npm install
npm start
```

Then open:

```txt
http://localhost:4200
```

## Build

```bash
npm run build
```

## Notes

1. This is a frontend prototype. The newsletter form is visual only. The article comment form is connected to WordPress REST API, but the final behavior depends on WordPress settings: comments may be disabled, moderated, blocked by anti-spam plugins or limited by CORS.
2. Theme switching is handled by `ThemeService`, CSS variables and `localStorage`; the user can switch between cinematic dark mode and warm editorial light mode from the header icon button.
3. If the WordPress API blocks browser requests through CORS, use a dev proxy or your own backend middleware.
4. WordPress HTML is rendered with Angular `[innerHTML]`. Angular sanitizes bound HTML by default, but in a production project you should still define a clear trust/sanitization policy for external CMS content.
5. The design intentionally moves away from a classic WordPress blog list and toward a premium NBA media hub.
6. The header logo is loaded from the current KarolSliwa.com media URL: `https://karolsliwa.com/wp-content/uploads/2019/03/cropped-Logo-text.png`. If that asset changes or becomes unavailable, the header falls back to a text logo.

## Useful WordPress API queries

Latest posts:

```txt
https://karolsliwa.com/wp-json/wp/v2/posts?_embed=1&per_page=12
```

Single post by slug:

```txt
https://karolsliwa.com/wp-json/wp/v2/posts?_embed=1&slug=example-slug
```

Comments for a post:

```txt
https://karolsliwa.com/wp-json/wp/v2/comments?post=POST_ID&orderby=date&order=asc
```

Create a comment:

```txt
POST https://karolsliwa.com/wp-json/wp/v2/comments
```

Search:

```txt
https://karolsliwa.com/wp-json/wp/v2/posts?_embed=1&search=draft
```

## Wymagane wersje

Ten projekt jest ustawiony pod Angular 22, więc używa:

- `@angular/build:application`
- `@angular/build:dev-server`
- TypeScript `~6.0.0`
- Node.js `^22.22.3 || ^24.15.0 || >=26.0.0`

Jeśli wcześniej instalowałeś zależności na starszym `package.json`, usuń `node_modules` i `package-lock.json`, a potem odpal ponownie:

```bash
npm install
npm start
```

Na Windowsie najprościej:

```powershell
rmdir /s /q node_modules
del package-lock.json
npm install
npm start
```

