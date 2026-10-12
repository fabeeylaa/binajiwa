import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            SehatJiwa
          </div>
          <p className="footer-desc">
            Pendamping kesehatan mental untuk mahasiswa Indonesia. Mulai langkah kecilmu hari ini.
          </p>
        </div>

        <div className="footer-column">
          <h4>Layanan</h4>
          <a href="#features">Fitur</a>
          <a href="#screening">Screening</a>
          <a href="#habit-tracker">Habit Tracker</a>
          <a href="#education">Edukasi</a>
        </div>

        <div className="footer-column">
          <h4>Komunitas</h4>
          <a href="/auth">Daftar</a>
          <a href="/auth">Masuk</a>
        </div>

        <div className="footer-column">
          <h4>Bantuan</h4>
          <a href="#faq">FAQ</a>
          <a href="#">Kebijakan Privasi</a>
          <a href="#">Kontak Kami</a>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-disclaimer">
          SehatJiwa tidak merupakan pengganti konsultasi kesehatan mental atau
          bantuan medis profesional. Segala kondisi kesehatan, hubungi
          ahli atau fasilitas kesehatan terdekat.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
