const { getPetfinderToken } = require('./getPetFinderToken');

async function getBreeds(type = 'dog') {
  try {
    const token = await getPetfinderToken();
    const res = await fetch(`https://api.petfinder.com/v2/types/${type}/breeds`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return data.breeds.map((b) => b.name);
  } catch (err) {
    console.error('Error fetching breeds:', err);
    return [];
  }
}

module.exports = { getBreeds };
