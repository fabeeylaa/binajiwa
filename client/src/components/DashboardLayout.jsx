import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './DashboardLayout.css';
import logoSehatJiwa from '../assets/Logoosehatjiwa.jpeg';

function DashboardLayout({ user, children, menuItems }) {
  const navigate = useNavigate();
  const location = useLocation();

  const activeSection = menuItems.filter(item => location.pathname === item.path || location.pathname.startsWith(item.path + '/')).sort((a, b) => b.path.length - a.path.length)[0] || menuItems[0];
  const profilePath = user?.role === 'admin' ? '/admin/profile' : '/dashboard/profile';
  const isProfile = location.pathname === profilePath;

  // id aktif tunggal supaya tombol Profil ikut punya indikator
  const activeId = isProfile ? 'profile' : activeSection.id;

  const linkRefs = useRef({});
  const [indicator, setIndicator] = useState(null);

  useLayoutEffect(() => {
    const el = linkRefs.current[activeId];
    if (el) setIndicator({ top: el.offsetTop, height: el.offsetHeight });
  }, [activeId, location.pathname]);

  // posisi meleset kalau window di-resize tanpa pindah halaman
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
        className="sidebar-overlay"
        onClick={() => document.querySelector('.sidebar')?.classList.remove('open')}
      ></div>
      <aside className="sidebar">
        <div className="sb-logo">
          <img src={logoSehatJiwa} alt="Logo SehatJiwa" style={{ width: '40px', height: '40px', objectFit: 'contain', flexShrink: 0 }} />
          <span>SehatJiwa</span>
        </div>
        <nav className="sb-nav" aria-label="Navigasi dashboard">
          {indicator && (
            <span
              className="sb-indicator"
              aria-hidden="true"
              style={{ transform: `translateY(${indicator.top}px)`, height: indicator.height }}
            />
          )}

                    <button
            ref={(el) => { linkRefs.current.profile = el; }}
            className={`sb-link ${activeId === 'profile' ? 'active' : ''}`}
            aria-current={activeId === 'profile' ? 'page' : undefined}
            onClick={() => {
              navigate(profilePath);
              document.querySelector('.sidebar')?.classList.remove('open');
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>Profil</span>
          </button>

          {menuItems.map(item => (
            <button
              key={item.id}
              ref={(el) => { linkRefs.current[item.id] = el; }}
              className={`sb-link ${activeId === item.id ? 'active' : ''}`}
              aria-current={activeId === item.id ? 'page' : undefined}
              onClick={() => {
                navigate(item.path);
                document.querySelector('.sidebar')?.classList.remove('open');
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}

          <button
            ref={(el) => { linkRefs.current.profile = el; }}
            className={`sb-link ${activeId === 'profile' ? 'active' : ''}`}
            aria-current={activeId === 'profile' ? 'page' : undefined}
            onClick={() => {
              navigate(profilePath);
              document.querySelector('.sidebar')?.classList.remove('open');
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>Profil</span>
          </button>
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
        <div className="mobile-topbar">
          <button
            className="burger-btn"
            aria-label="Buka menu navigasi"
            onClick={() => document.querySelector('.sidebar')?.classList.add('open')}
          >
            <span></span><span></span><span></span>
          </button>
          <div className="mobile-brand">
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="var(--primary)"/>
            </svg>
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
