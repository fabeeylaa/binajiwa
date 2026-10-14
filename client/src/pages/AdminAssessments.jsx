import { useEffect, useState } from 'react';
import { 
  Search, Calendar, User, Activity, TrendingDown, 
  TrendingUp, Minus, Filter, X, Download, 
  AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import '../pages/Dashboard.css';

function AdminAssessments() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const resultsPerPage = 12;

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

  const categories = [...new Set(results.map(r => r.category_label))];
  
  const stats = {
    total: results.length,
    flagged: results.filter(r => r.flagged).length,
    byCategory: categories.reduce((acc, cat) => {
      acc[cat] = results.filter(r => r.category_label === cat).length;
      return acc;
    }, {}),
    avgScore: results.length ? (results.reduce((sum, r) => sum + r.total_score, 0) / results.length).toFixed(1) : 0
  };

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

  const flaggedResults = filteredResults.filter(r => r.flagged);
  const normalResults = filteredResults.filter(r => !r.flagged);

  const healthStatus = stats.total > 0 
    ? ((stats.flagged / stats.total) * 100).toFixed(1) 
    : 0;
  
  const getHealthLevel = () => {
    const pct = parseFloat(healthStatus);
    if (pct < 5) return { label: 'Sehat', color: '#10b981', icon: '●' };
    if (pct < 15) return { label: 'Stabil', color: '#f59e0b', icon: '●' };
    return { label: 'Perlu Perhatian', color: '#ef4444', icon: '●' };
  };

  const health = getHealthLevel();

  const handleExport = (scope) => {
    const dataToExport = scope === 'filtered' ? filteredResults : results;
    const csv = generateCSV(dataToExport);
    downloadCSV(csv, `assessment_export_${new Date().toISOString().split('T')[0]}.csv`);
    setShowExportDialog(false);
  };

  const generateCSV = (data) => {
    const headers = ['Tanggal', 'Waktu', 'Nama Pengguna', 'Email', 'Kategori', 'Skor', 'Status'];
    const rows = data.map(r => [
      new Date(r.created_at).toLocaleDateString('id-ID'),
      new Date(r.created_at).toLocaleTimeString('id-ID'),
      r.user_name || 'N/A',
      r.user_email || 'N/A',
      r.category_label || 'N/A',
      r.total_score || 0,
      r.flagged ? 'Flagged' : 'Normal'
    ]);
    
    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    return csvContent;
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      {/* Header */}
      <div className="overview-header">
        <div>
          <h1 className="overview-title">Hasil Assessment</h1>
          <p className="overview-subtitle">Monitoring hasil screening kesehatan mental pengguna</p>
        </div>
        <div className="overview-actions">
          <button className="btn btn-secondary" onClick={() => setShowExportDialog(true)}>
            <Download size={16} strokeWidth={2} />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Health Hero */}
      <div className="health-hero">
        <div className="health-indicator">
          <div className="health-dot" style={{ background: health.color }}>
            <div className="health-pulse" style={{ background: health.color }} />
          </div>
          <div className="health-info">
            <div className="health-label">Status Platform</div>
            <div className="health-status" style={{ color: health.color }}>{health.label}</div>
          </div>
        </div>
        <div className="health-metrics">
          <div className="health-metric">
            <span className="metric-value">{((stats.total - stats.flagged) / Math.max(stats.total, 1) * 100).toFixed(0)}%</span>
            <span className="metric-label">Normal</span>
          </div>
          <div className="health-metric">
            <span className="metric-value">{stats.flagged}</span>
            <span className="metric-label">Flagged</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="assessment-stats">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#3b82f615', color: '#3b82f6' }}>
            <Activity size={18} strokeWidth={2} />
          </div>
          <div className="stat-card-content">
            <div className="stat-card-value">{stats.total}</div>
            <div className="stat-card-label">Total Assessment</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#10b98115', color: '#10b981' }}>
            <User size={18} strokeWidth={2} />
          </div>
          <div className="stat-card-content">
            <div className="stat-card-value">{stats.avgScore}</div>
            <div className="stat-card-label">Rata-Rata Skor</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#f59e0b15', color: '#f59e0b' }}>
            <AlertCircle size={18} strokeWidth={2} />
          </div>
          <div className="stat-card-content">
            <div className="stat-card-value">{stats.flagged}</div>
            <div className="stat-card-label">Flagged Results</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#8b5cf615', color: '#8b5cf6' }}>
            <Calendar size={18} strokeWidth={2} />
          </div>
          <div className="stat-card-content">
            <div className="stat-card-value">{categories.length}</div>
            <div className="stat-card-label">Kategori</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card filter-card">
        <div className="search-box">
          <Search size={18} strokeWidth={2} className="search-icon" />
          <input
            type="text"
            placeholder="Cari nama, email, atau kategori..."
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

        <div className="filter-chips">
          {selectedCategory !== 'all' && (
            <div className="filter-chip">
              <span>{selectedCategory}</span>
              <button onClick={() => setSelectedCategory('all')}><X size={14} /></button>
            </div>
          )}
          {dateFilter !== 'all' && (
            <div className="filter-chip">
              <span>{dateFilter === 'week' ? '7 Hari Terakhir' : '30 Hari Terakhir'}</span>
              <button onClick={() => setDateFilter('all')}><X size={14} /></button>
            </div>
          )}
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="filter-select">
            <option value="all">Semua Kategori</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="filter-select">
            <option value="all">Semua Waktu</option>
            <option value="week">7 Hari Terakhir</option>
            <option value="month">30 Hari Terakhir</option>
          </select>
        </div>
      </div>

      {/* Flagged Results */}
      {flaggedResults.length > 0 && (
        <div className="results-section">
          <div className="section-header">
            <h3 className="section-title">Hasil Flagged ({flaggedResults.length})</h3>
            <span className="section-badge" style={{ background: '#ef444415', color: '#ef4444' }}>Perlu Perhatian</span>
          </div>
          <div className="results-grid">
            {flaggedResults.map((result) => (
              <AssessmentCard
                key={result.id}
                result={result}
                isExpanded={expandedId === result.id}
                onToggle={() => setExpandedId(expandedId === result.id ? null : result.id)}
                getCategoryColor={getCategoryColor}
              />
            ))}
          </div>
        </div>
      )}

      {/* Normal Results */}
      {normalResults.length > 0 && (
        <div className="results-section">
          <div className="section-header">
            <h3 className="section-title">Hasil Normal ({normalResults.length})</h3>
          </div>
          <div className="results-grid">
            {normalResults.slice(
              (currentPage - 1) * resultsPerPage,
              currentPage * resultsPerPage
            ).map((result) => (
              <AssessmentCard
                key={result.id}
                result={result}
                isExpanded={expandedId === result.id}
                onToggle={() => setExpandedId(expandedId === result.id ? null : result.id)}
                getCategoryColor={getCategoryColor}
              />
            ))}
          </div>
          {Math.ceil(normalResults.length / resultsPerPage) > 1 && (
            <div className="pagination">
              {Array.from({ length: Math.ceil(normalResults.length / resultsPerPage) }).map((_, i) => (
                <button
                  key={i + 1}
                  className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {filteredResults.length === 0 && (
        <div className="empty-state">
          <Activity size={48} strokeWidth={1.5} />
          <p>Tidak ada hasil yang ditemukan.</p>
        </div>
      )}

      {/* Export Dialog */}
      {showExportDialog && (
        <div className="modal-backdrop" onClick={() => setShowExportDialog(false)}>
          <div className="modal-card card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Ekspor Data Assessment</h3>
              <button className="btn-icon" onClick={() => setShowExportDialog(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-content" style={{ padding: '20px 0' }}>
              <p style={{ marginBottom: '20px', color: 'var(--on-surface-variant)' }}>
                Pilih data yang ingin dieksport:
              </p>
              <div className="modal-footer" style={{ flexDirection: 'column', gap: '12px', borderTop: 'none', paddingTop: 0, marginTop: 0 }}>
                <button
                  className="btn btn-primary"
                  onClick={() => handleExport('filtered')}
                  style={{ width: '100%' }}
                >
                  Ekspor Data Terpilter ({filteredResults.length})
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleExport('all')}
                  style={{ width: '100%' }}
                >
                  Ekspor Semua Data ({stats.total})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AssessmentCard({ result, isExpanded, onToggle, getCategoryColor }) {
  const categoryColor = getCategoryColor(result.category_label);
  
  return (
    <div className="assessment-card" onClick={onToggle}>
      <div className="card-header">
        <div className="card-header-left">
          <div className="card-category-badge" style={{ background: `${categoryColor}15`, color: categoryColor }}>
            {result.category_label}
          </div>
          <div className="card-user-info">
            <div className="card-user-name">{result.user_name || 'N/A'}</div>
            <div className="card-user-email">{result.user_email || 'N/A'}</div>
          </div>
        </div>
        <div className="card-score-display">
          <div className="card-score-value">{result.total_score}</div>
          {result.flagged && (
            <div className="card-flagged-badge">
              <AlertCircle size={14} strokeWidth={2} />
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="card-detail">
          <div className="detail-row">
            <span className="detail-label">Tanggal:</span>
            <span className="detail-value">
              {new Date(result.created_at).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Waktu:</span>
            <span className="detail-value">
              {new Date(result.created_at).toLocaleTimeString('id-ID')}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Status:</span>
            <span className="detail-value" style={{ color: result.flagged ? '#ef4444' : '#10b981' }}>
              {result.flagged ? 'Flagged' : 'Normal'}
            </span>
          </div>
        </div>
      )}

      <div className="card-toggle">
        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>
    </div>
  );
}

export default AdminAssessments;