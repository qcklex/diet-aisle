// Host-based root routing: on dietaisle.com the root serves the marketing
// landing page; the app keeps the root of dietaisle.vercel.app so installed
// PWAs (start_url "/") are unaffected. No-op until the domain's DNS connects.
export const config = { matcher: '/' };

export default function middleware(request) {
  const host = (request.headers.get('host') || '').toLowerCase();
  if (host === 'dietaisle.com' || host === 'www.dietaisle.com') {
    const url = new URL(request.url);
    url.pathname = '/landing.html';
    return new Response(null, { headers: { 'x-middleware-rewrite': url.toString() } });
  }
}
