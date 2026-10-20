import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import './HabitTracker.css';

const waterData = [
  { day: 'Sen', value: 5, level: 'target' },
  { day: 'Sel', value: 6, level: 'target' },
  { day: 'Rab', value: 4, level: 'below' },
  { day: 'Kam', value: 7, level: 'target' },
  { day: 'Jum', value: 6, level: 'target' },
  { day: 'Sab', value: 8, level: 'achieved' },
  { day: 'Min', value: 8, level: 'achieved' },
];

function HabitTracker() {
  return (
    <section className="habit-tracker" id="habit-tracker">
      <div className="container">
        <div className="habit-inner">
          <div className="habit-text">
            <span className="eyebrow">HABIT TRACKER</span>
            <h2>Progres kecil, terlihat jelas.</h2>
            <p>
              Nggak perlu spreadsheet ribet. Cukup centang tiap hari, BinaJiwa
              yang hitungin streak dan progresnya.
            </p>
          </div>

          <div className="chart-card">
            <div className="chart-streak-chip">7 hari streak</div>
            
            <div className="chart-card__header">
              <span className="chart-card__title">Target Air Minum</span>
              <span className="chart-card__meta">8 Gelas/hari</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={waterData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={48}>
                  {waterData.map((entry, i) => (
                    <Cell key={i} fill={BAR_COLORS[entry.level]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

const BAR_COLORS = {
  target: '#004726',
  achieved: '#E9B872',
  below: '#707971',
};

export default HabitTracker;
