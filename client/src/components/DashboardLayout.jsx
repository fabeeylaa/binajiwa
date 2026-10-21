import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './DashboardLayout.css';
import logoBinaJiwa from '../assets/Logoobinajiwa.jpeg';
import NotificationBell from './NotificationBell';

function DashboardLayout({ user, children, menuItems }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeSection = menuItems.filter(item => location.pathname === item.path || location.pathname.startsWith(item.path + '/')).sort((a, b) => b.path.length - a.path.length)[0] || menuItems[0];
  const profilePath = user?.role === 'admin' ? '/admin/profile' : '/dashboard/profile';
  const isProfile = location.pathname === profilePath;

  const activeId = isProfile ? 'profile' : activeSection.id;

  const linkRefs = useRef({});
  const [indicator, setIndicator] = useState(null);

  useLayoutEffect(() => {
    const el = linkRefs.current[activeId];
    if (el) setIndicator({ top: el.offsetTop, height: el.offsetHeight });
  }, [activeId, location.pathname]);

  useEffect(() => {
    const onResize = () => {
      const el = linkRefs.current[activeId];
      if (el) setIndicator({ top: el.offsetTop, height: el.offsetHeight });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [activeId]);

  return (
    <div className="shell">
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      ></div>
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sb-logo">
          <img src={logoBinaJiwa} alt="Logo BinaJiwa" style={{ width: '40px', height: '40px', objectFit: 'contain', flexShrink: 0 }} />
          <span>BinaJiwa</span>
        </div>
        <nav className="sb-nav" aria-label="Navigasi dashboard">
          {indicator && (
            <span
              className="sb-indicator"
              aria-hidden="true"
              style={{ transform: `translateY(${indicator.top}px)`, height: indicator.height }}
            />
          )}

          {menuItems.map(item => (
            <button
              key={item.id}
              ref={(el) => { linkRefs.current[item.id] = el; }}
              className={`sb-link ${activeId === item.id ? 'active' : ''}`}
              aria-current={activeId === item.id ? 'page' : undefined}
               onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}

          {user?.role !== 'admin' && (
            <button
              ref={(el) => { linkRefs.current.profile = el; }}
              className={`sb-link ${activeId === 'profile' ? 'active' : ''}`}
              aria-current={activeId === 'profile' ? 'page' : undefined}
               onClick={() => {
                navigate(profilePath);
                setSidebarOpen(false);
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>Profil</span>
            </button>
          )}
        </nav>
        <div className="sb-foot">
          <button
            className="sb-link logout-btn"
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
              navigate('/auth');
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main">
        {user?.role !== 'admin' && <NotificationBell />}
        <div className="mobile-topbar">
           <button
            className="burger-btn"
            aria-label="Buka menu navigasi"
            onClick={() => setSidebarOpen(true)}
          >
            <span></span><span></span><span></span>
          </button>
          <div
            className="mobile-brand"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <span>{isProfile ? 'Profil' : activeSection.label}</span>
          </div>
        </div>
        <div className="content" key={location.pathname}>
          {children}
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;