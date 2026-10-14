import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Check,
  Trash2,
  X,
  Flame,
  Droplet,
  Moon,
  Leaf,
  Sprout,
} from "lucide-react";
import "./Dashboard.css";
import "./HabitsPolish.css";

const SUGGESTIONS = [
  "Tidur 7-8 jam",
  "Minum 8 gelas air",
  "Jalan kaki 15 menit",
  "Menulis jurnal singkat",
  "Napas dalam 5 menit",
  "Kurangi scroll sebelum tidur",
];

// Ikon bergantian per habit, warna hijau selaras dashboard (tidak ada kolom kategori di DB)
const TONES = [
  { Icon: Droplet, bg: "var(--sage-tint)", fg: "var(--forest)" },
  { Icon: Moon, bg: "var(--soft-sage)", fg: "var(--forest)" },
  { Icon: Leaf, bg: "var(--white)", fg: "var(--forest)" },
];

function progressMessage(done, total) {
  if (total === 0) return "Belum ada habit. Pilih satu di samping untuk mulai.";
  if (done === 0) return "Mulai dari satu habit kecil.";
  if (done < total) return "Bagus, lanjutkan pelan-pelan.";
  return "Semua selesai. Terima kasih sudah merawat dirimu.";
}

function UserHabits() {
  const [habits, setHabits] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [adding, setAdding] = useState(null);
  const [freshId, setFreshId] = useState(null); // habit yang baru ditambahkan
  const [popId, setPopId] = useState(null); // habit yang baru saja dicentang
  // Jumlah hari berturut-turut agar api streak menyala (diatur server)
  const [streakTarget, setStreakTarget] = useState(7);

  const fetchWeekly = useCallback(async () => {
    const res = await fetch("/api/habits/weekly", { credentials: "include" });
    const data = await res.json();
    setWeekly(data.weekly || []);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const habitsRes = await fetch("/api/habits", { credentials: "include" });
      const habitsData = await habitsRes.json();
      setHabits(habitsData.habits || []);
      if (habitsData.streak_target) setStreakTarget(habitsData.streak_target);
      await fetchWeekly();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fetchWeekly]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleHabit = async (id, currentlyLogged) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, logged_today: !currentlyLogged } : h,
      ),
    );
    if (!currentlyLogged) {
      setPopId(id);
      setTimeout(() => setPopId(null), 1000);
    }
    try {
      const res = await fetch(`/api/habits/${id}/log`, {
        method: currentlyLogged ? "DELETE" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Gagal menyimpan centang");
      await fetchData();
      window.dispatchEvent(new CustomEvent("habits:updated"));
    } catch (err) {
      console.error(err);
      setHabits((prev) =>
        prev.map((h) =>
          h.id === id ? { ...h, logged_today: currentlyLogged } : h,
        ),
      );
    }
  };

  const deleteHabit = async (id) => {
    if (!window.confirm("Hapus habit ini?")) return;
    try {
      await fetch(`/api/habits/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setHabits((prev) => prev.filter((h) => h.id !== id));
      fetchWeekly();
    } catch (err) {
      console.error(err);
    }
  };

  const createHabit = async (title) => {
    const res = await fetch("/api/habits", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, frequency: "daily" }),
    });
    if (!res.ok) throw new Error("Gagal menambah habit");
    const data = await res.json();
    if (data.habit) {
      setHabits((prev) => [
        {
          ...data.habit,
          logged_today: false,
          week_count: 0,
          streak: 0,
          streak_active: false,
        },
        ...prev,
      ]);
      setFreshId(data.habit.id);
      setTimeout(() => setFreshId(null), 1600);
    }
  };

  const quickAdd = async (title) => {
    setAdding(title);
    try {
      await createHabit(title);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(null);
    }
  };

  const addHabit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSubmitting(true);
    try {
      await createHabit(newTitle.trim());
      setNewTitle("");
      setShowModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
  return (
    <div className="tab-panel habits-page">
      <p className="habits-muted">Memuat habit tracker...</p>
    </div>
  );

  const doneCount = habits.filter((h) => h.logged_today).length;
  const totalHabits = habits.length;
  const pct = totalHabits > 0 ? doneCount / totalHabits : 0;
  const daysLogged = weekly.filter((d) => d.value > 0).length;
  const bestStreak = Math.max(0, ...habits.map((h) => h.streak || 0));
  const chartMax = Math.max(totalHabits, ...weekly.map((d) => d.value), 1);

  const existingTitles = new Set(
    habits.map((h) => h.title.trim().toLowerCase()),
  );
  const availableSuggestions = SUGGESTIONS.filter(
    (s) => !existingTitles.has(s.toLowerCase()),
  );

  const todayLabel = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const R = 54;
  const C = 2 * Math.PI * R;

  return (
    <div className="tab-panel habits-page">
      <header className="habits-head">
        <div>
          <div className="habits-date">{todayLabel}</div>
          <h2 className="habits-title">Habit Tracker</h2>
          <p className="habits-sub">
            Pelan-pelan saja. Satu langkah kecil hari ini sudah cukup.
          </p>
        </div>
        <button
          type="button"
          className="habits-btn"
          onClick={() => setShowModal(true)}
        >
          <Plus size={18} /> Buat Habit Sendiri
        </button>
      </header>

      <div className="habits-grid">
        {/* ===== Kolom kiri ===== */}
        <section className="habits-col">
          <div className="habits-card">
            <div className="habits-card-head">
              <h3>Daftar Hari Ini</h3>
              <span className="habits-muted">
                {doneCount} dari {totalHabits} selesai
              </span>
            </div>

            {totalHabits === 0 ? (
              <div className="habits-empty">
                <Sprout size={36} strokeWidth={1.4} />
                <p>Belum ada habit. Pilih rekomendasi di bawah atau buat sendiri.</p>
              </div>
            ) : (
              <ul className="habits-list">
                {habits.map((habit, i) => {
                  const { Icon, bg, fg } = TONES[i % TONES.length];
                  const streak = habit.streak || 0;
                  const lit = Boolean(habit.streak_active);
                  return (
                    <li
                      key={habit.id}
                      className={`habits-habit ${habit.logged_today ? "is-done" : ""} ${freshId === habit.id ? "is-new" : ""} ${popId === habit.id ? "is-pop" : ""}`}
                    >
                      <button
                        type="button"
                        className="habits-check"
                        aria-pressed={Boolean(habit.logged_today)}
                        aria-label={`Tandai ${habit.title} ${habit.logged_today ? "belum selesai" : "selesai"}`}
                        onClick={() => toggleHabit(habit.id, habit.logged_today)}
                      >
                        <Check size={20} strokeWidth={3} />
                      </button>
                      <div className="habits-icon" style={{ background: bg, color: fg }}>
                        <Icon size={22} />
                      </div>
                      <div className="habits-habit-text">
                        <div className="habits-habit-name">{habit.title}</div>
                        <div className="habits-habit-meta">
                          <span>Harian</span>
                          <span aria-hidden="true">&middot;</span>
                          <span>{habit.week_count || 0}/7 minggu ini</span>
                        </div>
                      </div>
                      <span
                        className={`habits-streak-pill ${lit ? "is-lit" : ""}`}
                        title={
                          lit
                            ? `Streak ${streak} hari berturut-turut`
                            : `Selesaikan ${streakTarget} hari berturut-turut untuk menyalakan api`
                        }
                      >
                        <Flame size={13} />
                        {lit ? `${streak} hari` : `${streak}/${streakTarget}`}
                      </span>
                      <button
                        type="button"
                        className="habits-delete"
                        onClick={() => deleteHabit(habit.id)}
                        aria-label={`Hapus ${habit.title}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {availableSuggestions.length > 0 && (
            <div className="habits-card">
              <h3>Tambah cepat</h3>
              <p className="habits-muted habits-note">
                Sekali klik, langsung masuk ke daftar hari ini.
              </p>
              <div className="habits-chips">
                {availableSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="habits-chip"
                    disabled={adding !== null}
                    onClick={() => quickAdd(s)}
                  >
                    {adding === s ? "Menambahkan..." : `+ ${s}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {weekly.length > 0 && (
            <div className="habits-card habits-card--chart">
              <div className="habits-card-head">
                <div>
                  <h3>Tren 7 Hari Terakhir</h3>
                  <p className="habits-muted habits-note habits-note--tight">
                    Jumlah habit yang dicentang per hari
                  </p>
                </div>
                <span className="habits-muted habits-strong">
                  Maks. {chartMax} habit per hari
                </span>
              </div>
              <div
                className="habits-bars"
                role="img"
                aria-label={`Grafik batang: ${weekly.map((d) => `${d.day} ${d.value}`).join(", ")}`}
              >
                {weekly.map((d, i) => (
                  <div
                    key={d.date}
                    className={`habits-bar-col ${i === weekly.length - 1 ? "is-today" : ""}`}
                  >
                    <span className={`habits-bar-num ${d.value === 0 ? "is-zero" : ""}`}>
                      {d.value}
                    </span>
                    <span
                      className={`habits-bar ${d.value === 0 ? "is-zero" : ""}`}
                      style={
                        d.value > 0
                          ? { height: `${(d.value / chartMax) * 110}px` }
                          : undefined
                      }
                    />
                  </div>
                ))}
              </div>
              <div className="habits-bar-labels">
                {weekly.map((d, i) => (
                  <span
                    key={d.date}
                    className={i === weekly.length - 1 ? "is-today" : ""}
                  >
                    {i === weekly.length - 1 ? `${d.day} · hari ini` : d.day}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ===== Kolom kanan ===== */}
        <aside className="habits-col">
          <div className="habits-card habits-progress">
            <div className={`habits-ring ${totalHabits > 0 && pct === 1 ? "is-complete" : ""}`}>
              <svg
                width="132"
                height="132"
                viewBox="0 0 132 132"
                role="img"
                aria-label={`Progress hari ini ${doneCount} dari ${totalHabits}`}
              >
                <circle cx="66" cy="66" r={R} className="habits-ring-track" />
                <circle
                  cx="66"
                  cy="66"
                  r={R}
                  className="habits-ring-fill"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - pct)}
                  transform="rotate(-90 66 66)"
                />
              </svg>
              <div className="habits-ring-label">
                <strong>
                  {doneCount}/{totalHabits}
                </strong>
                <span>selesai</span>
              </div>
            </div>
            <p className="habits-progress-msg">
              {progressMessage(doneCount, totalHabits)}
            </p>
            <p className="habits-muted">Tidak ada yang tertinggal. Hari ini baru dimulai.</p>
          </div>

          {weekly.length > 0 && (
            <div className="habits-card">
              <div className="habits-card-head habits-card-head--tight">
                <h3 className="habits-h-sm">Minggu ini</h3>
                <span className="habits-muted">{daysLogged} hari tercatat</span>
              </div>
              <div className="habits-week">
                {weekly.map((d, i) => {
                  const isToday = i === weekly.length - 1;
                  return (
                    <div key={d.date} className="habits-week-day">
                      <span className={isToday ? "is-today" : ""}>{d.day}</span>
                      <span
                        className={`habits-week-dot ${d.value > 0 ? "is-on" : ""} ${isToday ? "is-today" : ""}`}
                      >
                        {d.value > 0 && <Check size={16} strokeWidth={3} />}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="habits-streak">
            <div className="habits-streak-icon">
              <Leaf size={22} />
            </div>
            <div>
              <div className="habits-streak-title">
                {bestStreak > 0
                  ? `${bestStreak} hari beruntun`
                  : "Streak baru dimulai hari ini"}
              </div>
              <div className="habits-muted">
                {bestStreak > 0
                  ? "Streak habit terpanjangmu saat ini."
                  : "Selesaikan satu habit untuk memulainya."}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Modal Buat Sendiri */}
      {showModal && (
        <div
          className="habit-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div className="habit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="habit-modal-head">
              <h3>Buat Habit Sendiri</h3>
              <button
                className="habit-modal-close"
                onClick={() => setShowModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={addHabit}>
              <label className="habit-form-label">
                Nama Habit
                <input
                  type="text"
                  placeholder="Contoh: Minum 8 gelas air"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                />
              </label>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !newTitle.trim()}
              >
                {submitting ? "Menambahkan..." : "Tambah Habit"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserHabits;