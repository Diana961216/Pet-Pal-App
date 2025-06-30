const { getPetfinderToken } = require('./getPetFinderToken');

async function getPets({ type = 'dog', location = '33126' } = {}) {
  try {
    const token = await getPetfinderToken();
    const response = await fetch(`https://api.petfinder.com/v2/animals?type=${type}&location=${location}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await response.json();
    return data.animals;
  } catch (err) {
    console.error('Error fetching pets:', err);
    return [];
  }
}

module.exports = getPets;
