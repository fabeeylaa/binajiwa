import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import PrivacyPage from './pages/PrivacyPage';
import ContactPage from './pages/ContactPage';
import ScrollToTop from './components/ScrollToTop';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';


function App() {
  return (
    <Router>
      <SocketProvider>
        <NotificationProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard/*" element={<Dashboard role="user" />} />
            <Route path="/admin/*" element={<Dashboard role="admin" />} />
            <Route path="/privasi" element={<PrivacyPage />} />
            <Route path="/kontak" element={<ContactPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </SocketProvider>
    </Router>
  );
}

export default App;