import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // tunggu sebentar supaya halaman selesai render
      const t = setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}