import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css';
import './AuthPolish.css';
import authIllustration from '../assets/auth-illustration.jpg';
import { Activity, ClipboardCheck } from 'lucide-react';
import logoBinaJiwa from '../assets/Logoobinajiwa.jpeg';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [consent, setConsent] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(isLogin ? formData : { ...formData, consent })
      });
      const data = await res.json();

      if (res.ok) {
        if (isLogin) {
          if (data.user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        } else {
          setIsLogin(true);
          setConsent(false);
          setError('Registrasi berhasil, silakan login');
        }
      } else {
        setError(data.message || 'Terjadi kesalahan');
      }
    } catch (err) {
      setError('Gagal menghubungi server');
    }
  };

  return (
    <div className="auth-container authx-container">
      <div className="authx-layout">
        <div className="authx-hero">
          <div>
            <h2>Kesehatan jiwa dan raga dalam satu tempat</h2>
            <p>Pantau kebiasaan sehat, cek kondisimu lewat screening, dan tumbuh bersama komunitas.</p>
          </div>
          <div className="authx-art">
            <img className="authx-img" src={authIllustration} alt="Ilustrasi seseorang bermeditasi di taman" />
            <div className="authx-chip authx-chip-top">
              <span className="authx-chip-icon"><Activity size={18} /></span>
              <div className="authx-chip-text"><strong>Habit Tracker</strong><span>Pantau kebiasaan harian</span></div>
            </div>
            <div className="authx-chip authx-chip-bottom">
              <span className="authx-chip-icon"><ClipboardCheck size={18} /></span>
              <div className="authx-chip-text"><strong>Screening</strong><span>Cek kondisi mentalmu</span></div>
            </div>
          </div>
          <div className="authx-quote">Satu langkah kecil setiap hari tetap berarti untuk kesehatan jiwamu.</div>
        </div>

        <div className="authx-main">
          <div className="auth-card authx-card">
            <div className="auth-header">
              <div className="navbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer', marginBottom: '1.5rem' }}>
                <img src={logoBinaJiwa} alt="Logo BinaJiwa" style={{ height: '44px', width: '44px', objectFit: 'contain' }} />
                BinaJiwa
              </div>
              <h1>{isLogin ? 'Selamat Datang' : 'Mulai Perjalanan Anda'}</h1>
              <p>{isLogin ? 'Masuk untuk memantau kesehatan jiwa Anda' : 'Buat akun untuk fitur lengkap'}</p>
            </div>

            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab ${isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button
                type="button"
                className={`auth-tab ${!isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(false)}
              >
                Daftar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {error && <div className={`auth-error ${error.includes('berhasil') ? 'success' : ''}`}>{error}</div>}

              {!isLogin && (
                <>
                  <div className="form-group">
                    <label>Nama Lengkap</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Masukan nama lengkap"
                      required
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      name="username"
                      placeholder="Masukan username"
                      required
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  required
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  onChange={handleChange}
                />
              </div>

              {!isLogin && (
                <label className="auth-consent">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span>
                    Saya telah membaca dan menyetujui{' '}
                    <button type="button" className="auth-link" onClick={() => setShowTerms(true)}>
                      Syarat &amp; Ketentuan
                    </button>{' '}
                    BinaJiwa.
                  </span>
                </label>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={!isLogin && !consent}
              >
                {isLogin ? 'Masuk' : 'Daftar Sekarang'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {showTerms && (
        <div className="terms-overlay" onClick={() => setShowTerms(false)}>
          <div className="terms-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Syarat &amp; Ketentuan</h3>
            <ul>
              <li>Hasil screening di BinaJiwa bersifat indikatif dan bukan diagnosis.</li>
              <li>Data kamu (profil, catatan habit, dan hasil screening) disimpan dan diolah untuk fitur aplikasi ini.</li>
              <li>Nama, username, dan streak dapat dilihat pengguna lain di leaderboard dan fitur teman.</li>
              <li>Admin hanya melihat data yang disamarkan.</li>
            </ul>
            <button
              type="button"
              className="btn btn-primary btn-full"
              onClick={() => { setConsent(true); setShowTerms(false); }}
            >
              Saya Mengerti &amp; Setuju
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuthPage;