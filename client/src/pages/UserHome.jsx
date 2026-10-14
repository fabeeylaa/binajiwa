import { useEffect, useState, useCallback, useRef } from 'react';
import './UserHomeNew.css';
import './UserHomePolish.css';
import { useNavigate, Link } from 'react-router-dom';
import { Apple, Brain, Activity, Moon, BookOpen } from 'lucide-react';
import ProgressRing from '../components/ProgressRing';
import { getScreeningMood } from '../utils/screeningMood';
import { categoryLabel } from '../utils/articleCategories';

// Habit icon components (SVG inline)
const WaterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2c-2 0-3.5 1.5-3.5 3.5C8.5 7 12 12 12 12s3.5-5 3.5-6.5S14 2 12 2z" />
    <path d="M18 9c0 6-6 12-6 12s-6-6-6-12a6 6 0 0112 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

const LeafIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 8c0-2.8-2.2-5-5-5S7 5.2 7 8c0 5-4 9-4 9h12s-4-4-4-9z" />
    <path d="M8 14c-1.1 0-2 .9-2 2v4h2v-4c0-1.1-.9-2-2-2z" />
  </svg>
);

const ActivityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const TargetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const getHabitIcon = (title) => {
  const t = title.toLowerCase();
  if (t.includes('air') || t.includes('minum')) return <WaterIcon />;
  if (t.includes('tidur')) return <MoonIcon />;
  if (t.includes('meditasi') || t.includes('napas') || t.includes('jurnal') || t.includes('tenang')) return <LeafIcon />;
  if (t.includes('jalan') || t.includes('olahraga') || t.includes('gerak') || t.includes('lari')) return <ActivityIcon />;
  return <TargetIcon />;
};

const getIconClass = (title) => {
  const t = title.toLowerCase();
  if (t.includes('air') || t.includes('minum')) return 'icon-blue';
  if (t.includes('tidur')) return 'icon-yellow';
  if (t.includes('meditasi') || t.includes('napas') || t.includes('jurnal')) return 'icon-teal';
  if (t.includes('jalan') || t.includes('olahraga') || t.includes('gerak')) return 'icon-orange';
  return 'icon-primary';
};

const getArticleIcon = (category) => {
  const c = String(category || '').toLowerCase();
  if (c.includes('nutrisi')) return <Apple size={16} />;
  if (c.includes('tidur')) return <Moon size={16} />;
  if (c.includes('olahraga')) return <Activity size={16} />;
  if (c.includes('mental')) return <Brain size={16} />;
  return <BookOpen size={16} />;
};

const getArticleColor = (category) => {
  const c = String(category || '').toLowerCase();
  if (c.includes('nutrisi')) return 'art-green';
  if (c.includes('tidur')) return 'art-blue';
  if (c.includes('olahraga')) return 'art-orange';
  if (c.includes('mental')) return 'art-teal';
  return 'art-primary';
};

