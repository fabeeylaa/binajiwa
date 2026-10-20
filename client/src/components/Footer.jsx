import './Footer.css';
import { Link } from "react-router-dom";

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
          <Link to="/#features">Fitur</Link>
          <Link to="/#screening">Screening</Link>
          <Link to="/#habit-tracker">Habit Tracker</Link>
          <Link to="/#education">Edukasi</Link>
        </div>

        <div className="footer-column">
          <h4>Komunitas</h4>
          <Link to="/auth">Daftar</Link>
          <Link to="/auth">Masuk</Link>
        </div>

        <div className="footer-column">
          <h4>Bantuan</h4>
          <Link to="/#faq">FAQ</Link>
          <Link to="/privasi">Kebijakan Privasi</Link>
          <Link to="/kontak">Kontak Kami</Link>
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