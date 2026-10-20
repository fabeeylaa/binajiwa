import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import './FAQ.css';

function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: "Apa itu BinaJiwa?",
      a: "BinaJiwa adalah platform kesehatan mental yang dirancang khusus untuk mahasiswa, menyediakan alat bantu screening mandiri, pelacak kebiasaan (habit tracker), dan konten edukasi yang relevan."
    },
    {
      q: "Apakah hasil screening merupakan diagnosis medis?",
      a: "Tidak. Hasil screening kami bersifat indikatif untuk membantu Anda memahami kondisi saat ini. Kami sangat menyarankan konsultasi dengan tenaga profesional untuk diagnosis lebih lanjut."
    },
    {
      q: "Bagaimana cara mulai menggunakan Habit Tracker?",
      a: "Anda cukup masuk ke dashboard setelah login, lalu pilih fitur Habit Tracker. Anda bisa mencatat aktivitas harian seperti pola tidur, minum air, dan olahraga."
    },
    {
      q: "Apakah data saya aman?",
      a: "Keamanan privasi Anda adalah prioritas kami. Semua data personal dan hasil aktivitas dienkripsi dan hanya dapat diakses oleh akun Anda sendiri."
    }
  ];

  return (
    <section className="faq-section" id="faq">
      <div className="faq-container">
        <div className="faq-header">
          <div className="faq-badge">
            <HelpCircle size={14} />
            <span>Pusat Bantuan</span>
          </div>
          <h2 className="faq-title">Pertanyaan Umum</h2>
          <p className="faq-subtitle">Punya pertanyaan? Mungkin jawabannya ada di bawah ini.</p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className={`faq-item ${openIdx === i ? 'active' : ''}`}
              onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
            >
              <div className="faq-question">
                <h3>{faq.q}</h3>
                <ChevronDown className="faq-chevron" size={20} />
              </div>
              <div className="faq-answer">
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