function UserHome({ user }) {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const abortRef = useRef(null);

  const fetchSummary = useCallback(async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const res = await fetch('/api/dashboard/summary', {
        credentials: 'include',
        signal: ac.signal,
      });
      if (!res.ok) throw new Error('Gagal memuat ringkasan');
      const data = await res.json();
      if (!ac.signal.aborted) {
        setSummary(data);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err);
      }
    } finally {
      if (!ac.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    // Polling setiap 10 detik untuk real-time cross-user & sinkronisasi instan
    const intervalId = setInterval(() => {
      if (!document.hidden) {
        fetchSummary();
      }
    }, 10000);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchSummary();
    };
    const onFocus = () => fetchSummary();
    const onUpdate = () => fetchSummary();

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);
    window.addEventListener('habits:updated', onUpdate);
    window.addEventListener('screening:submitted', onUpdate);

    return () => {
      clearInterval(intervalId);
      abortRef.current?.abort();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('habits:updated', onUpdate);
      window.removeEventListener('screening:submitted', onUpdate);
    };
  }, [fetchSummary]);

  const weekData = summary?.weekly?.length > 0 ? summary.weekly : [
    { day: 'Sen', value: 0 },
    { day: 'Sel', value: 0 },
    { day: 'Rab', value: 0 },
    { day: 'Kam', value: 0 },
    { day: 'Jum', value: 0 },
    { day: 'Sab', value: 0 },
    { day: 'Min', value: 0 },
  ];
  const todayIndex = weekData.length - 1;
  const maxWeek = Math.max(...weekData.map(d => d.value), 1);

  const healthScore = summary?.healthScore ?? 85;
  const screeningScore = summary?.screeningScore ?? null;
  const screeningMaxScore = summary?.screeningMaxScore ?? null;
  const mood = getScreeningMood(summary?.lastScreening);
  const streak = summary?.habits?.streak ?? 0;
  const displayName = (user?.name || user?.username || '').trim() || 'Teman Sehat';
  const firstName = displayName.split(' ')[0];
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 11) return 'Selamat pagi';
    if (h < 15) return 'Selamat siang';
    if (h < 18) return 'Selamat sore';
    return 'Selamat malam';
  })();

  const quickLinks = [
    {
      id: 'screening',
      label: 'Screening',
      path: '/dashboard/screening',
      iconClass: 'bg-green',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 12h6m-6 4h6M9 8h6M7 4a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2H7z" />
        </svg>
      ),
    },
    {
      id: 'history',
      label: 'Riwayat',
      path: '/dashboard/screening',
      iconClass: 'bg-orange',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      id: 'articles',
      label: 'Edukasi',
      path: '/dashboard/articles',
      iconClass: 'bg-gray',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16v16H4z" />
          <path d="M8 9h8M8 13h8M8 17h5" />
        </svg>
      ),
    },
    {
      id: 'habits',
      label: 'Tracker',
      path: '/dashboard/habits',
      iconClass: 'bg-light-green',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19V9M12 19V5M20 19v-6" />
        </svg>
      ),
    },
  ];

  const homeHabits = summary?.habits?.habitsList || [];
  const habitsDone = summary?.habits?.done ?? 0;
  const habitsTotal = summary?.habits?.total ?? 0;
  const latestArticles = summary?.latestArticles || [];

  const toggleHomeHabit = useCallback(async (id, currentlyLogged) => {
    setTogglingId(id);
    // Optimistic update
    setSummary(prev => {
      if (!prev?.habits) return prev;
      const newList = prev.habits.habitsList.map(h =>
        h.id === id ? { ...h, logged_today: !currentlyLogged } : h
      );
      const newDone = newList.filter(h => h.logged_today).length;
      const total = newList.length || prev.habits.total;
      const progressPct = total > 0 ? Math.round((newDone / total) * 100) : 0;
      return {
        ...prev,
        habits: {
          ...prev.habits,
          habitsList: newList,
          done: newDone,
          progressPct,
        },
      };
    });
    try {
      const res = await fetch(`/api/habits/${id}/log`, {
        method: currentlyLogged ? 'DELETE' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Gagal menyimpan centang');
      window.dispatchEvent(new CustomEvent('habits:updated'));
      fetchSummary();
    } catch (err) {
      console.error(err);
      // Rollback
      setSummary(prev => {
        if (!prev?.habits) return prev;
        const newList = prev.habits.habitsList.map(h =>
          h.id === id ? { ...h, logged_today: currentlyLogged } : h
        );
        const newDone = newList.filter(h => h.logged_today).length;
        const total = newList.length || prev.habits.total;
        const progressPct = total > 0 ? Math.round((newDone / total) * 100) : 0;
        return {
          ...prev,
          habits: {
            ...prev.habits,
            habitsList: newList,
            done: newDone,
            progressPct,
          },
        };
      });
    } finally {
      setTogglingId(null);
    }
  }, [fetchSummary]);

  return (
    <div className="new-dashboard">
      <div className="dash-greeting">
        <h1 className="dash-greeting-title">{greeting}, {firstName}</h1>
      </div>
      <div className="dash-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input type="text" placeholder="Cari aktivitas atau artikel..." aria-label="Cari aktivitas atau artikel" />
      </div>

      <div className="dash-grid">
        <div className="dash-main">
          <div className="health-card">
            <div className="health-info">
              <h2>Skor Kesehatan Hari Ini</h2>
              <p>
                {summary?.lastScreening
                  ? `Hasil screening terakhir: ${summary.lastScreening.assessment_title} (${summary.lastScreening.category_label}).`
                  : 'Belum ada hasil screening. Lakukan screening pertama Anda untuk memantau kesehatan mental.'}
              </p>
              <div className="trend-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 7L13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/></svg>
                Peringkat #{summary?.meRank?.rank_position || '-'} di Leaderboard
              </div>
            </div>
            <div className="health-ring">
              <ProgressRing 
                value={screeningScore ?? 0} 
                total={screeningMaxScore ?? 100} 
                size={140} 
                stroke={14} 
              />
            </div>
            {mood && (
              <figure className="health-mood">
                <div className="health-mood-frame">
                  <img
                    key={mood.level}
                    src={mood.src}
                    width="400"
                    height="447"
                    alt={`Ilustrasi hasil screening terakhir: ${summary.lastScreening.category_label}`}
                  />
                </div>
                <figcaption>
                  <span>Hasil terakhir</span>
                  <strong>{summary.lastScreening.category_label}</strong>
                </figcaption>
              </figure>
            )}
          </div>
        </div>

        <div className="dash-side">
          <h3>Akses Cepat</h3>
          <div className="quick-links">
            {quickLinks.map(link => (
              <button key={link.id} className="q-link" onClick={() => navigate(link.path)}>
                <div className={`q-icon ${link.iconClass}`}>{link.icon}</div>
                <span>{link.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="habit-home-card">
          <div className="habit-home-head">
            <h3>Habit Tracker</h3>
            <button className="see-all habit-home-seeall" onClick={() => navigate('/dashboard/habits')}>
              Lihat Semua
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="habit-home-body">
            <div className="habit-home-ring">
              <ProgressRing value={habitsDone} total={habitsTotal || 1} size={80} stroke={8} />
              <span className="habit-home-count">{habitsDone}/{habitsTotal} kebiasaan selesai</span>
            </div>
            {homeHabits.length === 0 ? (
              <div className="habit-home-empty">
                <p>Belum ada habit. Mulai catat kebiasaanmu sekarang.</p>
                <button onClick={() => navigate('/dashboard/habits')}>Buat Habit</button>
              </div>
            ) : (
              <ul className="habit-home-list">
                {homeHabits.map(h => (
                  <li key={h.id} className={`habit-home-item ${h.logged_today ? 'done' : ''}`}>
                    <div className={`habit-home-icon ${getIconClass(h.title)}`}>{getHabitIcon(h.title)}</div>
                    <span className="habit-home-title">{h.title}</span>
                    <button
                      className={`habit-home-check ${h.logged_today ? 'done' : ''}`}
                      onClick={() => toggleHomeHabit(h.id, h.logged_today)}
                      disabled={togglingId === h.id}
                      aria-label={h.logged_today ? 'Batalkan habit' : 'Selesaikan habit'}
                    >
                      {h.logged_today && <CheckIcon />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="article-home-card">
          <div className="article-home-head">
            <h3>Rekomendasi Artikel Untukmu</h3>
            <button className="see-all" onClick={() => navigate('/dashboard/articles')}>
              Lihat Semua
            </button>
          </div>
          {latestArticles.length === 0 ? (
            <div className="article-home-empty">
              <p>Belum ada artikel.</p>
            </div>
          ) : (
            <div className="article-home-list">
              {latestArticles.slice(0, 3).map(article => (
                <Link key={article.id} to={`/dashboard/articles/${article.slug}`} className="article-home-row">
                  <div className={`article-home-thumb ${getArticleColor(article.category)}`}>
                    {article.cover_image ? (
                      <img src={article.cover_image} alt="" loading="lazy" />
                    ) : (
                      getArticleIcon(article.category)
                    )}
                  </div>
                  <div className="article-home-info">
                    <h4>{article.title}</h4>
                    <span className={`article-tag ${getArticleColor(article.category)}`}>{categoryLabel(article.category)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="dash-bottom">
          <div className="bottom-head">
            <h3>Aktivitas Mingguan</h3>
            <button className="see-all" onClick={() => navigate('/dashboard/habits')}>
              Lihat Semua
            </button>
          </div>
          <div className="activity-chart">
            {weekData.map((item, i) => {
              const isToday = i === todayIndex;
              return (
                <div key={item.day} className="chart-bar-wrap">
                  <div className="chart-bg">
                    <div
                      className={`chart-fill ${isToday ? 'is-today' : ''}`}
                      style={{ height: `${Math.round((item.value / maxWeek) * 100)}%` }}
                      title={`${item.day}: ${item.value} aktivitas`}
                    >
                      {isToday && <div className="chart-dot"></div>}
                    </div>
                  </div>
                  <span className={isToday ? 'active-day' : ''}>{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserHome;