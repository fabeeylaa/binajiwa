// Pembatas request sederhana (in-memory, tanpa dependensi tambahan).
// Dipakai untuk login & register supaya tidak bisa ditebak berulang-ulang.
// Catatan: counter hilang saat server restart dan tidak dibagi antar-proses;
// untuk produksi multi-instance pakai store bersama (mis. Redis).
export const rateLimit = ({ windowMs, max, message }) => {
  const hits = new Map(); // key -> { count, resetAt }

  // bersihkan entri kedaluwarsa agar Map tidak membesar
  setInterval(() => {
    const now = Date.now();
    for (const [key, v] of hits) if (v.resetAt <= now) hits.delete(key);
  }, windowMs).unref();

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }

    if (entry.count >= max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ message });
    }
    entry.count++;

    // Request yang berhasil tidak dihitung (login benar tidak memakan jatah).
    res.on('finish', () => {
      if (res.statusCode < 400 && entry.count > 0) entry.count--;
    });
    next();
  };
};
