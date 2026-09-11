<<<<<<< HEAD
import { useEffect, useState } from "react";
import { scoreColor } from "./QualityGauge.jsx";

export default function ScoreBar({ label, value, threshold = 0.7 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = requestAnimationFrame(() => setW((value ?? 0) * 100));
    return () => cancelAnimationFrame(t);
  }, [value]);

  const color = scoreColor(value);
  return (
    <div className="score-row">
      <div className="score-top">
        <span className="name">{label}</span>
        <span className="val" style={{ color }}>{((value ?? 0)).toFixed(2)}</span>
      </div>
      <div className="track">
        <div className="fill" style={{ width: `${w}%`, background: color }} />
=======
export default function ScoreBar({ label, value, threshold = 0.7 }) {
  const pct = Math.round((value ?? 0) * 100);
  const ok = (value ?? 0) >= threshold;
  return (
    <div className="score">
      <div className="score-top">
        <span>{label}</span>
        <span className={ok ? "ok" : "bad"}>{pct}%</span>
      </div>
      <div className="bar">
        <div
          className={`bar-fill ${ok ? "fill-ok" : "fill-bad"}`}
          style={{ width: `${pct}%` }}
        />
>>>>>>> a7d0c06 (Initial commit: AI Response Quality Gate POC (FastAPI backend + React debugger))
      </div>
    </div>
  );
}
