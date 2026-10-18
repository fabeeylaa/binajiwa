// Hitung streak dari kumpulan tanggal (string 'YYYY-MM-DD' atau Date).
// Semua perhitungan memakai string tanggal + aritmetika UTC murni, jadi hasilnya
// tidak bergantung zona waktu server. (Versi lama memakai setHours() lokal lalu
// toISOString() UTC, sehingga di WIB "hari ini" terbaca sebagai kemarin dan
// streak ikut salah.)
const pad = (n) => String(n).padStart(2, "0");

const toDateStr = (d) => {
  if (typeof d === "string") return d.slice(0, 10);
  // Date dari driver pg (kalau parser DATE tidak dipasang): pakai komponen lokal.
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const shiftDay = (dateStr, delta) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + delta));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
};

export function calculateStreak(logDates, todayStr = toDateStr(new Date())) {
  if (!logDates || logDates.length === 0) return 0;

  // buang null/undefined (mis. ARRAY_AGG dari LEFT JOIN tanpa data berisi [null])
  const days = new Set(logDates.filter(Boolean).map(toDateStr));

  // Streak tetap hidup kalau hari ini belum dicatat tapi kemarin sudah.
  let cursor = days.has(todayStr) ? todayStr : shiftDay(todayStr, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor = shiftDay(cursor, -1);
  }
  return streak;
}
