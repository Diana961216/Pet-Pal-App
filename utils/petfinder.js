const fetch = require('node-fetch');
let tokenCache = { token: null, expires: 0 };

async function getPetfinderToken() {
  if (tokenCache.token && tokenCache.expires > Date.now()) {
    return tokenCache.token;
  }

  const response = await fetch('https://api.petfinder.com/v2/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: process.env.PETFINDER_CLIENT_ID,
      client_secret: process.env.PETFINDER_CLIENT_SECRET
    })
  });
  const data = await response.json();
  tokenCache.token = data.access_token;
  tokenCache.expires = Date.now() + (data.expires_in * 1000) - 60000; // renew 1 min before expiry
  return tokenCache.token;
}

module.exports = { getPetfinderToken };
