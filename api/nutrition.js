// /api/nutrition.js

// Мини-словарь RUS -> ENG для частых продуктов
const RUS_ENG_MAP = {
  'гречка': 'buckwheat',
  'батон': 'white bread',
  'белый хлеб': 'white bread',
  'хлеб': 'bread',
  'булка': 'white bread',
  'булочка': 'white bread',

  'овсянка': 'oatmeal',
  'перловка': 'barley',
  'рис': 'rice cooked',
  'картошка': 'potato boiled',
  'картофель': 'potato boiled',
  'макароны': 'pasta cooked',

  'творог': 'cottage cheese',
  'кефир': 'kefir',
  'молоко': 'milk',
  'йогурт': 'yogurt',

  'яйцо': 'egg',
  'яйца': 'egg',
  'омлет': 'omelette',

  'курица': 'chicken breast',
  'курица грудка': 'chicken breast',
  'цыпленок': 'chicken',
  'говядина': 'beef lean',
  'свинина': 'pork',
  'фарш': 'minced meat',
  'рыба': 'fish',
  'лосось': 'salmon',
  'тунец': 'tuna canned',

  'банан': 'banana',
  'яблоко': 'apple',
  'груша': 'pear',
  'апельсин': 'orange',
  'мандарин': 'mandarin',

  'огурец': 'cucumber',
  'помидор': 'tomato',
  'томат': 'tomato',
  'перец': 'bell pepper',
  'капуста': 'cabbage',
};

// Проверка: есть ли кириллица
function isCyrillic(text) {
  return /[а-яё]/i.test(text);
}

// Маппинг RU -> EN по словарю
function mapRussianToEnglish(raw) {
  let q = raw.toLowerCase().trim();
  if (!isCyrillic(q)) return q; // уже английский

  for (const [ru, en] of Object.entries(RUS_ENG_MAP)) {
    if (q.includes(ru)) {
      q = q.replace(new RegExp(ru, 'g'), en);
      break;
    }
  }
  return q;
}

module.exports = async (req, res) => {
  // Только GET
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  // query ?query=
  const query = req.query?.query;
  if (!query || typeof query !== 'string' || query.trim() === '') {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Missing query param' }));
    return;
  }

  // ключ CalorieNinjas (зарегистрируйся на calorieninjas.com)
  const apiKey = process.env.CALORIE_NINJAS_API_KEY;
  if (!apiKey) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Missing API key' }));
    return;
  }

  // 1) пробуем словарь, 2) если всё ещё кириллица — просто шлём как есть
  const englishQuery = mapRussianToEnglish(query);

  const apiUrl =
    `https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(englishQuery)}`;

  try {
    const apiRes = await fetch(apiUrl, {
      headers: { 'X-Api-Key': apiKey },
    });

    if (!apiRes.ok) {
      const status = apiRes.status;
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'CalorieNinjas error',
        status,
        debug: { original: query, english: englishQuery }
      }));
      return;
    }

    const data = await apiRes.json();
    const items = data.items || [];

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

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      kcal: Math.round(totals.kcal),
      b: Math.round(totals.b * 10) / 10,
      zh: Math.round(totals.zh * 10) / 10,
      u: Math.round(totals.u * 10) / 10,
      debug: { original: query, english: englishQuery, items: items.length }
    }));
  } catch (err) {
    console.error('Nutrition API error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Server error' }));
  }
};
