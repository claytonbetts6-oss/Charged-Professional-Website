// GitHub OAuth handler for Decap CMS — Cloudflare Pages Function format.
// Serves /oauth. One handler does both steps:
//   - no ?code  -> redirect the user to GitHub to authorise
//   - ?code=... -> exchange the code for a token and hand it back to the CMS
// Set these in Cloudflare Pages -> Settings -> Environment variables:
//   OAUTH_GITHUB_CLIENT_ID
//   OAUTH_GITHUB_CLIENT_SECRET

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const CLIENT_ID = env.OAUTH_GITHUB_CLIENT_ID;
  const CLIENT_SECRET = env.OAUTH_GITHUB_CLIENT_SECRET;
  const redirectUri = url.origin + '/oauth';
  const code = url.searchParams.get('code');

  // Step 1 — send the user to GitHub to authorise
  if (!code) {
    if (!CLIENT_ID) {
      return new Response('Missing OAUTH_GITHUB_CLIENT_ID environment variable.', { status: 500 });
    }
    const state = Math.random().toString(36).slice(2);
    const authUrl =
      'https://github.com/login/oauth/authorize' +
      '?client_id=' + CLIENT_ID +
      '&redirect_uri=' + encodeURIComponent(redirectUri) +
      '&scope=repo' +
      '&state=' + state;
    return Response.redirect(authUrl, 302);
  }

  // Step 2 — exchange the code for an access token
  let result;
  try {
    const resp = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'decap-cms-cloudflare',
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
        redirect_uri: redirectUri,
      }),
    });
    const data = await resp.json();
    if (data.access_token) {
      result = 'success:' + JSON.stringify({ token: data.access_token, provider: 'github' });
    } else {
      result = 'error:' + JSON.stringify({ error: data.error_description || 'No access token returned' });
    }
  } catch (e) {
    result = 'error:' + JSON.stringify({ error: String(e) });
  }

  // Hand the result back to the Decap CMS window that opened this popup
  const message = 'authorization:github:' + result;
  const html =
    '<!doctype html><html><body><script>' +
    '(function () {' +
    '  function receiveMessage(e) {' +
    '    window.opener.postMessage(' + JSON.stringify(message) + ', e.origin);' +
    '    window.removeEventListener("message", receiveMessage, false);' +
    '  }' +
    '  window.addEventListener("message", receiveMessage, false);' +
    '  window.opener.postMessage("authorizing:github", "*");' +
    '})();' +
    '</script><p>Completing sign in… you can close this window.</p></body></html>';

  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}
