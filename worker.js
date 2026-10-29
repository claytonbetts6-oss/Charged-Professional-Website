// Cloudflare Worker entry — runs the CMS login at /oauth, serves everything else as static files.
import { onRequest as oauth } from './functions/oauth.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/oauth') {
      return oauth({ request, env, ctx });
    }
    return env.ASSETS.fetch(request);
  },
};
