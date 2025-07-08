const { getPetfinderToken } = require('./getPetFinderToken');

module.exports = async function getPets({ location = '33126', type = '', breed = '' } = {}) {
  const token = await getPetfinderToken();
  let url = `https://api.petfinder.com/v2/animals?location=${location}&distance=100&limit=24`;

  if (type) {
    url += `&type=${type}`;
  }

  if (breed) {
    url += `&breed=${encodeURIComponent(breed)}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return data.animals || [];
};
