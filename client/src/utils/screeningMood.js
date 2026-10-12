import minimal from '../assets/screening/mood-minimal.png';
import ringan from '../assets/screening/mood-ringan.png';
import sedang from '../assets/screening/mood-sedang.png';
import sedangBerat from '../assets/screening/mood-sedang-berat.png';
import berat from '../assets/screening/mood-berat.png';

// Urutan dari kondisi paling baik ke paling berat
const MOODS = [
  { level: 'minimal', src: minimal },
  { level: 'ringan', src: ringan },
  { level: 'sedang', src: sedang },
  { level: 'sedang-berat', src: sedangBerat },
  { level: 'berat', src: berat },
];

// Label kategori yang langsung punya ilustrasi (PHQ-9 dan GAD-7)
const DIRECT = {
  minimal: 0,
  ringan: 1,
  sedang: 2,
  'sedang-berat': 3,
  berat: 4,
};

// Cadangan kalau skor maksimum tidak tersedia (Student Wellness Check)
const WELLNESS_FALLBACK = {
  baik: 0,
  'perlu perhatian': 2,
  'disarankan konsultasi': 4,
};

// Batas atas tiap tingkat sebagai proporsi skor terhadap skor maksimum.
// Dengan batas ini, Student Wellness Check (maks 24) jatuh ke:
//   0-3 minimal, 4-8 ringan, 9-12 sedang, 13-16 sedang-berat, 17-24 berat
// sehingga tetap sejalan dengan kategori Baik / Perlu perhatian / Disarankan konsultasi.
const RATIO_LIMITS = [0.15, 0.34, 0.53, 0.706];

/**
 * Memilih ilustrasi untuk hasil screening terakhir.
 * @param {{ total_score: number, max_score?: number, category_label: string } | null} result
 * @returns {{ level: string, src: string } | null}
 */
export function getScreeningMood(result) {
  if (!result) return null;

  const label = String(result.category_label || '').trim().toLowerCase();
  let index = DIRECT[label];

  if (index === undefined) {
    const total = Number(result.total_score);
    const max = Number(result.max_score);
    if (Number.isFinite(total) && max > 0) {
      const ratio = total / max;
      const found = RATIO_LIMITS.findIndex((limit) => ratio <= limit);
      index = found === -1 ? MOODS.length - 1 : found;
    } else {
      index = WELLNESS_FALLBACK[label];
    }
  }

  return index === undefined ? null : MOODS[index];
}