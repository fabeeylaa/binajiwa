import { useEffect, useState, useRef } from 'react';
import '../pages/Dashboard.css';
import './UserSocial.css';
import './ChallengeNew.css';
import './FriendsNew.css';
import './LeaderboardNew.css';
import './UserSocialPolish.css';
import { Flame, Check, CalendarDays, Users, Plus, X, Clock, Trophy, Brain, Moon, Apple, Dumbbell, Bell, UserPlus, Send, CircleCheck, CircleX } from 'lucide-react';

function Leaderboard() {
  const [scope, setScope] = useState('global'); // 'global' | 'friends'
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    const url =
      scope === 'friends'
        ? '/api/social/leaderboard?scope=friends'
        : '/api/social/leaderboard';

    fetch(url, { credentials: 'include' })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Gagal memuat leaderboard');
        setRows(Array.isArray(data) ? data : []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [scope]);

  const me = rows.find((r) => r.is_me);
  const showPodium = rows.length >= 3;
  const podium = showPodium ? [rows[1], rows[0], rows[2]] : [];
  const rest = showPodium ? rows.slice(3) : rows;

  return (
    <div className="lb-wrap">
      <div className="card lb-head">
        <div>
          <h3>Leaderboard</h3>
          <p className="hint" style={{ marginBottom: 0 }}>
            Diurutkan dari streak tertinggi
          </p>
        </div>
        <div className="lb-seg">
          <button
            type="button"
            className={scope === 'global' ? 'on' : ''}
            onClick={() => setScope('global')}
          >
            Global
          </button>
          <button
            type="button"
            className={scope === 'friends' ? 'on' : ''}
            onClick={() => setScope('friends')}
          >
            Teman
          </button>
        </div>
      </div>

      {error && <div className="soc-error">{error}</div>}
      {loading && <p className="hint">Memuat...</p>}

      {!loading && !error && rows.length === 0 && (
        <div className="card lb-empty">
          <Trophy size={40} strokeWidth={1.2} />
          <p>
            {scope === 'friends'
              ? 'Belum ada teman di leaderboard. Tambahkan teman dulu!'
              : 'Belum ada data.'}
          </p>
        </div>
      )}

      {!loading && me && (
        <div className="card lb-me">
          <Avatar seed={me.username} name={me.name} avatar={me.avatar_url} size={56} />
          <div className="lb-me-text">
            <div className="lb-me-label">Peringkatmu</div>
            <div className="lb-me-rank">#{me.rank_position}</div>
          </div>
          <div className="lb-me-stats">
            <span className="soc-pill soc-pill-streak">
              <Flame size={15} /> {me.current_streak} hari
            </span>
            <span className="soc-pill soc-pill-done">
              <Check size={15} /> {me.total_habits_completed} selesai
            </span>
          </div>
        </div>
      )}

      {!loading && showPodium && (
        <div className="card lb-podium">
          {podium.map((r) => (
            <div
              key={r.user_id}
              className={`lb-pod lb-pod-${r.rank_position} ${r.is_me ? 'me' : ''}`}
            >
              {r.rank_position === 1 && <Trophy className="lb-crown" size={22} />}
              <Avatar seed={r.username} name={r.name} avatar={r.avatar_url} size={r.rank_position === 1 ? 72 : 58} />
              <div className="lb-pod-name">
                {r.name}
                {r.is_me ? ' (Kamu)' : ''}
              </div>
              <div className="lb-pod-sub">@{r.username}</div>
              <div className="lb-pod-streak">
                <Flame size={14} /> {r.current_streak} hari
              </div>
              <div className="lb-pod-base">{r.rank_position}</div>
            </div>
          ))}
        </div>
      )}

      {!loading && rest.length > 0 && (
        <div className="card lb-list">
          {rest.map((r) => (
            <div key={r.user_id} className={`lb-row ${r.is_me ? 'me' : ''}`}>
              <div className="lb-rank">{r.rank_position}</div>
              <Avatar seed={r.username} name={r.name} avatar={r.avatar_url} size={44} />
              <div className="lb-row-text">
                <div className="soc-name">
                  {r.name}
                  {r.is_me ? ' (Kamu)' : ''}
                </div>
                <div className="soc-sub">@{r.username}</div>
              </div>
              <span className="soc-pill soc-pill-streak">
                <Flame size={15} /> {r.current_streak} hari
              </span>
              <span className="soc-pill soc-pill-done">
                <Check size={15} /> {r.total_habits_completed} selesai
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Avatar({ seed, name, avatar, size = 46 }) {
  const [failed, setFailed] = useState(false);
  const initial = (name || seed || '?').charAt(0).toUpperCase();
  if (failed) {
    return (
      <span className="fr-avatar fr-avatar-fallback" style={{ width: size, height: size }}>
        {initial}
      </span>
    );
  }
  return (
    <img
      className="fr-avatar"
      width={size}
      height={size}
      alt=""
      src={avatar || `https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(seed || name || 'x')}`}
      onError={() => setFailed(true)}
    />
  );
}

function Friends() {
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [sending, setSending] = useState(false);
  const [adding, setAdding] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef(null);

  const load = () => {
    Promise.all([
      fetch('/api/social/friends', { credentials: 'include' }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Gagal memuat teman');
        return Array.isArray(data) ? data : [];
      }),
      fetch('/api/social/leaderboard', { credentials: 'include' })
        .then((res) => (res.ok ? res.json() : []))
        .catch(() => []),
    ])
      .then(([f, board]) => {
        setFriends(f);
        const known = new Set(f.map((x) => x.username));
        const recs = (Array.isArray(board) ? board : [])
          .filter((r) => !r.is_me && !known.has(r.username))
          .slice(0, 5);
        setSuggestions(recs);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addFriend = async (value) => {
    const res = await fetch('/api/social/friends/add', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal mengirim permintaan');
  };

  const sendRequest = async (e) => {
    e.preventDefault();
    const value = identifier.trim();
    if (!value) return;
    setSending(true);
    setError('');
    setInfo('');
    try {
      await addFriend(value);
      setInfo('Permintaan pertemanan terkirim.');
      setIdentifier('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const quickAdd = async (username) => {
    setAdding(username);
    setError('');
    setInfo('');
    try {
      await addFriend(username);
      setInfo(`Permintaan ke @${username} terkirim.`);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding('');
    }
  };

  const respond = async (id, action) => {
    setError('');
    setInfo('');
    try {
      const res = await fetch(`/api/social/friends/${id}/respond`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal merespon permintaan');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const incoming = friends.filter((f) => f.status === 'pending' && f.direction === 'incoming');
  const outgoing = friends.filter((f) => f.status === 'pending' && f.direction === 'outgoing');
  const accepted = friends.filter((f) => f.status === 'accepted');

  return (
    <div className="fr-wrap">
      <div className="fr-topbar">
        <div className="fr-bell-wrap" ref={dropdownRef}>
          <button
            className="fr-bell-btn"
            aria-label="Permintaan masuk"
            onClick={() => setNotifOpen(o => !o)}
          >
            <Bell size={20} />
            {incoming.length > 0 && <span className="fr-bell-badge">{incoming.length}</span>}
          </button>
          {notifOpen && (
            <div className="fr-notif-dropdown">
              <div className="fr-notif-header">
                <h4>Permintaan Masuk</h4>
                <button className="fr-notif-close" onClick={() => setNotifOpen(false)}>&times;</button>
              </div>
              {incoming.length === 0 ? (
                <p className="fr-empty">Tidak ada permintaan masuk.</p>
              ) : (
                incoming.slice(0, 5).map(f => (
                  <div key={f.id} className="fr-notif-item">
                    <Avatar seed={f.username} name={f.name} avatar={f.avatar_url} size={44} />
                    <div className="fr-notif-text">
                      <div className="fr-notif-name">{f.name}</div>
                      <div className="fr-sub">@{f.username}</div>
                    </div>
                    <div className="soc-btns">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => respond(f.id, 'accept')}
                      >
                        Terima
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => respond(f.id, 'reject')}
                      >
                        Tolak
                      </button>
                    </div>
                  </div>
                ))
              )}
              <div className="fr-notif-footer">
                <button
                  className="fr-notif-link"
                  onClick={() => {
                    setNotifOpen(false);
                    document.getElementById('incoming-requests')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  Lihat semua
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && <div className="soc-error">{error}</div>}
      {info && <div className="soc-info">{info}</div>}

      <div className="fr-layout">
        <div className="fr-col">
          <div className="card">
            <h3>Tambah Teman</h3>
            <p className="hint">Masukkan username atau email temanmu</p>
            <form onSubmit={sendRequest} className="fr-form">
              <div className="fr-input-wrap">
                <input
                  type="text"
                  placeholder="Username atau email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
                <UserPlus size={18} />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={sending || !identifier.trim()}
              >
                <Send size={15} /> {sending ? 'Mengirim...' : 'Kirim'}
              </button>
            </form>
          </div>

          <div className="card">
            <h3>Rekomendasi Teman</h3>
            <p className="hint">Pengguna lain yang bisa kamu ajak</p>
            {loading ? (
              <p className="hint">Memuat...</p>
            ) : suggestions.length === 0 ? (
              <p className="fr-empty">Belum ada rekomendasi saat ini.</p>
            ) : (
              <div className="fr-sug-list">
                {suggestions.map((s) => (
                  <div className="fr-sug" key={s.user_id}>
                    <Avatar seed={s.username} name={s.name} avatar={s.avatar_url} size={52} />
                    <div className="fr-sug-name">{s.name}</div>
                    <div className="fr-sub">@{s.username}</div>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={adding === s.username}
                      onClick={() => quickAdd(s.username)}
                    >
                      {adding === s.username ? '...' : 'Tambahkan'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {incoming.length > 0 && (
            <div className="card" id="incoming-requests" style={{ scrollMarginTop: '80px' }}>
              <h3>Permintaan Masuk</h3>
              {incoming.map((f) => (
                <div className="fr-item" key={f.id}>
                  <Avatar seed={f.username} name={f.name} avatar={f.avatar_url} />
                  <div className="fr-item-text">
                    <div className="soc-name">{f.name}</div>
                    <div className="fr-sub">@{f.username}</div>
                  </div>
                  <div className="soc-btns">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => respond(f.id, 'accept')}
                    >
                      Terima
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => respond(f.id, 'reject')}
                    >
                      Tolak
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="fr-col">
          <div className="card">
            <div className="fr-card-head">
              <h3>Teman Kamu</h3>
              <span className="fr-count">{accepted.length} teman</span>
            </div>
            {loading && <p className="hint">Memuat...</p>}
            {!loading && accepted.length === 0 && (
              <p className="fr-empty">Belum ada teman. Kirim permintaan pertamamu!</p>
            )}
            {accepted.map((f) => (
              <div className="fr-item fr-friend" key={f.id}>
                <Avatar seed={f.username} name={f.name} avatar={f.avatar_url} />
                <div className="fr-item-text">
                  <div className="soc-name">{f.name}</div>
                  <div className="fr-sub">@{f.username}</div>
                </div>
                <span className="fr-streak">
                  <Flame size={14} /> {f.mutual_streak ?? 0} hari
                </span>
              </div>
            ))}
          </div>

          {outgoing.length > 0 && (
            <div className="card">
              <h3>Menunggu Konfirmasi</h3>
              {outgoing.map((f) => (
                <div className="fr-item" key={f.id}>
                  <Avatar seed={f.username} name={f.name} avatar={f.avatar_url} />
                  <div className="fr-item-text">
                    <div className="soc-name">{f.name}</div>
                    <div className="fr-sub">@{f.username}</div>
                  </div>
                  <span className="fr-wait">Menunggu</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Challenges() {
  const CATS = {
    'mental health': { label: 'Mental health', Icon: Brain, tone: 'purple' },
    tidur: { label: 'Tidur', Icon: Moon, tone: 'blue' },
    nutrisi: { label: 'Nutrisi', Icon: Apple, tone: 'orange' },
    olahraga: { label: 'Olahraga', Icon: Dumbbell, tone: 'green' },
  };

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    habit_type: 'mental health',
    duration_days: '7',
    description: '',
    max_participants: '',
  });

  const load = () => {
    fetch('/api/social/challenges', { credentials: 'include' })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Gagal memuat challenge');
        setItems(Array.isArray(data) ? data : []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const setField = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const createChallenge = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setInfo('');
    try {
      const body = {
        title: form.title.trim(),
        habit_type: form.habit_type,
        duration_days: parseInt(form.duration_days, 10),
        description: form.description.trim() || undefined,
        max_participants: form.max_participants
          ? parseInt(form.max_participants, 10)
          : undefined,
      };
      const res = await fetch('/api/social/challenges', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal membuat challenge');
      setInfo('Challenge berhasil dibuat.');
      setForm({ ...form, title: '', description: '', max_participants: '' });
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const join = async (id) => {
    setError('');
    setInfo('');
    try {
      const res = await fetch(`/api/social/challenges/${id}/join`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal ikut challenge');
      setInfo('Kamu berhasil ikut challenge.');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  // Check-in hari ini / batalkan. Respons server berisi challenge terbaru
  // (progres + status), jadi cukup ganti item-nya di state.
  const toggleCheckin = async (c) => {
    setBusyId(c.id);
    setError('');
    setInfo('');
    try {
      const res = await fetch(`/api/social/challenges/${c.id}/checkin`, {
        method: c.checked_today ? 'DELETE' : 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan check-in');
      setItems((prev) => prev.map((x) => (x.id === data.id ? data : x)));
      if (data.is_completed) setInfo(`Selamat! Kamu menyelesaikan challenge "${data.title}".`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const canSubmit =
    form.title.trim() && parseInt(form.duration_days, 10) > 0 && !saving;

  const shown = items.filter((c) => {
    if (filter === 'joined') return c.is_joined;
    if (filter === 'done') return c.my_status === 'completed';
    if (filter === 'open') return !c.is_joined;
    return true;
  });

  const FILTERS = [
    { id: 'all', label: 'Semua' },
    { id: 'joined', label: 'Diikuti' },
    { id: 'done', label: 'Selesai' },
    { id: 'open', label: 'Tersedia' },
  ];

  return (
    <>
      <div className="card chx-head">
        <div>
          <h3>Challenge</h3>
          <p className="hint" style={{ marginBottom: 0 }}>
            Ajak orang lain membangun kebiasaan bersama
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} /> Buat Challenge
        </button>
      </div>

      <div className="chx-filters">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`chx-filter ${filter === f.id ? 'on' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <div className="soc-error">{error}</div>}
      {info && <div className="soc-info">{info}</div>}
      {loading && <p className="hint">Memuat...</p>}

      {!loading && shown.length === 0 && (
        <div className="card chx-empty">
          <Trophy size={40} strokeWidth={1.2} />
          <p>
            {items.length === 0
              ? 'Belum ada challenge. Buat yang pertama!'
              : 'Tidak ada challenge di filter ini.'}
          </p>
        </div>
      )}

      <div className="chx-grid">
        {shown.map((c) => {
          const cat = CATS[c.habit_type] || {
            label: c.habit_type,
            Icon: Trophy,
            tone: 'green',
          };
          const full =
            c.max_participants && c.participant_count >= c.max_participants;
          // days_left dihitung server (deadline per peserta kalau sudah ikut,
          // batas pendaftaran kalau belum), jadi tidak bergantung jam browser.
          const daysLeft = c.days_left === null || c.days_left === undefined
            ? null
            : Math.max(0, c.days_left);
          const timePct =
            daysLeft !== null && c.duration_days
              ? Math.min(
                  100,
                  Math.max(
                    0,
                    Math.round(((c.duration_days - daysLeft) / c.duration_days) * 100),
                  ),
                )
              : null;
          const Icon = cat.Icon;
          return (
            <div key={c.id} className="card chx-card">
              <div className="chx-top">
                <span className={`chx-icon tone-${cat.tone}`}>
                  <Icon size={20} />
                </span>
                <span className={`chx-cat tone-${cat.tone}`}>{cat.label}</span>
                {c.my_status === 'completed' && (
                  <span className="chx-status is-done">
                    <CircleCheck size={14} /> Selesai
                  </span>
                )}
                {c.my_status === 'failed' && (
                  <span className="chx-status is-failed">
                    <CircleX size={14} /> Tidak selesai
                  </span>
                )}
                {c.my_status === 'in_progress' && (
                  <span className="chx-status is-active">Sedang berjalan</span>
                )}
              </div>

              <div className="chx-title">{c.title}</div>
              {c.description ? (
                <div className="chx-desc">{c.description}</div>
              ) : (
                <div className="chx-desc chx-desc-empty">Tanpa deskripsi</div>
              )}

              <div className="chx-chips">
                <span className="chx-chip">
                  <CalendarDays size={14} /> {c.duration_days} hari
                </span>
                <span className="chx-chip">
                  <Users size={14} /> {c.participant_count}
                  {c.max_participants ? `/${c.max_participants}` : ''} peserta
                </span>
              </div>

              {c.is_joined && (
                <div className="chx-prog">
                  <div className="chx-prog-head">
                    <span>Progres kamu</span>
                    <strong>
                      {c.my_checkins}/{c.duration_days} hari
                    </strong>
                  </div>
                  <div className={`chx-bar ${c.my_status === 'completed' ? 'is-done' : ''}`}>
                    <span
                      style={{
                        width: `${Math.round((c.my_checkins / c.duration_days) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {timePct !== null && c.my_status !== 'completed' && (
                <div className="chx-time">
                  <div className="chx-bar">
                    <span style={{ width: `${timePct}%` }} />
                  </div>
                  <div className="chx-time-text">
                    <Clock size={13} />
                    {c.is_ended
                      ? c.is_joined
                        ? 'Batas waktumu sudah lewat'
                        : 'Pendaftaran sudah ditutup'
                      : c.is_joined
                        ? daysLeft === 0
                          ? 'Batas selesai: hari ini'
                          : `Batas selesai: ${daysLeft} hari lagi`
                        : daysLeft === 0
                          ? 'Pendaftaran ditutup hari ini'
                          : `Pendaftaran ditutup ${daysLeft} hari lagi`}
                  </div>
                </div>
              )}

              <div className="chx-action">
                {c.is_joined ? (
                  c.my_status === 'completed' ? (
                    <span className="soc-pill soc-pill-done">
                      <Trophy size={15} /> Challenge selesai
                    </span>
                  ) : c.is_ended ? (
                    <span className="soc-pill chx-pill-failed">Waktu habis</span>
                  ) : (
                    <button
                      type="button"
                      className={`btn btn-sm ${c.checked_today ? 'btn-ghost chx-checked' : 'btn-primary'}`}
                      disabled={busyId === c.id}
                      onClick={() => toggleCheckin(c)}
                      title={c.checked_today ? 'Klik untuk membatalkan check-in hari ini' : undefined}
                    >
                      <Check size={15} />{' '}
                      {busyId === c.id
                        ? '...'
                        : c.checked_today
                          ? 'Sudah check-in hari ini'
                          : 'Check-in hari ini'}
                    </button>
                  )
                ) : c.is_ended ? (
                  <button type="button" className="btn btn-ghost btn-sm" disabled>
                    Berakhir
                  </button>
                ) : full ? (
                  <button type="button" className="btn btn-ghost btn-sm" disabled>
                    Penuh
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => join(c.id)}
                  >
                    Ikut
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="habit-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="habit-modal chx-modal" onClick={(e) => e.stopPropagation()}>
            <div className="habit-modal-head">
              <h3>Buat Challenge</h3>
              <button
                type="button"
                className="habit-modal-close"
                onClick={() => setShowModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={createChallenge}>
              <label className="habit-form-label">
                Judul
                <input
                  type="text"
                  maxLength={200}
                  placeholder="Contoh: Tidur 7 jam setiap hari"
                  value={form.title}
                  onChange={setField('title')}
                  autoFocus
                />
              </label>
              <label className="habit-form-label">
                Kategori
                <select value={form.habit_type} onChange={setField('habit_type')}>
                  <option value="mental health">Mental health</option>
                  <option value="tidur">Tidur</option>
                  <option value="nutrisi">Nutrisi</option>
                  <option value="olahraga">Olahraga</option>
                </select>
              </label>
              <div className="chx-row">
                <label className="habit-form-label">
                  Durasi (hari)
                  <input
                    type="number"
                    min="1"
                    value={form.duration_days}
                    onChange={setField('duration_days')}
                  />
                </label>
                <label className="habit-form-label">
                  Maks. peserta
                  <input
                    type="number"
                    min="1"
                    placeholder="Opsional"
                    value={form.max_participants}
                    onChange={setField('max_participants')}
                  />
                </label>
              </div>
              <label className="habit-form-label">
                Deskripsi
                <input
                  type="text"
                  placeholder="Opsional"
                  value={form.description}
                  onChange={setField('description')}
                />
              </label>
              <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
                {saving ? 'Menyimpan...' : 'Buat Challenge'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function UserSocial() {
  const [tab, setTab] = useState('leaderboard');

  return (
    <div className="tab-panel">
      <div className="soc-tabs">
        <button
          type="button"
          className={`btn ${tab === 'leaderboard' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('leaderboard')}
        >
          Leaderboard
        </button>
        <button
          type="button"
          className={`btn ${tab === 'friends' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('friends')}
        >
          Teman
        </button>
        <button
          type="button"
          className={`btn ${tab === 'challenges' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('challenges')}
        >
          Challenge
        </button>
      </div>

      {tab === 'leaderboard' && <Leaderboard />}
      {tab === 'friends' && <Friends />}
      {tab === 'challenges' && <Challenges />}
    </div>
  );
}

export default UserSocial;
