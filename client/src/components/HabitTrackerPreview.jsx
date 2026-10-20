import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import './HabitTrackerPreview.css';

const waterData = [
  { day: 'Sen', value: 5, fill: '#dcfce7' },
  { day: 'Sel', value: 3, fill: '#fcd34d' },
  { day: 'Rab', value: 8, fill: '#064e3b' },
  { day: 'Kam', value: 4, fill: '#a7f3d0' },
  { day: 'Jum', value: 6, fill: '#6ee7b7' },
  { day: 'Sab', value: 7, fill: '#34d399' },
  { day: 'Min', value: 8, fill: '#064e3b' },
];

function HabitTrackerPreview() {
  return (
    <section className="habit-preview" id="habit-tracker">
      <div className="habit-inner habit-inner--reverse">
        <div className="habit-visual">
          <div className="habit-panel">
            <div className="chart-card">
              <div className="chart-streak-chip">
                <span>🔥</span> 7 hari streak
              </div>
              <div className="chart-card__header">
                <span className="chart-card__title">Target Air Minum</span>
                <span className="chart-card__meta">Pekan Ini · Target: 8 Gelas/hari</span>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={waterData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'var(--on-surface-variant)'}} />
                  <Tooltip cursor={{ fill: 'rgba(34,197,94,0.04)' }} formatter={(v) => [`${v} gelas`, '']} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48} label={{ position: 'top', fill: 'var(--ink-900)', fontSize: 12, fontWeight: 600 }}>
                    {waterData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="habit-cards">
              <div className="habit-mini-card">
                <div className="hm-name">Streak</div>
                <div className="hm-value">7 hari</div>
              </div>
              <div className="habit-mini-card">
                <div className="hm-name">Completion Rate</div>
                <div className="hm-value">72%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="habit-text">
          <span className="preview-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18h6M9 18V9h6v9m-6 0h.01M15 12h.01M9 15h6" /><circle cx="12" cy="12" r="9" strokeWidth="1" /></svg> HABIT TRACKER
          </span>
          <h2 className="preview-title">
            Progres kecil,<br />
            terlihat jelas.
          </h2>
          <p className="habit-desc">
            Lupakan spreadsheet yang rumit. Cukup centang tiap hari di aplikasi BinaJiwa, dan biarkan kami yang hitung streak dan pencapaian kebiasaan Anda.
          </p>
        </div>
      </div>
    </section>
  );
}

export default HabitTrackerPreview;
