import { useEffect, useState } from 'react';
import { 
  Search, Calendar, User, Activity, TrendingDown, 
  TrendingUp, Minus, Filter, X, ChevronDown, Download, 
  AlertCircle, CheckCircle, Info
} from 'lucide-react';
import '../pages/Dashboard.css';

function AdminAssessments() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [viewingDetail, setViewingDetail] = useState(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await fetch('/api/admin/assessment-results');
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Unique categories from results
  const categories = [...new Set(results.map(r => r.category_label))];
  
  // Calculate stats
  const stats = {
    total: results.length,
    flagged: results.filter(r => r.flagged).length,
    byCategory: categories.reduce((acc, cat) => {
      acc[cat] = results.filter(r => r.category_label === cat).length;
      return acc;
    }, {}),
    avgScore: results.length ? (results.reduce((sum, r) => sum + r.total_score, 0) / results.length).toFixed(1) : 0
  };

  // Filter results
  const filteredResults = results.filter(result => {
    const matchesSearch = result.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         result.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         result.category_label?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || result.category_label === selectedCategory;
    
    const resultDate = new Date(result.created_at);
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    let matchesDate = true;
    if (dateFilter === 'week') matchesDate = resultDate >= oneWeekAgo;
    if (dateFilter === 'month') matchesDate = resultDate >= oneMonthAgo;
    
    return matchesSearch && matchesCategory && matchesDate;
  });

  // Get category color based on severity
  const getCategoryColor = (category) => {
    const colorMap = {
      'Ringan': '#10b981',
      'Sedang': '#f59e0b',
      'Berat': '#ef4444',
      'Normal': '#3b82f6',
      'Wasapada': '#f59e0b',
      'Darurat': '#ef4444',
    };
    return colorMap[category] || '#6b7280';
  };

  const getTrendIcon = (score) => {
    if (score > 70) return <TrendingUp size={14} strokeWidth={2} className="text-success" />;
    if (score < 30) return <TrendingDown size={14} strokeWidth={2} className="text-danger" />;
    return <Minus size={14} strokeWidth={2} className="text-muted" />;
  };

  if (loading) return (
    <div className="tab-panel" style={{ minHeight: '400px' }}>
      <div className="skeleton-grid">
        {[1,2,3].map(i => <div key={i} className="skeleton-card" />)}
      </div>
    </div>
  );

  return (
    <div className="tab-panel admin-assessments">
      {/* Header Section */}
      <div className="overview-header">
        <div>
          <h1 className="overview-title">Hasil Assessment</h1>
          <p className="overview-subtitle">Monitoring hasil screening kesehatan mental pengguna</p>
        </div>
        <div className="overview-actions">
          <button className="btn btn-secondary">
            <Download size={16} strokeWidth={2} />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon" style={{ background: '#3b82f615', color: '#3b82f6' }}>
              <Activity size={20} strokeWidth={2} />
            </div>
          </div>
          <div className="kpi-value">{stats.total.toLocaleString('id-ID')}</div>
          <div className="kpi-label">Total Assessment</div>
          <div className="kpi-sub">Seluruh riwayat screening</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon" style={{ background: '#10b98115', color: '#10b981' }}>
              <User size={20} strokeWidth={2} />
            </div>
          </div>
          <div className="kpi-value">{stats.avgScore}</div>
          <div className="kpi-label">Skor Rata-Rata</div>
          <div className="kpi-sub">Dari semua hasil</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon" style={{ background: '#f59e0b15', color: '#f59e0b' }}>
              <AlertCircle size={20} strokeWidth={2} />
            </div>
          </div>
          <div className="kpi-value">{stats.flagged}</div>
          <div className="kpi-label">Flagged Results</div>
          <div className="kpi-sub">Perlu perhatian khusus</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon" style={{ background: '#8b5cf615', color: '#8b5cf6' }}>
              <Calendar size={20} strokeWidth={2} />
            </div>
          </div>
          <div className="kpi-value">{categories.length}</div>
          <div className="kpi-label">Kategori Berbeda</div>
          <div className="kpi-sub">Jenis hasil assessment</div>
        </div>
      </div>

      {/* Filter & Search Card */}
      <div className="card filter-card">
        <div className="search-box">
          <Search size={18} strokeWidth={2} className="search-icon" />
          <input
            type="text"
            placeholder="Cari nama pengguna, email, atau kategori..."
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

        <div className="filter-row">
          <div className="filter-group">
            <Filter size={14} strokeWidth={2} className="filter-icon" />
            <span className="filter-label">Filter:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">Semua Kategori</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <Calendar size={14} strokeWidth={2} className="filter-icon" />
            <span className="filter-label">Rentang:</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Semua Waktu</option>
              <option value="week">7 Hari Terakhir</option>
              <option value="month">30 Hari Terakhir</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Table Card */}
      <div className="card">
        <div className="table-header-row">
          <h3 className="chart-title">
            Hasil Screening ({filteredResults.length})
            {filteredResults.length !== results.length && (
              <span className="text-muted" style={{ fontSize: '13px', marginLeft: '8px' }}>
                (Difilter)
              </span>
            )}
          </h3>
          <div className="text-sm text-muted">
            Menampilkan {Math.min(filteredResults.length, 50)} dari {filteredResults.length} hasil
          </div>
        </div>

        {filteredResults.length === 0 ? (
          <div className="empty-state">
            <Activity size={48} strokeWidth={1.5} />
            <p>Tidak ada hasil screening yang ditemukan.</p>
            {(searchQuery || selectedCategory !== 'all' || dateFilter !== 'all') && (
              <button 
                className="btn btn-sm btn-secondary" 
                onClick={() => { 
                  setSearchQuery(''); 
                  setSelectedCategory('all');
                  setDateFilter('all');
                }}
              >
                Reset Semua Filter
              </button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '140px' }}>Tanggal</th>
                  <th style={{ width: '30%' }}>Pengguna</th>
                  <th>Kategori</th>
                  <th>Skor</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center' }}>Detail</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.slice(0, 50).map((result, idx) => {
                  const categoryColor = getCategoryColor(result.category_label);
                  const isFlagged = result.flagged;
                  
                  return (
                    <tr key={idx}>
                      <td>
                        <div className="font-mono text-sm">
                          {new Date(result.created_at).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short'
                          })}
                        </div>
                        <div className="font-mono text-xs text-muted">
                          {new Date(result.created_at).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td>
                        <div className="article-title-cell">
                          <span className="font-weight-600 text-ink">{result.user_name || 'N/A'}</span>
                          <span className="article-excerpt-preview">
                            {result.user_email || 'Email tidak tersedia'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span 
                          className="badge" 
                          style={{ 
                            background: `${categoryColor}15`, 
                            color: categoryColor,
                            border: `1px solid ${categoryColor}30`
                          }}
                        >
                          {result.category_label}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-weight-600 text-ink">{result.total_score}</span>
                          {getTrendIcon(result.total_score)}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {isFlagged ? (
                          <span className="badge" style={{ background: '#ef444415', color: '#ef4444', border: '1px solid #ef444430' }}>
                            Flagged
                          </span>
                        ) : (
                          <span className="badge" style={{ background: '#10b98115', color: '#10b981', border: '1px solid #10b98130' }}>
                            Normal
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          className="btn-icon"
                          onClick={() => setViewingDetail(result)}
                          title="Lihat detail"
                        >
                          <Info size={16} strokeWidth={2} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {viewingDetail && (
        <div className="modal-backdrop" onClick={() => setViewingDetail(null)}>
          <div className="modal-card card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div>
                <h3>Detail Hasil Assessment</h3>
                <p className="text-sm text-muted" style={{ marginTop: '4px' }}>
                  ID: {viewingDetail.id}
                </p>
              </div>
              <button className="btn-icon" onClick={() => setViewingDetail(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="form-group" style={{ gap: '12px' }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase text-muted">Nama Pengguna</label>
                  <div className="font-weight-600 text-ink" style={{ marginTop: '4px' }}>
                    {viewingDetail.user_name || 'Tidak diketahui'}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-muted">Email</label>
                  <div className="text-ink" style={{ marginTop: '4px', fontSize: '14px' }}>
                    {viewingDetail.user_email || 'Tidak tersedia'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase text-muted">Tanggal Screening</label>
                  <div className="font-mono text-sm" style={{ marginTop: '4px' }}>
                    {new Date(viewingDetail.created_at).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-muted">Total Skor</label>
                  <div className="font-mono font-weight-600 text-ink text-lg" style={{ marginTop: '4px' }}>
                    {viewingDetail.total_score}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-muted">Kategori Hasil</label>
                <div style={{ marginTop: '8px' }}>
                  <span 
                    className="badge" 
                    style={{ 
                      background: `${getCategoryColor(viewingDetail.category_label)}15`, 
                      color: getCategoryColor(viewingDetail.category_label),
                      border: `1px solid ${getCategoryColor(viewingDetail.category_label)}30`,
                      fontSize: '13px',
                      padding: '8px 12px'
                    }}
                  >
                    {viewingDetail.category_label}
                  </span>
                  {viewingDetail.flagged && (
                    <span 
                      className="badge" 
                      style={{ 
                        marginLeft: '8px',
                        background: '#ef444415', 
                        color: '#ef4444',
                        border: '1px solid #ef444430'
                      }}
                    >
                      Flagged
                    </span>
                  )}
                </div>
              </div>

              {viewingDetail.assessment_title && (
                <div>
                  <label className="text-xs font-semibold uppercase text-muted">Jenis Assessment</label>
                  <div className="text-ink" style={{ marginTop: '4px', fontSize: '14px' }}>
                    {viewingDetail.assessment_title}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold uppercase text-muted">Catatan Admin</label>
                <textarea
                  placeholder="Tambahkan catatan atau tindak lanjut untuk hasil ini..."
                  rows={4}
                  style={{ 
                    width: '100%', 
                    marginTop: '4px',
                    padding: '10px 12px',
                    border: '1px solid var(--outline-variant)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-ghost" 
                onClick={() => setViewingDetail(null)}
              >
                Tutup
              </button>
              <button className="btn btn-primary">
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper CSS classes
const styles = `
.flex { display: flex; }
.items-center { align-items: center; }
.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }
.grid { display: grid; }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.text-lg { font-size: 18px; }
.text-sm { font-size: 12px; }
.text-xs { font-size: 11px; }
.text-success { color: #10b981; }
.text-danger { color: #ef4444; }
`;

export default AdminAssessments;