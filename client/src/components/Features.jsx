import './Features.css';

function Features() {
  const features = [
    {
      title: "Screening Sederhana",
      desc: "Pertanyaan singkat tentang tidur, stres, dan energi. Hasilnya berupa rekomendasi umum, bukan diagnosis.",
    },
    {
      title: "Edukasi Kesehatan",
      desc: "Artikel singkat soal pola makan, olahraga, dan kesehatan mental — ditulis buat kehidupan kuliah, bukan jurnal medis.",
    },
    {
      title: "Habit Tracker",
      desc: "Catat air minum, tidur, dan olahraga harian. Lihat streak-mu tumbuh, literally tiap hari konsisten nambah satu daun.",
    },
  ];

  return (
    <section className="features" id="features">
      <div className="container">
        <h2 className="section-title">Fitur Kami</h2>
        <p className="section-subtitle">
          Bangun kebiasaan sehat yang bertahan dengan bantuan fitur kami
        </p>
        <div className="features-grid">
          {features.map((item, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  {i === 0 && <path d="M9 11H7v6h2M15 11h-2v6h2M12 3v4M6 5l3 3M18 5l-3 3" />}
                  {i === 1 && <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 3A2.5 2.5 0 0 0 4 5.5v12A2.5 2.5 0 0 0 6.5 20H20" />}
                  {i === 2 && <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7" />}
                </svg>
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
