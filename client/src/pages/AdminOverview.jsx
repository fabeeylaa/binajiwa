import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Users, FileText, ClipboardCheck, Target, TrendingUp, Activity,
  ArrowUpRight, ArrowDownRight, Minus, Edit3
} from 'lucide-react';
import '../pages/Dashboard.css';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function StatCard({ title, value, subtitle, icon: Icon, trend, trendLabel, color = 'var(--primary)' }) {
  const trendIcon = trend > 0 ? ArrowUpRight : trend < 0 ? ArrowDownRight : Minus;
  const trendColor = trend > 0 ? '#10b981' : trend < 0 ? '#ef4444' : 'var(--on-surface-variant)';
  
  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <div className="kpi-icon" style={{ background: `${color}15`, color }}>
          <Icon size={20} strokeWidth={2} />
        </div>
        {trend !== null && (
          <div className="kpi-trend" style={{ color: trendColor }}>
            <trendIcon size={14} strokeWidth={2.5} />
            <span>{trendLabel}</span>
          </div>
        )}
      </div>
      <div className="kpi-value">{value.toLocaleString('id-ID')}</div>
      <div className="kpi-label">{title}</div>
      {subtitle && <div className="kpi-sub">{subtitle}</div>}
    </div>
  );
}

function MiniLineChart({ data, color = '#3b82f6' }) {
  if (!data?.length) return <div className="mini-chart-placeholder" />;
  
  const chartData = [...data].reverse().map((d, i) => ({
    name: new Date(d.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
    value: d.count
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--on-surface-variant)' }} axisLine={false} tickLine={false} />
        <YAxis axisLine={false} tickLine={false} tick={false} />
        <Tooltip 
          contentStyle={{ 
            background: 'var(--surface)', 
            border: '1px solid var(--outline)', 
            borderRadius: '8px',
            boxShadow: 'var(--shadow-float)'
          }}
          formatter={(v) => [v.toLocaleString('id-ID'), 'User Baru']}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: color }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function AssessmentPieChart({ data }) {
  if (!data?.length) return <div className="mini-chart-placeholder" />;
  
  const total = data.reduce((sum, d) => sum + d.count, 0);
  
  return (
    <div className="pie-chart-wrapper">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={60}
            paddingAngle={2}
            dataKey="count"
            nameKey="category_label"
            label={({ category_label, count, percent }) => 
              `${category_label} ${(percent * 100).toFixed(0)}%`
            }
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              background: 'var(--surface)', 
              border: '1px solid var(--outline)', 
              borderRadius: '8px',
              boxShadow: 'var(--shadow-float)'
            }}
            formatter={(v, name) => [v.toLocaleString('id-ID'), name]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pie-center">
        <div className="pie-total">{total.toLocaleString('id-ID')}</div>
        <div className="pie-total-label">Total Assessment</div>
      </div>
    </div>
  );
}

function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = () => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data.stats);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  if (loading) return (
    <div className="tab-panel" style={{ minHeight: '400px' }}>
      <div className="skeleton-grid">
        {[1,2,3,4].map(i => <div key={i} className="skeleton-card" />)}
      </div>
    </div>
  );
  if (!stats) return <div className="tab-panel">Gagal memuat data</div>;

  const userTrend = stats.userTrend || [];
  const lastWeekUsers = userTrend.slice(0, 7).reduce((sum, d) => sum + d.count, 0);
  const prevWeekUsers = userTrend.slice(7, 14).reduce((sum, d) => sum + d.count, 0);
  const userTrendPct = prevWeekUsers > 0 ? ((lastWeekUsers - prevWeekUsers) / prevWeekUsers * 100).toFixed(1) : 0;

  const retentionRate = ((stats.activeUsers / stats.users) * 100).toFixed(1);
  const engagementScore = ((stats.assessments / Math.max(stats.users, 1)) * 100).toFixed(0);
  
  const getHealthStatus = () => {
    if (retentionRate > 50 && engagementScore > 70) return { label: 'Sehat', color: '#10b981', icon: '●' };
    if (retentionRate > 30 || engagementScore > 40) return { label: 'Stabil', color: '#f59e0b', icon: '●' };
    return { label: 'Perlu Perhatian', color: '#ef4444', icon: '●' };
  };

  const health = getHealthStatus();

  return (
    <div className="tab-panel admin-overview">
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
            <span className="metric-value">{retentionRate}%</span>
            <span className="metric-label">Retensi 7 hari</span>
          </div>
          <div className="health-metric">
            <span className="metric-value">{engagementScore}%</span>
            <span className="metric-label">Skor Engagement</span>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={fetchStats}>
          <Activity size={16} strokeWidth={2} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Priority Dashboard */}
      <div className="priority-grid">
        <div className="priority-card">
          <div className="priority-icon" style={{ background: '#3b82f615', color: '#3b82f6' }}>
            <Users size={20} strokeWidth={2} />
          </div>
          <div className="priority-content">
            <div className="priority-title">Pengguna Baru</div>
            <div className="priority-value">{lastWeekUsers}</div>
            <div className="priority-subtitle">7 hari terakhir</div>
          </div>
          <div className="priority-trend" style={{ color: userTrendPct > 0 ? '#10b981' : '#ef4444' }}>
            {userTrendPct > 0 ? '↑' : '↓'} {Math.abs(userTrendPct)}%
          </div>
        </div>

        <div className="priority-card">
          <div className="priority-icon" style={{ background: '#f59e0b15', color: '#f59e0b' }}>
            <ClipboardCheck size={20} strokeWidth={2} />
          </div>
          <div className="priority-content">
            <div className="priority-title">Screening Aktif</div>
            <div className="priority-value">{stats.assessments}</div>
            <div className="priority-subtitle">Total assessment</div>
          </div>
          <div className="priority-badge" style={{ background: '#f59e0b10', color: '#f59e0b' }}>
            {((stats.assessments / Math.max(stats.users, 1)) * 100).toFixed(0)}% engagement
          </div>
        </div>

        <div className="priority-card">
          <div className="priority-icon" style={{ background: '#10b98115', color: '#10b981' }}>
            <FileText size={20} strokeWidth={2} />
          </div>
          <div className="priority-content">
            <div className="priority-title">Konten Edukasi</div>
            <div className="priority-value">{stats.articles}</div>
            <div className="priority-subtitle">Artikel tersedia</div>
          </div>
          <a href="/admin/articles" className="priority-link">
            <Edit3 size={14} strokeWidth={2} />
            <span>Kelola</span>
          </a>
        </div>

        <div className="priority-card">
          <div className="priority-icon" style={{ background: '#8b5cf615', color: '#8b5cf6' }}>
            <Target size={20} strokeWidth={2} />
          </div>
          <div className="priority-content">
            <div className="priority-title">Habit Tracker</div>
            <div className="priority-value">{stats.completedHabits}</div>
            <div className="priority-subtitle">Dari {stats.habits} total</div>
          </div>
          <div className="priority-progress">
            <div 
              className="progress-bar" 
              style={{ 
                width: `${(stats.completedHabits / Math.max(stats.habits, 1) * 100).toFixed(1)}%`,
                background: '#8b5cf6'
              }}
            />
          </div>
        </div>
      </div>

      {/* Data Sections */}
      <div className="dashboard-sections">
        {/* Growth Chart */}
        <div className="chart-section">
          <div className="section-header">
            <div>
              <h3 className="section-title">Pertumbuhan Pengguna</h3>
              <p className="section-subtitle">7 hari terakhir</p>
            </div>
            <div className="section-actions">
              <TrendingUp size={18} strokeWidth={2} style={{ color: 'var(--on-surface-variant)' }} />
            </div>
          </div>
          <div className="chart-card">
            <div className="chart-area" style={{ height: '200px' }}>
              <MiniLineChart data={userTrend} color="#3b82f6" />
            </div>
          </div>
          <div className="chart-footer">
            <span className="insight-dot" style={{ background: '#3b82f6' }} />
            <span className="chart-footer-text">{lastWeekUsers} pendaftar baru minggu ini</span>
          </div>
        </div>

        {/* Assessment Distribution */}
        <div className="chart-section">
          <div className="section-header">
            <div>
              <h3 className="section-title">Distribusi Hasil</h3>
              <p className="section-subtitle">Kategori screening terakhir</p>
            </div>
            <div className="section-actions">
              <ClipboardCheck size={18} strokeWidth={2} style={{ color: 'var(--on-surface-variant)' }} />
            </div>
          </div>
          <div className="chart-card">
            <div className="chart-area" style={{ height: '180px' }}>
              <AssessmentPieChart data={stats.assessmentStats} />
            </div>
            <div className="chart-legend">
              {stats.assessmentStats?.slice(0, 4).map((item, i) => (
                <div key={item.category_label} className="legend-item">
                  <span className="legend-color" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="legend-label">{item.category_label}</span>
                  <span className="legend-count">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: '#3b82f615', color: '#3b82f6' }}>
              <Users size={18} strokeWidth={2} />
            </div>
            <div className="stat-card-content">
              <div className="stat-card-value">{((stats.activeUsers / stats.users) * 100).toFixed(1)}%</div>
              <div className="stat-card-label">Retensi Aktif</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: '#10b98115', color: '#10b981' }}>
              <FileText size={18} strokeWidth={2} />
            </div>
            <div className="stat-card-content">
              <div className="stat-card-value">{(stats.articles / Math.max(stats.users, 1)).toFixed(1)}</div>
              <div className="stat-card-label">Artikel per User</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: '#f59e0b15', color: '#f59e0b' }}>
              <ClipboardCheck size={18} strokeWidth={2} />
            </div>
            <div className="stat-card-content">
              <div className="stat-card-value">{(stats.assessments / Math.max(stats.users, 1)).toFixed(1)}</div>
              <div className="stat-card-label">Assessment/User</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: '#8b5cf615', color: '#8b5cf6' }}>
              <Target size={18} strokeWidth={2} />
            </div>
            <div className="stat-card-content">
              <div className="stat-card-value">{(stats.completedHabits / Math.max(stats.habits, 1) * 100).toFixed(1)}%</div>
              <div className="stat-card-label">Habit Completion</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;