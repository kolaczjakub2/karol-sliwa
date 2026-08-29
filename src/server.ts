import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
import {
  getAllowedHosts,
  getContext,
  getTrustProxyHeaders,
} from '@netlify/angular-runtime/app-engine.js';

const allowedHosts = [...new Set([
  ...getAllowedHosts(),
  'localhost',
  'localhost:4201',
  '127.0.0.1',
  '127.0.0.1:4201',
])];

const angularAppEngine = new AngularAppEngine({
  allowedHosts,
  trustProxyHeaders: getTrustProxyHeaders(),
});

export async function netlifyAppEngineHandler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const legacyPostMatch = url.pathname.match(/^\/post\/([^/]+)\/?$/);
  if (legacyPostMatch) {
    return Response.redirect(new URL(`/${legacyPostMatch[1]}`, url), 301);
  }

  const result = await angularAppEngine.handle(request, getContext());
  if (!result) return new Response('Not found', { status: 404 });

  const headers = new Headers(result.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (request.method === 'GET' && !url.pathname.includes('.')) {
    headers.set('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
    headers.set(
      'Netlify-CDN-Cache-Control',
      'public, durable, s-maxage=300, stale-while-revalidate=86400',
    );
  }

  return new Response(result.body, {
    status: result.status,
    statusText: result.statusText,
    headers,
  });
}

export const reqHandler = createRequestHandler(netlifyAppEngineHandler);
