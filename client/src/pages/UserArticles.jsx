import { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X, AlertCircle, Apple, Brain, Activity, Moon, Bookmark } from 'lucide-react';
import { ARTICLE_CATEGORIES, categoryLabel } from '../utils/articleCategories';
import '../pages/Dashboard.css';
import './UserArticlesPolish.css';

function UserArticles() {
  const [articles, setArticles] = useState([]);
  const [savedArticles, setSavedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchParams] = useSearchParams();
  // ?q= datang dari kolom pencarian di beranda. Nilai ketikan disimpan bersama
  // q asalnya, jadi kalau URL berganti (cari lagi dari beranda) otomatis ikut q baru.
  const urlQuery = searchParams.get('q') || '';
  const [typed, setTyped] = useState({ base: urlQuery, value: urlQuery });
  const searchQuery = typed.base === urlQuery ? typed.value : urlQuery;
  const setSearchQuery = (value) => setTyped({ base: urlQuery, value });

  const categories = [{ value: 'all', label: 'Semua' }, ...ARTICLE_CATEGORIES, { value: 'saved', label: 'Tersimpan' }];

  const getCategoryConfig = (cat) => {
    switch (String(cat || '').toLowerCase()) {
      case 'nutrisi': return { class: 'ph-a', icon: <Apple size={48} className="ph-illustration" /> };
      case 'olahraga': return { class: 'ph-d', icon: <Activity size={48} className="ph-illustration" /> };
      case 'tidur': return { class: 'ph-c', icon: <Moon size={48} className="ph-illustration" /> };
      default: return { class: 'ph-b', icon: <Brain size={48} className="ph-illustration" /> };
    }
  };

  const readTime = (article) => {
    if (!article.content) return null;
    const words = article.content.trim().split(/\s+/).length;
    return `${Math.max(1, Math.ceil(words / 200))} menit baca`;
  };

  const renderMeta = (article) => (
    <p className="edu-meta">
      {categoryLabel(article.category)}
      {readTime(article) && <i> · {readTime(article)}</i>}
    </p>
  );

  const renderMedia = (article, extraClass = '') => {
    const config = getCategoryConfig(article.category);
    return (
      <div className={`edu-media ${extraClass}`}>
        {article.cover_image ? (
          <img src={article.cover_image} alt="" loading="lazy" />
        ) : (
          <div className={`ph ${config.class}`}>
            {config.icon}
            <span className="ph-chip">{categoryLabel(article.category)}</span>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    Promise.all([
      fetch('/api/articles?page=1&limit=50', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/bookmarks', { credentials: 'include' }).then(r => r.json()),
    ])
      .then(([articlesData, bookmarks]) => {
        setArticles(articlesData.items || []);
        setSavedArticles(Array.isArray(bookmarks) ? bookmarks : []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const displayArticles = useMemo(() => {
    const source = selectedCategory === 'saved' ? savedArticles : articles;
    const query = searchQuery.trim().toLowerCase();
    return source.filter(a => {
      const mCat = selectedCategory === 'all' || selectedCategory === 'saved' || String(a.category || '').toLowerCase() === selectedCategory;
      const mSearch = query === '' || a.title.toLowerCase().includes(query) || (a.excerpt && a.excerpt.toLowerCase().includes(query));
      return mCat && mSearch;
    });
  }, [articles, savedArticles, selectedCategory, searchQuery]);

  if (loading) return <div className="tab-panel" style={{ padding: '24px' }}>Memuat...</div>;

  const featured = displayArticles[0];
  const rest = displayArticles.filter(a => a.id !== featured?.id);
  const noArticlesAtAll = articles.length === 0;

  return (
    <div className="tab-panel" style={{ paddingBottom: '80px' }}>
      <header className="edu-head">
        <div>
          <h1>Artikel Kesehatan</h1>
          <p>Temukan panduan, tips, dan wawasan terbaru untuk menjaga kesehatan fisik dan mental kamu setiap hari.</p>
        </div>
        <div className="edu-search">
          <Search size={20} />
          <input type="text" placeholder="Cari artikel kesehatan..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} aria-label="Cari artikel kesehatan" />
          {searchQuery && <button onClick={() => setSearchQuery('')} aria-label="Bersihkan pencarian"><X size={16}/></button>}
        </div>
      </header>

      <nav className="edu-tabs" role="tablist">
        {categories.map(cat => (
          <button key={cat.value} role="tab" aria-selected={selectedCategory === cat.value} onClick={() => setSelectedCategory(cat.value)} className={`edu-tab ${selectedCategory === cat.value ? 'active' : ''}`}>
            {cat.label}
          </button>
        ))}
      </nav>

      {displayArticles.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          {selectedCategory === 'saved'
            ? <Bookmark size={48} style={{ margin: '0 auto 16px', color: 'var(--gold)' }} />
            : <AlertCircle size={48} style={{ margin: '0 auto 16px', color: 'var(--gold)' }} />}
          <h3>{selectedCategory === 'saved' ? 'Belum ada artikel tersimpan' : noArticlesAtAll ? 'Belum ada artikel' : 'Tidak ada artikel cocok'}</h3>
          {!noArticlesAtAll && selectedCategory !== 'saved' && (
            <button className="btn btn-ghost" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>Reset Filter</button>
          )}
        </div>
      ) : selectedCategory === 'saved' ? (
        <>
          {displayArticles.map((article, index) => (
            <section key={article.id} style={{ marginBottom: index < displayArticles.length - 1 ? '16px' : 0 }}>
              <article className="edu-hero">
                <div className="hero-text">
                  {renderMeta(article)}
                  <h2>{article.title}</h2>
                  <p>{article.excerpt}</p>
                  <Link className="btn btn-primary" to={`/dashboard/articles/${article.slug}`}>Baca Selengkapnya</Link>
                </div>
                {renderMedia(article)}
              </article>
            </section>
          ))}
        </>
      ) : (
        <>
          {featured && (
            <section>
              <article className="edu-hero" style={{ marginTop: 0 }}>
                <div className="hero-text">
                  {renderMeta(featured)}
                  <h2>{featured.title}</h2>
                  <p>{featured.excerpt}</p>
                  <Link className="btn btn-primary" to={`/dashboard/articles/${featured.slug}`}>Baca Selengkapnya</Link>
                </div>
                {renderMedia(featured)}
              </article>
            </section>
          )}

           {rest.length > 0 && (
             <section>
               <div className="edu-sec-title">
                 <h2>Artikel Terbaru</h2>
                 <button className="edu-more" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>Lihat Semua</button>
               </div>
               <div className="edu-latest">
                 {rest[0] && (
                   <Link to={`/dashboard/articles/${rest[0].slug}`} className="edu-card-v2 big">
                     {renderMedia(rest[0])}
                     {renderMeta(rest[0])}
                     <h3>{rest[0].title}</h3>
                     <p className="edu-ex">{rest[0].excerpt}</p>
                   </Link>
                 )}
                 <div className="edu-stack">
                   {rest.slice(1, 4).map(article => (
                     <Link key={article.id} to={`/dashboard/articles/${article.slug}`} className="edu-card-v2 row">
                       {renderMedia(article)}
                       <div>
                         {renderMeta(article)}
                         <h3>{article.title}</h3>
                         <p className="edu-ex">{article.excerpt}</p>
                       </div>
                     </Link>
                   ))}
                 </div>
               </div>
             </section>
           )}
        </>
      )}
    </div>
  );
}

export default UserArticles;
