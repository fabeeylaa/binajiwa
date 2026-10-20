import { Link } from 'react-router-dom';
import './PrivacyPage.css';

function PrivacyPage() {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <Link to="/" className="auth-link">← Kembali ke beranda</Link>

        <h1>Kebijakan Privasi</h1>
        <p className="privacy-updated">Terakhir diperbarui: 20 Oktober 2026</p>

        <p>
          BinaJiwa adalah pendamping kesehatan mental untuk mahasiswa. Halaman ini
          menjelaskan data apa yang kami simpan, untuk apa, dan siapa saja yang bisa
          melihatnya.
        </p>

        <h2>1. Data yang kami simpan</h2>
        <ul>
          <li><strong>Profil:</strong> nama lengkap, username, email, dan password (disimpan dalam bentuk terenkripsi/hash).</li>
          <li><strong>Catatan habit:</strong> kebiasaan yang kamu tambahkan dan riwayat pengisiannya, termasuk streak.</li>
          <li><strong>Hasil screening:</strong> jawaban dan skor dari screening yang kamu isi.</li>
        </ul>

        <h2>2. Untuk apa data dipakai</h2>
        <ul>
          <li>Menampilkan skor, riwayat screening, dan perkembangan habit di dashboard kamu.</li>
          <li>Memberikan rekomendasi artikel edukasi yang relevan.</li>
          <li>Menjalankan fitur sosial seperti leaderboard dan teman.</li>
          <li>Menjaga keamanan dan memperbaiki aplikasi.</li>
        </ul>

        <h2>3. Siapa yang bisa melihat data kamu</h2>
        <ul>
          <li><strong>Pengguna lain:</strong> hanya nama, username, dan streak, melalui leaderboard dan fitur teman. Hasil screening dan catatan habit kamu tidak ditampilkan ke pengguna lain.</li>
          <li><strong>Admin:</strong> hanya melihat data yang disamarkan, bukan identitas dan jawaban screening kamu.</li>
          <li>Kami tidak menjual data kamu kepada pihak ketiga.</li>
        </ul>

        <h2>4. Hasil screening bukan diagnosis</h2>
        <p>
          Hasil screening bersifat indikatif dan tidak menggantikan pemeriksaan atau
          konsultasi dengan psikolog, psikiater, atau tenaga kesehatan profesional.
          Jika kamu merasa kewalahan, segera hubungi tenaga profesional atau fasilitas
          kesehatan terdekat.
        </p>

        <h2>5. Penyimpanan dan keamanan</h2>
        <p>
          Data disimpan di server kami dan diakses melalui sesi login yang aman. Kami
          berusaha menjaga keamanannya, tetapi tidak ada sistem yang sepenuhnya bebas
          risiko. Jaga kerahasiaan password kamu dan keluar dari akun saat memakai
          perangkat bersama.
        </p>

        <h2>6. Hak kamu</h2>
        <ul>
          <li>Melihat dan memperbarui data profil kamu.</li>
          <li>Meminta penghapusan akun beserta seluruh datanya.</li>
          <li>Menarik persetujuan penggunaan data kapan saja (dengan konsekuensi akun tidak bisa dipakai lagi).</li>
        </ul>
        <p>
          Untuk permintaan di atas, hubungi kami di{' '}
          <a href="mailto:nesyakelaa@gmail.com">nesyakelaa@gmail.com</a>.
        </p>

        <h2>7. Perubahan kebijakan</h2>
        <p>
          Jika kebijakan ini berubah, tanggal pembaruan di bagian atas halaman akan
          kami perbarui.
        </p>
      </div>
    </div>
  );
}

export default PrivacyPage;