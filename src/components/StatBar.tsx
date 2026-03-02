interface StatBarProps {
  label: string;
  value: number;
  max?: number;
  className?: string;
  showValue?: boolean;
}

export function StatBar({ label, value, max = 100, className = '', showValue = true }: StatBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className={`stat-bar-wrap ${className}`}>
      <span className="stat-bar-label">{label}</span>
      <div className="stat-bar-track">
        <div className="stat-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      {showValue && <span className="stat-bar-val">{Math.floor(value)}</span>}
    </div>
  );
}

interface HpBarProps {
  current: number;
  max: number;
  showNumbers?: boolean;
}

export function HpBar({ current, max, showNumbers = true }: HpBarProps) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const level = pct > 50 ? 'high' : pct > 20 ? 'mid' : 'low';

  return (
    <div className="stat-bar-wrap">
      <span className="stat-bar-label">HP</span>
      <div className="stat-bar-track">
        <div className={`stat-bar-fill hp-fill ${level}`} style={{ width: `${pct}%` }} />
      </div>
      {showNumbers && (
        <span className="stat-bar-val">
          {current}/{max}
        </span>
      )}
    </div>
  );
}

interface ExpBarProps {
  current: number;
  toNext: number;
  level: number;
}

export function ExpBar({ current, toNext, level }: ExpBarProps) {
  const pct = Math.max(0, Math.min(100, (current / toNext) * 100));
  return (
    <div className="exp-bar-wrap">
      <span className="exp-label">Lv.{level}</span>
      <div className="exp-bar-track">
        <div className="exp-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="exp-label">{current}/{toNext}</span>
    </div>
  );
}
