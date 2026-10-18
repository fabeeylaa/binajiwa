import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css';
import './AuthPolish.css';
import authIllustration from '../assets/auth-illustration.jpg';
import { Activity, ClipboardCheck } from 'lucide-react';
import logoSehatJiwa from '../assets/Logoosehatjiwa.jpeg';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
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
          <div className="navbar-logo" onClick={() => navigate('/')} style={{cursor: 'pointer', marginBottom: '1.5rem'}}>
            <img src={logoSehatJiwa} alt="Logo SehatJiwa" style={{ height: '44px', width: '44px', objectFit: 'contain' }} />
            SehatJiwa
          </div>
          <h1>{isLogin ? 'Selamat Datang' : 'Mulai Perjalanan Anda'}</h1>
          <p>{isLogin ? 'Masuk untuk memantau kesehatan jiwa Anda' : 'Buat akun untuk fitur lengkap'}</p>
        </div>

        <div className="auth-tabs">
          <button 
            className={`auth-tab ${isLogin ? 'active' : ''}`} 
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
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
                Saya memahami bahwa hasil screening di SehatJiwa bersifat indikatif dan
                bukan diagnosis. Saya menyetujui data saya (profil, catatan habit, dan
                hasil screening) disimpan dan diolah untuk fitur aplikasi ini. Nama,
                username, dan streak saya dapat dilihat pengguna lain di leaderboard
                dan fitur teman. Admin hanya melihat data yang disamarkan.
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
    </div>
  );
}

export default AuthPage;