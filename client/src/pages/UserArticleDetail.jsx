import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Bookmark, BookmarkCheck, ChevronLeft, BookOpen, Share2, MessageSquare } from 'lucide-react';
import { categoryLabel } from '../utils/articleCategories';
import './UserArticleDetail.css';
import './UserArticleDetailPolish.css';

function UserArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allArticles, setAllArticles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch(`/api/articles/${slug}`, { credentials: 'include' }).then(r => r.json()),
      fetch('/api/bookmarks', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/articles?page=1&limit=50').then(r => r.json())
    ])
      .then(([articleData, bookmarksData, allArticlesData]) => {
        if (articleData.id) {
          setArticle(articleData);
          setIsBookmarked((bookmarksData || []).some(b => b.id === articleData.id));
        }
        setAllArticles(allArticlesData.items || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  const toggleBookmark = async () => {
    const prev = isBookmarked;
    setIsBookmarked(!isBookmarked);

    try {
      let res;
      if (isBookmarked) {
        res = await fetch(`/api/bookmarks/${article.id}`, { method: 'DELETE', credentials: 'include' });
      } else {
        res = await fetch('/api/bookmarks', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ article_id: article.id })
        });
      }
      if (!res.ok) {
        throw new Error('Gagal memperbarui bookmark');
      }
    } catch (err) {
      console.error(err);
      setIsBookmarked(prev);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.excerpt || article.title,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link artikel disalin ke clipboard!');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Gagal membagikan:', err);
      }
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Memuat artikel...</div>;
  if (!article) return (
    <div className="article-detail-page">
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px' }}>
        <BookOpen size={48} strokeWidth={1.5} style={{ margin: '0 auto 16px', color: '#196621' }} />
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Artikel Tidak Ditemukan</h3>
        <p style={{ color: '#666' }}>Artikel yang Anda cari tidak tersedia.</p>
      </div>
    </div>
  );

  const rawParagraphs = article.content ? article.content.split('\n').filter(p => p.trim() !== '') : [];
  const wordCount = article.content ? article.content.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const otherArticles = allArticles.filter(a => a.slug !== slug).slice(0, 3);

  return (
    <div className="article-detail-page">
      <header className="ad-header">
        <button className="ad-header-btn" onClick={() => navigate('/dashboard/articles')}>
          <ChevronLeft size={20} />
        </button>
        Detail Artikel
      </header>

      <div className="ad-layout">
        <main className="ad-main">
          {article.cover_image ? (
            <img src={article.cover_image} alt={article.title} className="ad-cover" onError={e => { e.currentTarget.style.display = 'none'; }} />
          ) : (
            <div className="ad-cover" style={{ background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#888' }}>Tidak ada gambar cover</span>
            </div>
          )}

          <div className="ad-meta-top">
            <div className="ad-tags">
              <span className="ad-tag">{categoryLabel(article.category)}</span>
              <span className="ad-tag" style={{ background: '#a3f2a7', color: '#196621' }}>Edukasi</span>
            </div>
            <div className="ad-read-time">{readTime} Menit Membaca</div>
          </div>

          <h1 className="ad-title">{article.title}</h1>

          <div className="ad-publish-date" style={{ marginBottom: '24px', color: '#888', fontSize: '13px' }}>
            Dipublikasikan pada {new Date(article.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

          <div className="ad-content-body ad-content">
            {rawParagraphs.length > 0 ? (
              rawParagraphs.map((p, i) => <p key={i}>{p}</p>)
            ) : (
              <p>Konten tidak tersedia.</p>
            )}
          </div>
        </main>

        <aside className="ad-sidebar">
          <div className="ad-actions-card">
            <div className="ad-action-group">
              <button 
                className="ad-action-btn"
                onClick={toggleBookmark}
                title={isBookmarked ? 'Hapus Simpanan' : 'Simpan Artikel'}
              >
                {isBookmarked ? <BookmarkCheck size={20} color="#196621" /> : <Bookmark size={20} />}
              </button>
              <button className="ad-action-btn" title="Bagikan" onClick={handleShare}>
                <Share2 size={20} />
              </button>
            </div>
          </div>

          <div className="ad-related-card">
            <h3 className="ad-related-title">
              <MessageSquare size={18} color="#196621" />
              Artikel Lainnya
            </h3>
            <div className="ad-related-list">
              {otherArticles.length > 0 ? (
                otherArticles.map(a => (
                  <Link key={a.id} to={`/dashboard/articles/${a.slug}`} className="ad-related-item">
                    <div className="ad-related-img">
                      {a.cover_image ? (
                        <img src={a.cover_image} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }} onError={e => { e.currentTarget.style.display = 'none'; }} />
                      ) : (
                        <BookOpen size={22} color="#196621" />
                      )}
                    </div>
                    <div className="ad-related-info">
                      <span className="ad-related-cat">{categoryLabel(a.category)}</span>
                      <span className="ad-related-text">{a.title}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <p style={{ fontSize: '13px', color: '#888', textAlign: 'center', padding: '8px 0' }}>Belum ada artikel lainnya.</p>
              )}
            </div>
            
            <Link to="/dashboard/articles" className="ad-see-all-btn">
              Lihat Semua Artikel
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default UserArticleDetail;