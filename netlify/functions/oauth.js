// GitHub OAuth handler for Decap CMS (zero dependencies, Node 18+ global fetch).
// One function does both steps:
//   - no ?code  -> redirect the user to GitHub to authorise
//   - ?code=... -> exchange the code for a token and hand it back to the CMS
// Set these in Netlify -> Site configuration -> Environment variables:
//   OAUTH_GITHUB_CLIENT_ID
//   OAUTH_GITHUB_CLIENT_SECRET

const CLIENT_ID = process.env.OAUTH_GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.OAUTH_GITHUB_CLIENT_SECRET;

exports.handler = async (event) => {
  const host = event.headers.host;
  const redirectUri = `https://${host}/.netlify/functions/oauth`;
  const code = event.queryStringParameters && event.queryStringParameters.code;

  // Step 1 — send the user to GitHub's authorise screen
  if (!code) {
    if (!CLIENT_ID) {
      return { statusCode: 500, body: 'Missing OAUTH_GITHUB_CLIENT_ID environment variable.' };
    }
    const state = Math.random().toString(36).slice(2);
    const authUrl =
      'https://github.com/login/oauth/authorize' +
      `?client_id=${CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      '&scope=repo' +
      `&state=${state}`;
    return { statusCode: 302, headers: { Location: authUrl }, body: '' };
  }

  // Step 2 — exchange the code for an access token
  let result;
  try {
    const resp = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
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
  const html = `<!doctype html><html><body><script>
  (function () {
    function receiveMessage(e) {
      window.opener.postMessage(${JSON.stringify(message)}, e.origin);
      window.removeEventListener('message', receiveMessage, false);
    }
    window.addEventListener('message', receiveMessage, false);
    window.opener.postMessage('authorizing:github', '*');
  })();
  </script><p>Completing sign in… you can close this window.</p></body></html>`;

  return { statusCode: 200, headers: { 'Content-Type': 'text/html' }, body: html };
};
