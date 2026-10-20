import { useState } from 'react';
import { Link } from 'react-router-dom';
import './PrivacyPage.css';

function ContactPage() {
  const email = 'nesyakelaa@gmail.com';
  const gmailLink = `https://mail.google.com/mail/?view=cm&to=${email}&su=${encodeURIComponent('Pesan untuk SehatJiwa')}`;

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // abaikan kalau browser menolak
    }
  };

  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <Link to="/" className="auth-link">← Kembali ke beranda</Link>

        <h1>Kontak Kami</h1>
        <p className="privacy-updated">Kami senang mendengar masukan dari kamu.</p>

        <h2>Hubungi kami</h2>
        <p>
          Pertanyaan, masukan, atau permintaan penghapusan akun? Kirim email ke:
        </p>

        <div className="contact-email-box">{email}</div>

        <div className="contact-actions">
          <a href={gmailLink} target="_blank" rel="noreferrer" className="contact-btn contact-btn-primary">
            Kirim lewat Gmail
          </a>
          <button type="button" className="contact-btn contact-btn-outline" onClick={handleCopy}>
            {copied ? 'Tersalin ✓' : 'Salin email'}
          </button>
        </div>

        <p className="contact-hint">
          Atau salin alamat email di atas dan kirim lewat aplikasi email kamu.
        </p>

        <h2>Butuh bantuan segera?</h2>
        <p>
          SehatJiwa bukan layanan darurat. Jika kamu merasa kewalahan atau
          dalam kondisi krisis, segera hubungi tenaga profesional, fasilitas
          kesehatan terdekat, atau orang yang kamu percaya.
        </p>
      </div>
    </div>
  );
}

export default ContactPage;