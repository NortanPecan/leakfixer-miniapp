const crypto = require('crypto');

function parseInitData(initData) {
  const params = new URLSearchParams(initData);
  const obj = {};
  for (const [k, v] of params.entries()) obj[k] = v;
  return obj;
}

function buildDataCheckString(initDataObj) {
  const pairs = [];
  for (const [k, v] of Object.entries(initDataObj)) {
    if (k === 'hash') continue;
    pairs.push(`${k}=${v}`);
  }
  pairs.sort();
  return pairs.join('\n');
}

function verifyInitData(initData, botToken) {
  const initObj = parseInitData(initData);
  const theirHash = initObj.hash;
  if (!theirHash) return { ok: false, reason: 'missing_hash' };

  const dataCheckString = buildDataCheckString(initObj);
  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const ourHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  const a = Buffer.from(ourHash, 'hex');
  const b = Buffer.from(theirHash, 'hex');
  if (a.length !== b.length) return { ok: false, reason: 'hash_len' };
  if (!crypto.timingSafeEqual(a, b)) return { ok: false, reason: 'hash_mismatch' };

  let user = null;
  if (initObj.user) {
    try {
      user = JSON.parse(initObj.user);
    } catch (e) {}
  }

  return { ok: true, user };
}

module.exports = async (req, res) => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Missing TELEGRAM_BOT_TOKEN env var' }));
    return;
  }

  const initData = req.headers['x-telegram-init-data'];
  if (!initData || typeof initData !== 'string') {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Missing initData' }));
    return;
  }

  const requestedUserId = Number(req.query?.user_id);
  if (!Number.isFinite(requestedUserId)) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Invalid user_id' }));
    return;
  }

  const verified = verifyInitData(initData, botToken);
  if (!verified.ok) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Invalid initData' }));
    return;
  }

  const initUserId = Number(verified.user?.id);
  if (!Number.isFinite(initUserId) || initUserId !== requestedUserId) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'User mismatch' }));
    return;
  }

  const apiBase = `https://api.telegram.org/bot${botToken}`;
  const profilePhotosUrl = `${apiBase}/getUserProfilePhotos?user_id=${encodeURIComponent(String(requestedUserId))}&limit=1`;
  const photosRes = await fetch(profilePhotosUrl);
  const photosJson = await photosRes.json();

  if (!photosJson?.ok || !photosJson?.result?.photos?.length) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.end(JSON.stringify({ photo_url: null }));
    return;
  }

  const sizes = photosJson.result.photos[0];
  const best = Array.isArray(sizes) && sizes.length ? sizes[sizes.length - 1] : null;
  const fileId = best?.file_id;
  if (!fileId) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.end(JSON.stringify({ photo_url: null }));
    return;
  }

  const fileRes = await fetch(`${apiBase}/getFile?file_id=${encodeURIComponent(fileId)}`);
  const fileJson = await fileRes.json();
  const filePath = fileJson?.ok ? fileJson?.result?.file_path : null;

  if (!filePath) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.end(JSON.stringify({ photo_url: null }));
    return;
  }

  const photoUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.end(JSON.stringify({ photo_url: photoUrl }));
};

