import './Hero.css';

function Hero() {
  return (
    <section className="hero">
      <div className="hero-text">
        <div className="hero-badge">
          Selamat Datang di BinaJiwa
        </div>

        <h1 className="hero-title">
          <span className="line-1">Ayo mulai hidup</span>
          <span className="line-1">sehat!</span>
          <span className="line-2">mulai dari</span>
          <span className="line-2">sekarang</span>
        </h1>

        <p className="hero-sub">
          Pantau aktivitas harian dan temukan ketenangan
          pikiran dengan langkah kecil.
        </p>

        <div className="hero-actions">
          <a href="/auth" className="btn btn-primary btn-lg">
            Mulai Perjalanan
          </a>
        </div>

        <p className="hero-login">
          Sudah punya akun? <a href="/auth" style={{color: 'var(--primary)', fontWeight: '600'}}>Masuk</a>
        </p>
      </div>

      <div className="hero-visual">
        <div
          className="hero-illustration"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800&h=1200')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        <div className="float-card float-card--top">
          <div className="fc-icon">🏃‍♀️</div>
          <div>
            <div className="fc-title">Aktivitas</div>
            <div className="fc-sub">Tercapai!</div>
          </div>
        </div>

        <div className="float-card float-card--bottom">
          <div className="fc-icon">🧘‍♀️</div>
          <div>
            <div className="fc-title">Ketenangan</div>
            <div className="fc-sub">+15% Hari ini</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;