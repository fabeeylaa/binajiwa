import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  ShieldCheck,
  LogOut,
  Heart,
  Activity,
  Leaf,
  Sparkles,
  Flame,
  Pencil,
  Camera,
} from 'lucide-react';
import './UserProfile.css';
import './UserProfilePolish.css';

const getJson = (url) =>
  fetch(url, { credentials: 'include' })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);

function UserProfile({ user }) {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [habits, setHabits] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [latest, setLatest] = useState(null);
  const [streak, setStreak] = useState(0);
  const [loaded, setLoaded] = useState(false);
  
  const [editing, setEditing] = useState(false);
  const [localUser, setLocalUser] = useState(user);
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username || '');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const isAdmin = localUser.role === 'admin';

  const resetForm = () => {
    setName(user.name);
    setUsername(user.username || '');
    setFile(null);
    setPreview(null);
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const form = new FormData();
      form.append('name', name);
      if (file) form.append('avatar', file);
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        credentials: 'include',
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan profil');
      setLocalUser(data.user);
      setSuccess('Profil berhasil diperbarui');
      setEditing(false);
      setFile(null);
      setPreview(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setName(localUser.name);
    setUsername(localUser.username || '');
    setFile(null);
    setPreview(null);
    setError('');
    setSuccess('');
  };

  useEffect(() => {
    if (isAdmin) return;
    let alive = true;
    Promise.all([
      getJson('/api/habits'),
      getJson('/api/habits/weekly'),
      getJson('/api/assessments/history'),
      getJson('/api/social/leaderboard'),
    ]).then(([h, w, a, l]) => {
      if (!alive) return;
      setHabits(h?.habits || []);
      setWeekly(w?.weekly || []);
      setLatest(a?.history?.[0] || null);
      const me = Array.isArray(l) ? l.find((x) => x.is_me) : null;
      setStreak(me?.current_streak || 0);
      setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, [isAdmin]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } finally {
      navigate('/auth');
    }
  };

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const initial = (localUser.name || '?').charAt(0).toUpperCase();
  const roleLabel = isAdmin ? 'Admin' : 'Pengguna';

  const items = [
    { icon: <User size={20} />, label: 'Nama', value: localUser.name },
    { icon: <Mail size={20} />, label: 'Email', value: localUser.email },
    { icon: <Pencil size={18} />, label: 'Username', value: localUser.username ? `@${localUser.username}` : '-' },
  ];

  const total = habits.length;
  const done = habits.filter((h) => h.logged_today).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const R = 44;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - pct / 100);

  const maxBar = Math.max(total, ...weekly.map((d) => d.value), 1);

  return (
    <div className="card prof-card">
      <div className="prof-cover">
        <span className="prof-circle prof-circle-a"></span>
        <span className="prof-circle prof-circle-b"></span>
        <Heart className="prof-deco d1" size={38} />
        <Activity className="prof-deco d2" size={44} />
        <Leaf className="prof-deco d3" size={34} />
        <Heart className="prof-deco d4" size={26} />
        <Sparkles className="prof-deco d5" size={30} />
      </div>

      <div className="prof-body">
        <div className="prof-avatar-wrap" style={{ position: 'relative', display: 'inline-block' }}>
          {preview || localUser.avatar_url ? (
            <img
              src={preview || localUser.avatar_url}
              alt="Foto profil"
              className="prof-avatar prof-avatar-img"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className="prof-avatar">{initial}</div>
          )}
          <button
            className="prof-avatar-cam"
            onClick={() => {
              if (!editing) setEditing(true);
              fileInputRef.current?.click();
            }}
            title="Ganti foto"
            aria-label="Ganti foto profil"
          >
            <Camera size={16} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={onPickFile}
          />
        </div>
        <h2 className="prof-name">{localUser.name}</h2>

        {error && <div className="soc-error" style={{ marginTop: '10px' }}>{error}</div>}
        {success && <div className="soc-info" style={{ marginTop: '10px' }}>{success}</div>}

        {!editing ? (
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)} style={{ marginTop: '12px' }}>
              <Pencil size={14} /> Ubah profil
            </button>
            <div className="prof-grid">
              {items.map((it) => (
                <div className="prof-tile" key={it.label}>
                  <div className="prof-tile-icon">{it.icon}</div>
                  <div className="prof-tile-text">
                    <span className="prof-tile-label">{it.label}</span>
                    <span className="prof-tile-value">{it.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="prof-grid prof-grid-edit">
              <label className="prof-tile prof-input-tile">
                <div className="prof-tile-icon"><User size={20} /></div>
                <div className="prof-tile-text">
                  <span className="prof-tile-label">Nama</span>
                  <input
                    className="prof-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                  />
                </div>
              </label>
              <div className="prof-tile">
                <div className="prof-tile-icon"><Mail size={20} /></div>
                <div className="prof-tile-text">
                  <span className="prof-tile-label">Email</span>
                  <span className="prof-tile-value">{localUser.email}</span>
                </div>
              </div>
              <div className="prof-tile">
                <div className="prof-tile-icon"><Pencil size={18} /></div>
                <div className="prof-tile-text">
                  <span className="prof-tile-label">Username (tidak dapat diubah)</span>
                  <span className="prof-tile-value">@{localUser.username}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'center' }}>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={cancelEdit} disabled={saving}>
                Batal
              </button>
            </div>
          </>
        )}

        {!isAdmin && (
          <section className="prof-stats">
            <h3>Statistik &amp; Ringkasan</h3>
            {!loaded ? (
              <p className="prof-muted">Memuat statistik...</p>
            ) : (
              <div className="prof-stats-grid">
                <div className="prof-stat">
                  <div className="prof-ring">
                    <svg viewBox="0 0 100 100" width="104" height="104">
                      <circle cx="50" cy="50" r={R} className="ring-bg" />
                      <circle
                        cx="50"
                        cy="50"
                        r={R}
                        className="ring-fg"
                        strokeDasharray={C}
                        strokeDashoffset={offset}
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <span className="prof-ring-val">{pct}%</span>
                  </div>
                  <div>
                    <div className="prof-stat-label">Progress</div>
                    <div className="prof-stat-title">Habit Tracker</div>
                    <div className="prof-stat-sub">
                      {total === 0 ? 'Belum ada habit' : `${done} dari ${total} selesai hari ini`}
                    </div>
                    <div className="prof-streak">
                      <Flame size={14} /> Streak {streak} hari
                    </div>
                  </div>
                </div>

                <div className="prof-stat prof-stat-score">
                  {latest ? (
                    <>
                      <div className="prof-score-num">{latest.total_score}</div>
                      <div>
                        <div className="prof-stat-label">Skor terakhir</div>
                        <div className="prof-stat-title">{latest.category_label}</div>
                        <div className="prof-stat-sub">{latest.assessment_title}</div>
                      </div>
                    </>
                  ) : (
                    <div>
                      <div className="prof-stat-label">Skor Kesehatan Mental</div>
                      <div className="prof-stat-title">Belum ada skor</div>
                      <button
                        className="btn btn-primary btn-sm prof-cta"
                        onClick={() => navigate('/dashboard/screening')}
                      >
                        Mulai Screening
                      </button>
                    </div>
                  )}
                </div>

                <div className="prof-stat prof-stat-bars">
                  <div className="prof-bars">
                    {weekly.map((d, i) => {
                      const h = Math.max((d.value / maxBar) * 100, 6);
                      const isToday = i === weekly.length - 1;
                      return (
                        <div className="prof-bar-col" key={d.date || i} title={`${d.value} habit`}>
                          <div className="prof-bar-track">
                            <div
                              className={`prof-bar ${d.value > 0 ? 'on' : ''} ${isToday ? 'today' : ''}`}
                              style={{ height: `${h}%` }}
                            ></div>
                          </div>
                          <span className="prof-bar-day">{d.day}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="prof-stat-sub">Habit dicentang, 7 hari terakhir</div>
                </div>
              </div>
            )}
          </section>
        )}

        <button
          className="btn btn-ghost prof-logout"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          <LogOut size={18} />
          <span>{loggingOut ? 'Logout...' : 'Logout'}</span>
        </button>
      </div>
    </div>
  );
}

export default UserProfile;