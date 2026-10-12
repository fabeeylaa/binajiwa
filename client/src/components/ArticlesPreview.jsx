import { ArrowUpRight, Clock, Sparkles } from 'lucide-react';
import './ArticlesPreview.css';

function ArticlesPreview() {
  const articles = [
    {
      category: 'Tips Kuliah',
      title: '5 Cara Mudah Kurangi Stres Saat UTS',
      readTime: '4 menit baca',
      thumbClass: 'thumb-gradient-1',
      pattern: 'bg-pattern-1'
    },
    {
      category: 'Pola Makan',
      title: 'Makanan yang Baik untuk Kesehatan Mental',
      readTime: '5 menit baca',
      thumbClass: 'thumb-gradient-2',
      pattern: 'bg-pattern-2'
    },
    {
      category: 'Aktivitas',
      title: 'Gerak Tubuh, Tenangkan Pikiran',
      readTime: '3 menit baca',
      thumbClass: 'thumb-gradient-3',
      pattern: 'bg-pattern-3'
    },
  ];

  return (
    <section className="articles-preview" id="education">
      <div className="articles-container">
        <div className="articles-header">
          <div className="header-badge">
            <Sparkles size={14} className="badge-icon" />
            <span className="preview-label">Artikel & Edukasi</span>
          </div>
          <h2 className="preview-title">
            Bacaan ringan buat<br />
            <span>pikiran tenang.</span>
          </h2>
          <p className="preview-desc">
            Ditulis khusus untuk mahasiswa — soal deadline, ujian, kehidupan sosial,
            dan pola hidup yang relate banget.
          </p>
          <a href="/auth" className="btn-explore">
            Jelajahi Semua
          </a>
        </div>

        <div className="articles-grid">
          {articles.map((article, idx) => (
            <article 
              className="pro-article-card" 
              key={idx}
              onClick={() => window.location.href = '/auth'}
            >
              <div className={`pro-article-thumb ${article.thumbClass}`}>
                <div className={`pro-thumb-overlay ${article.pattern}`}></div>
                <div className="pro-category-tag">{article.category}</div>
              </div>
              <div className="pro-article-content">
                <h3 className="pro-article-title">{article.title}</h3>
                <div className="pro-article-footer">
                  <span className="pro-readtime">
                    <Clock size={14} />
                    {article.readTime}
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