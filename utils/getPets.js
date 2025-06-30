const { getPetfinderToken } = require('./getPetFinderToken');

async function getPets({ location = '33126' } = {}) {
  try {
    const token = await getPetfinderToken();
    const url = `https://api.petfinder.com/v2/animals?location=${location}&distance=100&limit=20`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await response.json();
    console.log('Petfinder API returned:', JSON.stringify(data, null, 2));
    return data.animals || [];
  } catch (err) {
    console.error('Error fetching pets:', err);
    return [];
  }
}

module.exports = getPets;

