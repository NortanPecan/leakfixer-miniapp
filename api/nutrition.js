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

  'курица грудка': 'chicken breast',
  'курица': 'chicken breast',
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

// Маппинг русских обозначений единиц -> латиница
const UNIT_MAP = {
  'грамм': 'g',
  'граммов': 'g',
  'грамма': 'g',
  'гр': 'g',
  'г.': 'g',
  'г': 'g',

  'килограмм': 'kg',
  'килограмма': 'kg',
  'кг': 'kg',

  'миллилитр': 'ml',
  'миллилитров': 'ml',
  'миллилитра': 'ml',
  'мл': 'ml',

  'литр': 'l',
  'литра': 'l',
  'литров': 'l',
  'л': 'l',

  'шт': 'pcs',
  'шт.': 'pcs',
  'штук': 'pcs',
  'штуки': 'pcs'
};

function isCyrillic(text) {
  return /[а-яё]/i.test(text);
}

// Нормализация единиц: "200г", "200 г", "200 мл" → "200 g", "200 ml"
function normalizeUnits(raw) {
  let q = raw.toLowerCase();

  // Случай слепленных: 200г, 150мл
  q = q.replace(/(\d+)\s*г\b/gi, '$1 g');
  q = q.replace(/(\d+)\s*гр\b/gi, '$1 g');
  q = q.replace(/(\d+)\s*кг\b/gi, '$1 kg');
  q = q.replace(/(\d+)\s*мл\b/gi, '$1 ml');
  q = q.replace(/(\d+)\s*л\b/gi, '$1 l');
  q = q.replace(/(\d+)\s*шт\b/gi, '$1 pcs');

  // Текстовые варианты
  for (const [ru, en] of Object.entries(UNIT_MAP)) {
    const re = new RegExp(`\\b${ru}\\b`, 'g');
    q = q.replace(re, en);
  }

  return q;
}

// Маппинг RU -> EN продуктов + нормализация единиц
function mapRussianToEnglish(raw) {
  let q = raw.toLowerCase().trim();

  // сначала нормализуем единицы
  q = normalizeUnits(q);

  if (!isCyrillic(q)) return q; // уже английский

  // потом продукты
  for (const [ru, en] of Object.entries(RUS_ENG_MAP)) {
    if (q.includes(ru)) {
      q = q.replace(new RegExp(ru, 'g'), en);
      break;
    }
  }
  return q;
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const query = req.query?.query;
  if (!query || typeof query !== 'string' || query.trim() === '') {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Missing query param' }));
    return;
  }

  const apiKey = process.env.CALORIE_NINJAS_API_KEY;
  if (!apiKey) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Missing API key' }));
    return;
  }

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
