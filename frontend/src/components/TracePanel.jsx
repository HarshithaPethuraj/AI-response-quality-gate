import { useState } from "react";
<<<<<<< HEAD
import { scoreColor } from "./QualityGauge.jsx";
=======
>>>>>>> a7d0c06 (Initial commit: AI Response Quality Gate POC (FastAPI backend + React debugger))

export default function TracePanel({ trace }) {
  if (!trace || trace.length === 0) return null;
  return (
<<<<<<< HEAD
    <div className="panel rise">
      <div className="panel-h">
        <h2>Execution trace</h2>
        <span className="sub">{trace.length} attempt{trace.length > 1 ? "s" : ""}</span>
      </div>
      <div className="panel-b">
        <div className="trace-list">
          {trace.map((a, i) => <Step key={a.attempt} a={a} index={i} />)}
        </div>
      </div>
=======
    <div className="card">
      <h2>Execution trace ({trace.length} attempt{trace.length > 1 ? "s" : ""})</h2>
      {trace.map((a) => (
        <AttemptRow key={a.attempt} a={a} />
      ))}
>>>>>>> a7d0c06 (Initial commit: AI Response Quality Gate POC (FastAPI backend + React debugger))
    </div>
  );
}

<<<<<<< HEAD
function Step({ a, index }) {
  const [open, setOpen] = useState(false);
  const passed = a.validation?.passed;
  const v = a.validation;

  return (
    <div className="step rise" style={{ animationDelay: `${index * 120}ms` }}>
      <div className={`node ${passed ? "pass" : "fail"}`}><span>{a.attempt}</span></div>
      <div className={`step-card ${passed ? "pass" : ""}`}>
        <button className="step-head" onClick={() => setOpen(!open)}>
          <span className="model">{a.provider}/{a.model}</span>
          <span className="tag-chip">{a.strategy_applied}</span>
          <span className={`verdict-tag ${passed ? "pass" : "fail"}`}>
            {passed ? "passed" : a.failure_type}
          </span>
          {v && (
            <span className="step-mini-scores">
              {[v.grounding_score, v.completeness_score, v.quality_score].map((s, k) => (
                <span key={k} className="pip" style={{ background: scoreColor(s) }} />
              ))}
            </span>
          )}
          <span className="lat">{a.latency_ms} ms</span>
          <span className={`caret ${open ? "open" : ""}`}>▼</span>
        </button>
        {open && (
          <div className="step-body">
            <h4>Prompt sent to model</h4>
            <pre>{a.prompt_used}</pre>
            <h4>Raw model response</h4>
            <pre>{a.raw_response || "(empty)"}</pre>
          </div>
        )}
      </div>
=======
function AttemptRow({ a }) {
  const [open, setOpen] = useState(false);
  const passed = a.validation?.passed;
  return (
    <div className={`attempt ${passed ? "attempt-ok" : "attempt-bad"}`}>
      <button className="attempt-head" onClick={() => setOpen(!open)}>
        <span className="attempt-idx">#{a.attempt}</span>
        <span className="mono">{a.provider}/{a.model}</span>
        <span className="tag">{a.strategy_applied}</span>
        <span className={passed ? "ok" : "bad"}>
          {passed ? "passed" : a.failure_type}
        </span>
        <span className="attempt-lat">{a.latency_ms} ms</span>
        <span className="chev">{open ? "\u25B2" : "\u25BC"}</span>
      </button>

      {open && (
        <div className="attempt-body">
          <h4>Prompt used</h4>
          <pre className="mono">{a.prompt_used}</pre>
          <h4>Raw response</h4>
          <pre className="mono">{a.raw_response || "(empty)"}</pre>
        </div>
      )}
>>>>>>> a7d0c06 (Initial commit: AI Response Quality Gate POC (FastAPI backend + React debugger))
    </div>
  );
}
