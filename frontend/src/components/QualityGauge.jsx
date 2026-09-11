import { useEffect, useState } from "react";

// Meaningful colour: the ring/bar colour encodes the score itself.
export function scoreColor(v) {
  if (v == null) return "#98a2b3";
  if (v >= 0.7) return "#059669";   // pass green
  if (v >= 0.5) return "#d97706";   // watch amber
  return "#dc2626";                 // fail red
}

export default function QualityGauge({ value = 0, passed }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = requestAnimationFrame(() => setShown(value)); // trigger CSS sweep
    return () => cancelAnimationFrame(t);
  }, [value]);

  const size = 132, stroke = 12, r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - shown);
  const color = scoreColor(value);

  return (
    <div className="gauge">
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#eef1f5" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.22,.61,.36,1)" }} />
      </svg>
      <div className="gauge-center">
        <div className="num" style={{ color }}>{Math.round(value * 100)}</div>
        <div className="lbl">{passed ? "Quality" : "Quality"}</div>
      </div>
    </div>
  );
}
