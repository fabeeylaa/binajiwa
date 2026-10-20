import { useEffect, useState } from 'react';
import logo from '../assets/Logoobinajiwa.jpeg';
import './Navbar.css';

const SECTIONS = [
  { href: '#features', label: 'Fitur' },
  { href: '#screening', label: 'Screening' },
  { href: '#habit-tracker', label: 'Habit Tracker' },
  { href: '#education', label: 'Edukasi' },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    const targets = SECTIONS.map(s => document.querySelector(s.href)).filter(Boolean);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // pilih entry yang paling terlihat di viewport
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive('#' + visible[0].target.id);
      },
      { threshold: [0.25, 0.5, 0.75], rootMargin: '-72px 0px -40% 0px' }
    );

    targets.forEach(t => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  // easeInOutCubic — lebih halus daripada scroll-behavior default.
  // Nonaktifkan scroll-behavior CSS dulu supaya tidak menabrak animasi per-frame.
  const smoothScrollTo = (targetY, duration = 700) => {
    const root = document.documentElement;
    const prevBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';

    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const step = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      window.scrollTo(0, startY + distance * ease(t));
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        root.style.scrollBehavior = prevBehavior;
      }
    };
    requestAnimationFrame(step);
  };

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMenuOpen(false);

    if (href === '#top') {
      smoothScrollTo(0, 700);
      setActive('');
      return;
    }

    const el = document.querySelector(href);
    if (!el) return;
    const navbarH = document.querySelector('.navbar')?.offsetHeight || 72;
    const targetY = el.getBoundingClientRect().top + window.scrollY - navbarH - 16;
    smoothScrollTo(Math.max(targetY, 0), 700);
  };

  return (
    <nav className="navbar">
      <a className="navbar-logo" href="#top" onClick={(e) => handleNavClick(e, '#top')}>
        <img src={logo} alt="Logo BinaJiwa" />
        BinaJiwa
      </a>

      <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
        {SECTIONS.map(s => (
          <a
            key={s.href}
            href={s.href}
            className={active === s.href ? 'active' : ''}
            aria-current={active === s.href ? 'true' : undefined}
            onClick={(e) => handleNavClick(e, s.href)}
          >
            {s.label}
          </a>
        ))}
      </div>

      {menuOpen && (
        <div 
          className="navbar-overlay" 
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <a
        href="/auth"
        className="btn btn-primary navbar-cta"
        onClick={() => setMenuOpen(false)}
      >
        Mulai
      </a>

      <button
        className="navbar-burger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
  );
}

export default Navbar;