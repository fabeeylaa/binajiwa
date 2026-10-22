<div align="center">

<img src="client/public/binajiwa-logo.jpeg" alt="Logo BinaJiwa" width="120" />

# BinaJiwa

**Platform kesehatan mental dan kebiasaan positif untuk mahasiswa.**

Skrining mandiri, pelacak kebiasaan, edukasi, dan fitur sosial dalam satu tempat.

[Demo Langsung](binajiwa.vercel.app) · [Laporkan Masalah](../../issues)

</div>

---

## Latar Belakang

Mahasiswa sering menghadapi stres, kecemasan, dan pola hidup yang berantakan, tetapi tidak semua tahu harus mulai dari mana atau merasa nyaman langsung bicara dengan profesional. BinaJiwa dibuat sebagai langkah pertama yang ringan: kenali kondisimu lewat skrining singkat, bangun kebiasaan sehat sedikit demi sedikit, dan pelajari hal-hal yang relevan untuk kehidupan kuliah.

> **Penting:** BinaJiwa bukan alat diagnosis dan bukan layanan darurat. Hasil skrining bersifat indikatif. Jika kamu merasa kewalahan, hubungi psikolog, psikiater, atau layanan konseling kampus.

## Fitur Utama

### Untuk pengguna
- **Skrining mandiri** dengan tiga instrumen:
  - **PHQ-9** untuk gejala depresi (Kroenke, Spitzer & Williams, 2001)
  - **GAD-7** untuk gejala kecemasan (Spitzer, Kroenke, Williams & Löwe, 2006)
  - **Student Wellness Check**, instrumen internal tim (bukan alat diagnosis klinis)

  Hasil ditampilkan per kategori (minimal sampai berat) beserta pesan tindak lanjut, dan riwayat hasil tersimpan.
- **Habit tracker**: buat kebiasaan, catat setiap hari, lihat streak dan statistik mingguan.
- **Artikel edukasi** tentang pola makan, olahraga, dan kesehatan mental, lengkap dengan fitur bookmark.
- **Fitur sosial**: tambah teman, ikut challenge bersama, check-in harian, dan leaderboard.
- **Notifikasi real-time** dan **profil** dengan foto avatar.
- **Persetujuan (consent)** saat mendaftar, dan halaman Privasi serta Kontak.

### Untuk admin
- Ringkasan statistik platform.
- Kelola artikel (tambah, ubah, hapus).
- Lihat hasil asesmen pengguna. Identitas disamarkan secara bawaan (lihat `ADMIN_SHOW_FULL_IDENTITY`).

## Teknologi

| Bagian | Teknologi |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS 4, React Router, Axios, Recharts, Socket.IO Client |
| Backend | Node.js, Express 5, Socket.IO (notifikasi real-time) |
| Database | PostgreSQL (`pg`) |
| Keamanan | JWT di cookie, bcrypt, rate limiting pada login dan registrasi |
| Upload | Multer (avatar) |
| Deployment | Vercel (frontend) dan Render (backend) |

## Struktur Project

```
.
├── client/                  # Aplikasi React (Vite)
│   ├── public/              # Logo dan favicon
│   └── src/
│       ├── components/      # Komponen landing page dan dashboard
│       ├── pages/           # Halaman (Auth, Dashboard, Admin, dll.)
│       └── utils/
└── server/                  # REST API (Express)
    ├── config/              # Koneksi database
    ├── controllers/         # Logika tiap fitur
    ├── middleware/          # Auth, role, rate limit
    ├── migrations/          # Skema dan data awal (SQL)
    ├── routes/              # Definisi endpoint
    └── runMigration.js      # Menjalankan semua migrasi
```

## Menjalankan di Komputer Sendiri

### Prasyarat
- Node.js (disarankan versi LTS terbaru)
- PostgreSQL

### 1. Clone repo

```bash
git clone https://github.com/fabeeylaa/binajiwa.git
cd binajiwa
```

> Ganti alamat di atas dengan alamat repo yang baru jika sudah di-rename.

### 2. Siapkan backend

```bash
cd server
npm install
```

