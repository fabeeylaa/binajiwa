import { useEffect, useState } from 'react';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import UserHome from './UserHome';
import UserScreening from './UserScreening';
import UserHabits from './UserHabits';
import UserArticles from './UserArticles';
import UserArticleDetail from './UserArticleDetail';
import UserSocial from './UserSocial';
import UserProfile from "./UserProfile";

import AdminOverview from './AdminOverview';
import AdminArticles from './AdminArticles';
import AdminAssessments from './AdminAssessments';

function Dashboard({ role }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          if (data.user.role !== role) navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
          else setUser(data.user);
        } else navigate('/auth');
      })
      .catch(() => navigate('/auth'));
  }, [navigate, role]);

  if (!user) return <div style={{padding: '2rem'}}>Memuat...</div>;

  const menuItems = role === 'admin' ? [
    { 
      id: 'overview', 
      label: 'Overview', 
      path: '/admin', 
      sub: 'Statistik dashboard admin',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
    },
    { 
      id: 'articles', 
      label: 'Artikel', 
      path: '/admin/articles', 
      sub: 'Manajemen konten edukasi',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>
    },
    { 
      id: 'assessments', 
      label: 'Assessment', 
      path: '/admin/assessments', 
      sub: 'Hasil dan pengaturan assessment',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/></svg>
    },
  ] : [
    { 
      id: 'home', 
      label: 'Beranda', 
      path: '/dashboard', 
      sub: 'Selamat datang kembali!',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>
    },
    { 
      id: 'screening', 
      label: 'Screening', 
      path: '/dashboard/screening', 
      sub: 'Pantau kondisi harianmu.',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/></svg>
    },
    { 
      id: 'habits', 
      label: 'Habit Tracker', 
      path: '/dashboard/habits', 
      sub: 'Catat kebiasaan kecilmu.',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19V9M12 19V5M20 19v-6"/></svg>
    },
    { 
      id: 'articles', 
      label: 'Edukasi', 
      path: '/dashboard/articles', 
      sub: 'Bacaan kesehatan mental.',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>
    },
    {
      id: 'social',
      label: 'Sosial',
      path: '/dashboard/social',
      sub: 'Teman, tantangan, dan leaderboard.',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="8" r="3"/><path d="M3 20v-1a5 5 0 015-5h2a5 5 0 015 5v1"/><path d="M16 5a3 3 0 010 6M21 20v-1a4 4 0 00-3-3.9"/></svg>
    },
  ];

  return (
    <DashboardLayout user={user} menuItems={menuItems}>
      <Routes>
        {role === 'admin' ? (
          <>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/articles" element={<AdminArticles />} />
            <Route path="/assessments" element={<AdminAssessments />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<UserHome user={user} />} />
            <Route path="/screening" element={<UserScreening />} />
            <Route path="/habits" element={<UserHabits />} />
            <Route path="/articles" element={<UserArticles />} />
            <Route path="/articles/:slug" element={<UserArticleDetail />} />
            <Route path="/social" element={<UserSocial />} />
            <Route path="/profile" element={<UserProfile user={user} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>
    </DashboardLayout>
  );
}

export default Dashboard;
