import { ArrowRight, Clock, Sparkle } from "lucide-react";
import "./ArticlesPreview.css";
import tipsImg from "../assets/tips.jpg";
import makananImg from "../assets/makanan.jpg";
import aktivitasImg from "../assets/aktivitas.jpg";

function ArticlesPreview() {
  const articles = [
    {
      category: "Tips Kuliah",
      title: "5 Cara Mudah Kurangi Stres Saat UTS",
      readTime: "4 menit baca",
      image: tipsImg,
    },
    {
      category: "Pola Makan",
      title: "Makanan yang Baik untuk Kesehatan Mental",
      readTime: "5 menit baca",
      image: makananImg,
    },
    {
      category: "Aktivitas",
      title: "Gerak Tubuh, Tenangkan Pikiran",
      readTime: "3 menit baca",
      image: aktivitasImg,
    },
  ];

  return (
    <section className="articles-preview" id="education">
      <div className="articles-container">
        <div className="articles-header">
          <div className="header-badge">
            <Sparkle size={14} fill="currentColor" className="badge-icon" />
            <span className="preview-label">Artikel & Edukasi</span>
          </div>
          <h2 className="preview-title">
            Ruang kecil untuk pikiran yang <span>lebih tenang.</span>
          </h2>
          <p className="preview-desc">
            Temukan insight ringan seputar stres, pola hidup, dan kesehatan
            mental mahasiswa.
          </p>
          <div className="articles-actions">
            <a href="/auth" className="btn-explore">
              Jelajahi Artikel <ArrowRight size={18} />
            </a>
            <a href="/auth" className="btn-topics">
              Lihat topik <ArrowRight size={16} />
            </a>
          </div>
        </div>

        <div className="articles-grid">
          {articles.map((article, idx) => (
            <article
              className="pro-article-card"
              key={idx}
              onClick={() => (window.location.href = "/auth")}
            >
              <div className="pro-article-thumb">
                <img src={article.image} alt={article.title} loading="lazy" />
                <div className="pro-category-tag">{article.category}</div>
              </div>
              <div className="pro-article-content">
                <h3 className="pro-article-title">{article.title}</h3>
                <div className="pro-article-footer">
                  <span className="pro-readtime">
                    <Clock size={14} />
                    {article.readTime}
                  </span>
                  <span className="pro-article-action">
                    <ArrowRight size={16} />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ArticlesPreview;
