import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Users, FileText, ClipboardCheck, Target, TrendingUp, Activity,
  ArrowUpRight, ArrowDownRight, Minus
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
  }, []);

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

  return (
    <div className="tab-panel admin-overview">
      {/* Header Section */}
      <div className="overview-header">
        <div>
          <h1 className="overview-title">Ringkasan Admin</h1>
          <p className="overview-subtitle">Monitoring performa platform dan aktivitas pengguna</p>
        </div>
        <div className="overview-actions">
          <button className="btn btn-secondary">
            <Activity size={16} strokeWidth={2} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Grid - 4 Cards */}
      <div className="kpi-grid">
        <StatCard
          title="Total Pengguna"
          value={stats.users}
          subtitle={`${stats.activeUsers} aktif 7 hari`}
          icon={Users}
          trend={parseFloat(userTrendPct)}
          trendLabel={`${userTrendPct > 0 ? '+' : ''}${userTrendPct}% vs minggu lalu`}
          color="#3b82f6"
        />
        <StatCard
          title="Total Artikel"
          value={stats.articles}
          subtitle="Konten edukasi tersedia"
          icon={FileText}
          color="#10b981"
        />
        <StatCard
          title="Hasil Assessment"
          value={stats.assessments}
          subtitle="Screening selesai"
          icon={ClipboardCheck}
          color="#f59e0b"
        />
        <StatCard
          title="Kebiasaan Aktif"
          value={stats.completedHabits}
          subtitle={`Dari ${stats.habits} total kebiasaan`}
          icon={Target}
          trend={stats.habits > 0 ? ((stats.completedHabits / stats.habits) * 100).toFixed(1) : 0}
          trendLabel={`${((stats.completedHabits / stats.habits) * 100).toFixed(1)}% completion`}
          color="#8b5cf6"
        />
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* User Growth Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Pertumbuhan Pengguna</h3>
              <p className="chart-subtitle">7 hari terakhir</p>
            </div>
            <TrendingUp size={18} strokeWidth={2} className="chart-icon" />
          </div>
          <div className="chart-area" style={{ height: '180px' }}>
            <MiniLineChart data={userTrend} color="#3b82f6" />
          </div>
          <div className="chart-insight">
            <span className="insight-dot" style={{ background: '#3b82f6' }} />
            <span>{lastWeekUsers} pendaftar baru minggu ini</span>
          </div>
        </div>

        {/* Assessment Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Distribusi Assessment</h3>
              <p className="chart-subtitle">Kategori hasil screening</p>
            </div>
            <ClipboardCheck size={18} strokeWidth={2} className="chart-icon" />
          </div>
          <div className="chart-area" style={{ height: '220px' }}>
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

      {/* Quick Stats Row */}
      <div className="quick-stats-grid">
        <div className="quick-stat">
          <div className="quick-stat-icon" style={{ background: '#3b82f615', color: '#3b82f6' }}>
            <Users size={18} strokeWidth={2} />
          </div>
          <div>
            <div className="quick-stat-value">{((stats.activeUsers / stats.users) * 100).toFixed(1)}%</div>
            <div className="quick-stat-label">Retensi 7 hari</div>
          </div>
        </div>
        <div className="quick-stat">
          <div className="quick-stat-icon" style={{ background: '#10b98115', color: '#10b981' }}>
            <FileText size={18} strokeWidth={2} />
          </div>
          <div>
            <div className="quick-stat-value">{(stats.articles / Math.max(stats.users, 1)).toFixed(1)}</div>
            <div className="quick-stat-label">Artikel per user</div>
          </div>
        </div>
        <div className="quick-stat">
          <div className="quick-stat-icon" style={{ background: '#f59e0b15', color: '#f59e0b' }}>
            <ClipboardCheck size={18} strokeWidth={2} />
          </div>
          <div>
            <div className="quick-stat-value">{(stats.assessments / Math.max(stats.users, 1)).toFixed(1)}</div>
            <div className="quick-stat-label">Assessment per user</div>
          </div>
        </div>
        <div className="quick-stat">
          <div className="quick-stat-icon" style={{ background: '#8b5cf615', color: '#8b5cf6' }}>
            <Target size={18} strokeWidth={2} />
          </div>
          <div>
            <div className="quick-stat-value">{(stats.completedHabits / Math.max(stats.habits, 1) * 100).toFixed(1)}%</div>
            <div className="quick-stat-label">Habit completion</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;