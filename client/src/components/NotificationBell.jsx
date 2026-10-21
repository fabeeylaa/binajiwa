import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, UserPlus, Check, Trash2, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import './NotificationBell.css';

const TIME_FORMAT = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

function NotificationIcon({ type }) {
  if (type === 'friend_request') return <UserPlus size={16} />;
  if (type === 'challenge_checkin') return <Check size={16} />;
  return <Bell size={16} />;
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markRead,
    deleteNotif,
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const goTo = (link, id) => {
    setOpen(false);
    setHistoryOpen(false);
    if (id && !notifications.find((n) => n.id === id)?.is_read) markRead(id);
    navigate(link || '/dashboard/social');
  };

  const recent = notifications.slice(0, 6);

  return (
    <div className="nb-root" ref={dropdownRef}>
      <button
        className="nb-bell"
        aria-label="Notifikasi"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) fetchNotifications();
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="nb-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="nb-dropdown">
          <div className="nb-header">
            <h4>Notifikasi</h4>
            <div className="nb-header-actions">
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="nb-link"
                  onClick={() => markRead()}
                >
                  Tandai semua dibaca
                </button>
              )}
              <button
                className="nb-close"
                onClick={() => setOpen(false)}
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {loading ? (
            <p className="nb-empty">Memuat...</p>
          ) : recent.length === 0 ? (
            <p className="nb-empty">Belum ada notifikasi.</p>
          ) : (
            recent.map((n) => (
              <div
                key={n.id}
                className={`nb-item ${n.is_read ? '' : 'is-unread'}`}
                onClick={() => goTo(n.link, n.id)}
              >
                <span className="nb-avatar">
                  {n.actor_avatar ? (
                    <img src={n.actor_avatar} alt="" />
                  ) : (
                    <span className="nb-avatar-fallback">
                      {(n.actor_name || n.actor_username || '?').charAt(0).toUpperCase()}
                    </span>
                  )}
                </span>
                <div className="nb-text">
                  <div className="nb-title">{n.title || 'Notifikasi'}</div>
                  <div className="nb-message">{n.message}</div>
                  <div className="nb-time">{TIME_FORMAT(n.created_at)}</div>
                </div>
                {!n.is_read && <span className="nb-dot" />}
                <button
                  className="nb-delete"
                  aria-label="Hapus notifikasi"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotif(n.id);
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}

          <div className="nb-footer">
            <button
              className="nb-link"
              onClick={() => {
                setOpen(false);
                setHistoryOpen(true);
              }}
            >
              Lihat semua notifikasi
            </button>
          </div>
        </div>
      )}

      {historyOpen && (
        <div className="nb-modal-overlay" onClick={() => setHistoryOpen(false)}>
          <div
            className="nb-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="nb-modal-head">
              <h3>Semua Notifikasi</h3>
              <div className="nb-modal-actions">
                {unreadCount > 0 && (
                  <button className="nb-link" onClick={() => markRead()}>
                    Tandai semua dibaca
                  </button>
                )}
                <button
                  className="nb-close"
                  onClick={() => setHistoryOpen(false)}
                  aria-label="Tutup"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {loading ? (
              <p className="nb-empty">Memuat...</p>
            ) : notifications.length === 0 ? (
              <p className="nb-empty">Belum ada notifikasi.</p>
            ) : (
              <div className="nb-modal-list">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`nb-item is-row ${n.is_read ? '' : 'is-unread'}`}
                    onClick={() => goTo(n.link, n.id)}
                  >
                    <span className={`nb-type-icon type-${n.type}`}>
                      <NotificationIcon type={n.type} />
                    </span>
                    <div className="nb-text">
                      <div className="nb-title">{n.title || 'Notifikasi'}</div>
                      <div className="nb-message">{n.message}</div>
                      <div className="nb-time">{TIME_FORMAT(n.created_at)}</div>
                    </div>
                    <button
                      className="nb-delete"
                      aria-label="Hapus notifikasi"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotif(n.id);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}