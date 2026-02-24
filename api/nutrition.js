// API Ninjas Nutrition endpoint
// GET /api/nutrition?query=<food text>

module.exports = async (req, res) => {
  // Only allow GET
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  // Read query param
  const query = req.query?.query;
  if (!query || typeof query !== 'string' || query.trim() === '') {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Missing query param' }));
    return;
  }

  // Read API key from environment
  const apiKey = process.env.API_NINJAS_API_KEY;
  if (!apiKey) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Missing API key' }));
    return;
  }

  // Call API Ninjas
  const apiUrl = `https://api.api-ninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`;
  
  try {
    const apiRes = await fetch(apiUrl, {
      headers: {
        'X-Api-Key': apiKey,
      },
    });

    if (!apiRes.ok) {
      const status = apiRes.status;
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'API Ninjas error', status }));
      return;
    }

    const items = await apiRes.json();

    // Aggregate totals
    const totals = items.reduce(
      (acc, item) => {
        acc.kcal += item.calories;
        acc.b += item.protein_g;
        acc.zh += item.fat_total_g;
        acc.u += item.carbohydrates_total_g;
        return acc;
      },
      { kcal: 0, b: 0, zh: 0, u: 0 }
    );

    // Return formatted response
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        kcal: Math.round(totals.kcal),
        b: Math.round(totals.b * 10) / 10,
        zh: Math.round(totals.zh * 10) / 10,
        u: Math.round(totals.u * 10) / 10,
      })
    );
  } catch (err) {
    console.error('Nutrition API error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Server error' }));
  }
};
