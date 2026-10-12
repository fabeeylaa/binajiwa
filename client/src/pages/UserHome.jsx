import { useEffect, useState, useCallback, useRef } from 'react';
import './UserHomeNew.css';
import './UserHomePolish.css';
import { useNavigate } from 'react-router-dom';
import ProgressRing from '../components/ProgressRing';

function UserHome({ user }) {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
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
      label: 'Screening\nSederhana',
      path: '/dashboard/screening',
      iconClass: 'bg-green',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 12h6m-6 4h6M9 8h6M7 4a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2H7z" />
        </svg>
      ),
    },
    {
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
                  : 'Lakukan screening pertama Anda untuk memantau kesehatan mental.'}
              </p>
              <div className="trend-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 7L13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/></svg>
                Peringkat #{summary?.meRank?.rank_position || '-'} di Leaderboard
              </div>
            </div>
            <div className="health-ring">
              <ProgressRing value={healthScore} total={100} size={140} stroke={14} />
            </div>
          </div>
        </div>

        <div className="dash-side">
          <h3>Akses Cepat</h3>
          <div className="quick-links">
            {quickLinks.map(link => (
              <button key={link.path} className="q-link" onClick={() => navigate(link.path)}>
                <div className={`q-icon ${link.iconClass}`}>{link.icon}</div>
                <span>{link.label.split('\n').map((line, i, arr) => (
                  <span key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </span>
                ))}</span>
                <svg className="q-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            ))}
          </div>
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