interface Env {
  ASSETS: Fetcher;
}

const CANONICAL_HOST = 'icra.contractors';

const BASE_HEADERS: Record<string, string> = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

const NOINDEX_PATHS = new Set(['/404', '/404/', '/404.html', '/index.html', '/index.html/']);

function finalize(response: Response, url: URL, preserveStatus = false): Response {
  const headers = new Headers(response.headers);

  for (const [name, value] of Object.entries(BASE_HEADERS)) {
    headers.set(name, value);
  }

  if (url.hostname.endsWith('.workers.dev') || NOINDEX_PATHS.has(url.pathname)) {
    headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  if (url.pathname.startsWith('/_astro/')) {
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  return new Response(response.body, {
    status: preserveStatus ? response.status : 200,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (
      url.hostname === `www.${CANONICAL_HOST}` ||
      url.hostname.startsWith('www.') ||
      (url.protocol === 'http:' && (url.hostname === CANONICAL_HOST || url.hostname.endsWith('.contractors')))
    ) {
      url.hostname = CANONICAL_HOST;
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === '/index.html' || url.pathname === '/index.html/' || url.pathname === '/index') {
      url.pathname = '/';
      return Response.redirect(url.toString(), 301);
    }

    if (!url.pathname.endsWith('/') && !url.pathname.includes('.')) {
      url.pathname += '/';
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === '/404' || url.pathname === '/404/') {
      const notFound = await env.ASSETS.fetch(
        new Request(new URL('/404.html', url.origin), request),
      );
      return finalize(
        new Response(notFound.body, {
          status: 404,
          statusText: notFound.statusText,
          headers: notFound.headers,
        }),
        url,
        true,
      );
    }

    const response = await env.ASSETS.fetch(request);
    return finalize(response, url, true);
  },
} satisfies ExportedHandler<Env>;