Buat file `server/.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/NAMA_DATABASE
JWT_SECRET=isi-dengan-string-acak-yang-panjang
```

Buat database kosong di PostgreSQL, lalu jalankan migrasi:

```bash
node runMigration.js
npm run dev
```

Backend berjalan di `http://localhost:5000`.

### 3. Siapkan frontend

Di terminal lain:

```bash
cd client
npm install
npm run dev
```

Buka alamat yang muncul di terminal (biasanya `http://localhost:5173`). Request ke `/api` dan `/uploads` otomatis diteruskan ke backend lewat proxy Vite.

### Membuat akun admin

Semua akun baru berperan `user`. Untuk menjadikan sebuah akun admin, ubah kolom `role` langsung di database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'emailkamu@contoh.com';
```

## Variabel Lingkungan

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `DATABASE_URL` | Ya | Connection string PostgreSQL |
| `JWT_SECRET` | Ya | Kunci penandatangan token login |
| `PORT` | Tidak | Port backend (bawaan `5000`) |
| `CLIENT_URL` | Tidak | Asal frontend yang diizinkan CORS |
| `NODE_ENV` | Tidak | Isi `production` agar cookie bersifat secure |
| `LOGIN_MAX_ATTEMPTS` | Tidak | Batas percobaan login (bawaan 10) |
| `REGISTER_MAX_ATTEMPTS` | Tidak | Batas percobaan registrasi (bawaan 10) |
| `STREAK_TARGET` | Tidak | Target harian untuk menghitung streak (bawaan 1) |
| `ADMIN_SHOW_FULL_IDENTITY` | Tidak | `true` agar admin melihat identitas lengkap pada hasil asesmen |

## Ringkasan API

Semua endpoint berawalan `/api` dan, kecuali yang disebut publik, membutuhkan login.

| Grup | Endpoint dasar | Keterangan |
| --- | --- | --- |
| Auth | `/api/auth` | Register, login, logout, profil (`/me`, `/profile`) |
| Kebiasaan | `/api/habits` | CRUD kebiasaan, catat/batalkan log, statistik mingguan |
| Asesmen | `/api/assessments` | Daftar instrumen, kirim jawaban, riwayat hasil |
| Artikel | `/api/articles` | Baca artikel (publik); kelola artikel (admin) |
| Bookmark | `/api/bookmarks` | Simpan dan hapus artikel favorit |
| Teman | `/api/social/friends` | Tambah, terima/tolak, hapus teman |
| Challenge | `/api/social/challenges` | Buat, ikut, check-in |
| Leaderboard | `/api/social/leaderboard` | Peringkat pengguna |
| Notifikasi | `/api/notifications` | Lihat, tandai dibaca, hapus |
| Dashboard | `/api/dashboard` | Ringkasan untuk halaman utama |
| Admin | `/api/admin` | Statistik dan hasil asesmen (khusus admin) |

## Privasi dan Etika

- Pengguna memberi persetujuan saat mendaftar, dan waktunya dicatat.
- Hasil skrining hanya bersifat indikatif dan selalu disertai pengingat untuk mencari bantuan profesional.
- Tampilan data untuk admin disamarkan secara bawaan.
- File `.env` dan folder `server/uploads/` tidak disertakan di repository.

## Tim

| Nama | Peran | Kontak |
| --- | --- | --- |
| Fabiana Nesya Al Kayla | Backend Developer & DevOps | nesyakelaa@gmail.com |
| Qois Daffa Abdullah | Backend & Database Developer | qdaffaabdullah@gmail.com |
| Maelani | UI/UX Designer & Frontend Developer | maelani.my@gmail.com |
| Handyka Dwi Setiawan | UI/UX Designer & Frontend Developer | hansz14022@gmail.com |
| Hanif Syuhada | System Analyst | hanifsyuhada2311@gmail.com |

## Lisensi

<!-- Pilih lisensi (misalnya MIT) dan tambahkan file LICENSE, atau hapus bagian ini. -->

---

<div align="center">
Dibuat untuk kesehatan mental mahasiswa Indonesia.
</div>
