import { useEffect, useState } from 'react';
import { ARTICLE_CATEGORIES, categoryLabel } from '../utils/articleCategories';
import { 
  FileText, Plus, Search, Edit3, Trash2, Eye, Calendar, 
  Tag, AlertCircle, X, CheckCircle2 
} from 'lucide-react';
import '../pages/Dashboard.css';

const DEFAULT_CATEGORY = ARTICLE_CATEGORIES[0].value;

function AdminArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: DEFAULT_CATEGORY,
    excerpt: '',
    cover_image: ''
  });
  const [formError, setFormError] = useState('');
  const [viewingArticle, setViewingArticle] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/articles?page=1&limit=50');
      const data = await res.json();
      setArticles(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus artikel ini?')) return;
    try {
      const res = await fetch(`/api/articles/admin/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setArticles(articles.filter(a => a.id !== id));
      } else {
        const data = await res.json();
        alert(data.message || 'Gagal menghapus artikel');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus artikel');
    }
  };

  const openEditModal = (article) => {
    setEditingId(article.id);
    const currentCategory = String(article.category || '').toLowerCase();
    setFormData({
      title: article.title,
      content: article.content,
      category: ARTICLE_CATEGORIES.some((c) => c.value === currentCategory)
        ? currentCategory
        : DEFAULT_CATEGORY,
      excerpt: article.excerpt || '',
      cover_image: article.cover_image || ''
    });
    setFormError('');
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ title: '', content: '', category: DEFAULT_CATEGORY, excerpt: '', cover_image: '' });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim() || !formData.content.trim()) {
      setFormError('Judul dan konten wajib diisi');
      return;
    }

    try {
      const url = editingId ? `/api/articles/admin/${editingId}` : '/api/articles/admin';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.message || `Gagal ${editingId ? 'mengubah' : 'menambah'} artikel`);
        return;
      }

      setShowModal(false);
      fetchArticles();
    } catch (err) {
      console.error(err);
      setFormError(`Gagal ${editingId ? 'mengubah' : 'menambah'} artikel`);
    }
  };

  // Filter articles based on search and category
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (article.excerpt && article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return (
    <div className="tab-panel" style={{ minHeight: '400px' }}>
      <div className="skeleton-grid">
        {[1,2,3].map(i => <div key={i} className="skeleton-card" />)}
      </div>
    </div>
  );

  return (
    <div className="tab-panel admin-articles">
      {/* Header Section */}
      <div className="overview-header">
        <div>
          <h1 className="overview-title">Manajemen Artikel</h1>
          <p className="overview-subtitle">Kelola dan publikasikan konten edukasi kesehatan mental</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} strokeWidth={2.5} />
          <span>Tambah Artikel</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="card filter-card">
        <div className="search-box">
          <Search size={18} strokeWidth={2} className="search-icon" />
          <input
            type="text"
            placeholder="Cari judul atau ringkasan artikel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>
        <div className="category-filters">
          <button
            className={`filter-pill ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            Semua ({articles.length})
          </button>
          {ARTICLE_CATEGORIES.map(cat => {
            const count = articles.filter(a => a.category === cat.value).length;
            return (
              <button
                key={cat.value}
                className={`filter-pill ${selectedCategory === cat.value ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Articles Table Card */}
      <div className="card">
        <div className="table-header-row">
          <h3 className="chart-title">Daftar Artikel ({filteredArticles.length})</h3>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} strokeWidth={1.5} />
            <p>Tidak ada artikel yang ditemukan.</p>
            {searchQuery || selectedCategory !== 'all' ? (
              <button className="btn btn-sm btn-secondary" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
                Reset Filter
              </button>
            ) : (
              <button className="btn btn-sm btn-primary" onClick={openAddModal}>
                Tambah Artikel Baru
              </button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Judul Artikel</th>
                  <th>Kategori</th>
                  <th>Tanggal Dibuat</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map(article => (
                  <tr key={article.id}>
                    <td>
                      <div className="article-title-cell">
                        <span className="font-weight-600 text-ink">{article.title}</span>
                        {article.excerpt && <span className="article-excerpt-preview">{article.excerpt}</span>}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-category">
                        {categoryLabel(article.category)}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted font-mono text-sm">
                        {new Date(article.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon"
                          title="Lihat"
                          onClick={() => setViewingArticle(article)}
                        >
                          <Eye size={16} strokeWidth={2} />
                        </button>
                        <button
                          className="btn-icon"
                          title="Edit"
                          onClick={() => openEditModal(article)}
                        >
                          <Edit3 size={16} strokeWidth={2} />
                        </button>
                        <button
                          className="btn-icon btn-danger"
                          title="Hapus"
                          onClick={() => handleDelete(article.id)}
                        >
                          <Trash2 size={16} strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-card card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Artikel' : 'Tambah Artikel Baru'}</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="form-alert error">
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label>Judul Artikel *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Mengenal Gejala Kecemasan Berlebih"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {ARTICLE_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>URL Cover Image</label>
                  <input
                    type="url"
                    value={formData.cover_image}
                    onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Ringkasan (Excerpt)</label>
                <input
                  type="text"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Ringkasan singkat yang muncul di card artikel..."
                />
              </div>

              <div className="form-group">
                <label>Konten Lengkap *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Tulis atau tempel isi artikel lengkap di sini..."
                  rows={10}
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Perbarui Artikel' : 'Publikasikan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Article Modal */}
      {viewingArticle && (
        <div className="modal-backdrop" onClick={() => setViewingArticle(null)}>
          <div className="modal-card card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="badge badge-category" style={{ marginBottom: '8px', display: 'inline-block' }}>
                  {categoryLabel(viewingArticle.category)}
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink-900)', margin: 0 }}>
                  {viewingArticle.title}
                </h2>
                <span className="text-muted font-mono text-xs" style={{ display: 'block', marginTop: '4px' }}>
                  Dipublikasikan pada {new Date(viewingArticle.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <button className="btn-icon" onClick={() => setViewingArticle(null)}>
                <X size={20} />
              </button>
            </div>

            {viewingArticle.excerpt && (
              <div className="article-preview-excerpt">
                {viewingArticle.excerpt}
              </div>
            )}

            <div className="article-preview-content">
              {viewingArticle.content}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { const a = viewingArticle; setViewingArticle(null); openEditModal(a); }}>
                Edit Artikel Ini
              </button>
              <button className="btn btn-primary" onClick={() => setViewingArticle(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminArticles;