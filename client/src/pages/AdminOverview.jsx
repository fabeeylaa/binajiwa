import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Users, FileText, ClipboardCheck, Target, RefreshCw,
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import '../pages/Dashboard.css';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const safeDiv = (a, b) => (b > 0 ? a / b : 0);
const pct = (a, b) => Math.min(100, safeDiv(a, b) * 100);

const tooltipStyle = {
  background: '#fff',
  border: 'none',
  borderRadius: '12px',
  boxShadow: '0 8px 24px rgba(20,51,42,.12)',
  fontSize: '12px',
  padding: '8px 12px'
};

const css = `
.ov{display:flex;flex-direction:column;gap:20px}
.ov-head{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
.ov-title{font-size:24px;font-weight:700;margin:0;color:var(--ink-900,#14332a)}
.ov-sub{margin:4px 0 0;font-size:13px;color:var(--on-surface-variant,#5f7a6e)}
.ov-head-right{display:flex;align-items:center;gap:10px}
.ov-pill{display:inline-flex;align-items:center;gap:8px;padding:9px 14px;border-radius:999px;font-size:13px;font-weight:600;background:#fff}
.ov-pill i{width:8px;height:8px;border-radius:50%;display:inline-block}
.ov-refresh{display:inline-flex;align-items:center;gap:8px;padding:9px 14px;border-radius:999px;border:none;background:var(--ink-900,#14332a);color:#fff;font-size:13px;font-weight:600;cursor:pointer;transition:opacity .15s}
.ov-refresh:hover{opacity:.88}
.ov-card{background:#fff;border-radius:20px;padding:20px}
.ov-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.ov-kpi{display:flex;flex-direction:column;gap:6px;transition:transform .15s}
.ov-kpi:hover{transform:translateY(-2px)}
.ov-kpi-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.ov-icon{width:42px;height:42px;border-radius:14px;display:flex;align-items:center;justify-content:center}
.ov-chip{display:inline-flex;align-items:center;gap:2px;padding:4px 8px;border-radius:999px;font-size:12px;font-weight:600}
.ov-value{font-size:30px;font-weight:700;line-height:1.1;color:var(--ink-900,#14332a)}
.ov-label{font-size:13px;font-weight:600;color:var(--ink-900,#14332a)}
.ov-hint{font-size:12px;color:var(--on-surface-variant,#5f7a6e)}
.ov-bar{height:6px;border-radius:99px;background:#eef3f0;overflow:hidden;margin-top:8px}
.ov-bar span{display:block;height:100%;border-radius:99px}
.ov-link{font-size:12px;font-weight:600;color:var(--primary,#16a34a);text-decoration:none;margin-top:8px}
.ov-link:hover{text-decoration:underline}
.ov-charts{display:grid;grid-template-columns:1.5fr 1fr;gap:16px}
.ov-card-head{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:16px}
.ov-card-title{font-size:16px;font-weight:700;margin:0;color:var(--ink-900,#14332a)}
.ov-card-sub{font-size:12px;color:var(--on-surface-variant,#5f7a6e)}
.ov-area{height:240px}
.ov-empty{height:240px;display:flex;align-items:center;justify-content:center;font-size:13px;color:var(--on-surface-variant,#5f7a6e)}
.ov-donut{position:relative;height:190px}
.ov-donut-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none}
.ov-donut-total{font-size:28px;font-weight:700;color:var(--ink-900,#14332a);line-height:1}
.ov-donut-label{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--on-surface-variant,#5f7a6e);margin-top:4px}
.ov-legend{display:flex;flex-direction:column;gap:10px;margin-top:16px}
.ov-legend-row{display:flex;align-items:center;gap:10px;font-size:13px}
.ov-dot{width:10px;height:10px;border-radius:4px;flex-shrink:0}
.ov-legend-name{flex:1;color:var(--ink-900,#14332a)}
.ov-legend-count{font-weight:700;color:var(--ink-900,#14332a)}
.ov-legend-pct{width:42px;text-align:right;color:var(--on-surface-variant,#5f7a6e);font-size:12px}
.ov-strip{display:grid;grid-template-columns:repeat(4,1fr);padding:8px 0}
.ov-strip-item{display:flex;align-items:center;gap:14px;padding:12px 24px;border-right:1px solid #eef3f0}
.ov-strip-item:last-child{border-right:none}
.ov-strip-value{font-size:22px;font-weight:700;color:var(--ink-900,#14332a);line-height:1.1}
.ov-strip-label{font-size:12px;color:var(--on-surface-variant,#5f7a6e);margin-top:2px}
@media (max-width:1100px){
  .ov-kpis{grid-template-columns:repeat(2,1fr)}
  .ov-charts{grid-template-columns:1fr}
  .ov-strip{grid-template-columns:repeat(2,1fr)}
  .ov-strip-item:nth-child(2){border-right:none}
}
@media (max-width:600px){
  .ov-kpis,.ov-strip{grid-template-columns:1fr}
  .ov-strip-item{border-right:none;border-bottom:1px solid #eef3f0}
  .ov-strip-item:last-child{border-bottom:none}
}
`;

function GrowthChart({ data }) {
  if (!data?.length) return <div className="ov-empty">Belum ada data pendaftaran</div>;

  const chartData = [...data].reverse().map((d) => ({
    name: new Date(d.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
    value: d.count
  }));

  return (
    <div className="ov-area">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="ovGrowth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="#e6eee9" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#7a9186' }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#7a9186' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ stroke: '#3b82f6', strokeDasharray: '4 4' }}
            formatter={(v) => [v.toLocaleString('id-ID'), 'User baru']}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={3}
            fill="url(#ovGrowth)"
            dot={{ r: 4, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function DistributionChart({ data }) {
  if (!data?.length) return <div className="ov-empty">Belum ada hasil assessment</div>;

  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <>
      <div className="ov-donut">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="category_label"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={3}
              cornerRadius={6}
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(v, name) => [v.toLocaleString('id-ID'), name]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="ov-donut-center">
          <div className="ov-donut-total">{total.toLocaleString('id-ID')}</div>
          <div className="ov-donut-label">Total</div>
        </div>
      </div>

      <div className="ov-legend">
        {data.map((item, i) => (
          <div key={item.category_label} className="ov-legend-row">
            <span className="ov-dot" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="ov-legend-name">{item.category_label}</span>
            <span className="ov-legend-count">{item.count}</span>
            <span className="ov-legend-pct">{safeDiv(item.count, total) * 100 > 0 ? (safeDiv(item.count, total) * 100).toFixed(0) : 0}%</span>
          </div>
        ))}
      </div>
    </>
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
      .then((res) => res.json())
      .then((data) => {
        setStats(data.stats);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  if (loading) return (
    <div className="tab-panel" style={{ minHeight: '400px' }}>
      <div className="skeleton-grid">
        {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton-card" />)}
      </div>
    </div>
  );
  if (!stats) return <div className="tab-panel">Gagal memuat data</div>;

  const userTrend = stats.userTrend || [];
  const lastWeekUsers = userTrend.slice(0, 7).reduce((sum, d) => sum + d.count, 0);
  const prevWeekUsers = userTrend.slice(7, 14).reduce((sum, d) => sum + d.count, 0);
  const userTrendPct = prevWeekUsers > 0 ? ((lastWeekUsers - prevWeekUsers) / prevWeekUsers) * 100 : 0;

  const retentionRate = pct(stats.activeUsers, stats.users);
  // Tingkat pencatatan = centang 7 hari terakhir / (jumlah habit x 7).
  // Dulu: total seluruh centang / jumlah habit, selalu menjadi 100% ("9 dari 7").
  const habitLogs7d = stats.habitLogs7d ?? 0;
  const habitRate = pct(habitLogs7d, (stats.habits || 0) * 7);
  const assessmentPerUser = safeDiv(stats.assessments, stats.users);
  const articlePerUser = safeDiv(stats.articles, stats.users);
  const engagementScore = assessmentPerUser * 100;

  const getHealthStatus = () => {
    if (retentionRate > 50 && engagementScore > 70) return { label: 'Sehat', color: '#10b981' };
    if (retentionRate > 30 || engagementScore > 40) return { label: 'Stabil', color: '#f59e0b' };
    return { label: 'Perlu Perhatian', color: '#ef4444' };
  };
  const health = getHealthStatus();

  const TrendIcon = userTrendPct > 0 ? ArrowUpRight : userTrendPct < 0 ? ArrowDownRight : Minus;
  const trendColor = userTrendPct > 0 ? '#10b981' : userTrendPct < 0 ? '#ef4444' : '#7a9186';

  const kpis = [
    { title: 'Pengguna Baru', value: lastWeekUsers, hint: '7 hari terakhir', icon: Users, color: '#3b82f6', trend: true },
    { title: 'Total Assessment', value: stats.assessments, hint: `${assessmentPerUser.toFixed(1)} per pengguna`, icon: ClipboardCheck, color: '#f59e0b' },
    { title: 'Artikel Edukasi', value: stats.articles, hint: 'Artikel tersedia', icon: FileText, color: '#10b981', link: true },
    { title: 'Habit Tercatat', value: habitLogs7d, hint: `7 hari terakhir, dari ${stats.habits} habit`, icon: Target, color: '#8b5cf6', progress: habitRate }
  ];

  const strip = [
    { label: 'Retensi aktif', value: `${retentionRate.toFixed(1)}%`, icon: Users, color: '#3b82f6' },
    { label: 'Artikel per user', value: articlePerUser.toFixed(1), icon: FileText, color: '#10b981' },
    { label: 'Assessment per user', value: assessmentPerUser.toFixed(1), icon: ClipboardCheck, color: '#f59e0b' },
    { label: 'Pencatatan habit (7 hari)', value: `${habitRate.toFixed(1)}%`, icon: Target, color: '#8b5cf6' }
  ];

  return (
    <div className="tab-panel admin-overview ov">
      <style>{css}</style>

      {/* Header */}
      <div className="ov-head">
        <div>
          <h1 className="ov-title">Overview</h1>
          <p className="ov-sub">Ringkasan aktivitas platform BinaJiwa</p>
        </div>
        <div className="ov-head-right">
          <span className="ov-pill" style={{ color: health.color }}>
            <i style={{ background: health.color }} />
            {health.label}
          </span>
          <button className="ov-refresh" onClick={fetchStats}>
            <RefreshCw size={14} strokeWidth={2.5} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="ov-kpis">
        {kpis.map((k) => (
          <div key={k.title} className="ov-card ov-kpi">
            <div className="ov-kpi-top">
              <div className="ov-icon" style={{ background: `${k.color}18`, color: k.color }}>
                <k.icon size={20} strokeWidth={2} />
              </div>
              {k.trend && (
                <span className="ov-chip" style={{ background: `${trendColor}18`, color: trendColor }}>
                  <TrendIcon size={14} strokeWidth={2.5} />
                  {Math.abs(userTrendPct).toFixed(0)}%
                </span>
              )}
            </div>
            <div className="ov-value">{Number(k.value).toLocaleString('id-ID')}</div>
            <div className="ov-label">{k.title}</div>
            <div className="ov-hint">{k.hint}</div>
            {k.progress !== undefined && (
              <div className="ov-bar"><span style={{ width: `${k.progress}%`, background: k.color }} /></div>
            )}
            {k.link && <a href="/admin/articles" className="ov-link">Kelola artikel →</a>}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="ov-charts">
        <div className="ov-card">
          <div className="ov-card-head">
            <h3 className="ov-card-title">Pertumbuhan Pengguna</h3>
            <span className="ov-card-sub">{lastWeekUsers} pendaftar baru minggu ini</span>
          </div>
          <GrowthChart data={userTrend.slice(0, 7)} />
        </div>

        <div className="ov-card">
          <div className="ov-card-head">
            <h3 className="ov-card-title">Distribusi Hasil</h3>
            <span className="ov-card-sub">Kategori screening</span>
          </div>
          <DistributionChart data={stats.assessmentStats} />
        </div>
      </div>

      {/* Strip */}
      <div className="ov-card ov-strip">
        {strip.map((s) => (
          <div key={s.label} className="ov-strip-item">
            <div className="ov-icon" style={{ background: `${s.color}18`, color: s.color, width: 38, height: 38 }}>
              <s.icon size={18} strokeWidth={2} />
            </div>
            <div>
              <div className="ov-strip-value">{s.value}</div>
              <div className="ov-strip-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminOverview;