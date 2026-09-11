import { useState } from "react";
import { api } from "./api.js";
import PromptForm from "./components/PromptForm.jsx";
<<<<<<< HEAD
import VerdictBanner from "./components/VerdictBanner.jsx";
=======
import SummaryBar from "./components/SummaryBar.jsx";
>>>>>>> a7d0c06 (Initial commit: AI Response Quality Gate POC (FastAPI backend + React debugger))
import ValidationPanel from "./components/ValidationPanel.jsx";
import TracePanel from "./components/TracePanel.jsx";
import HistoryPanel from "./components/HistoryPanel.jsx";

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  async function handleExecute(payload) {
    setLoading(true);
    setError("");
    try {
      const r = await api.execute(payload);
      setResult(r);
<<<<<<< HEAD
      setRefreshKey((k) => k + 1);
=======
      setRefreshKey((k) => k + 1); // tell history to reload
>>>>>>> a7d0c06 (Initial commit: AI Response Quality Gate POC (FastAPI backend + React debugger))
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function openExecution(id) {
    try {
      setResult(await api.getExecution(id));
<<<<<<< HEAD
      setError("");
=======
>>>>>>> a7d0c06 (Initial commit: AI Response Quality Gate POC (FastAPI backend + React debugger))
    } catch (e) {
      setError(e.message);
    }
  }

  const original = result?.trace?.[0]?.raw_response;

  return (
    <div className="app">
<<<<<<< HEAD
      <header className="topbar">
        <div className="brand-mark">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 3 4 7v5c0 4.4 3.2 7.9 8 9 4.8-1.1 8-4.6 8-9V7l-8-4Z"
              stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="m9 12 2 2 4-4" stroke="#fff" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="brand-text">
          <h1>AI Execution Debugger</h1>
          <p>Response Quality Gate — validate, classify, recover, observe</p>
        </div>
        <span className="topbar-status"><span className="dot" />Gate active</span>
      </header>

      <div className="layout">
        <aside className="rail">
=======
      <header>
        <h1>AI Execution Debugger</h1>
        <p className="muted">
          Response Quality Gate - validate, classify, recover, observe.
        </p>
      </header>

      <div className="layout">
        <aside>
>>>>>>> a7d0c06 (Initial commit: AI Response Quality Gate POC (FastAPI backend + React debugger))
          <PromptForm onExecute={handleExecute} loading={loading} />
          <HistoryPanel refreshKey={refreshKey} onOpen={openExecution} />
        </aside>

<<<<<<< HEAD
        <main className="stage">
          {error && (
            <div className="placeholder" style={{ borderColor: "#f6cccc" }}>
              <div className="big" style={{ color: "#dc2626" }}>Request failed</div>
              <div className="small mono">{error}</div>
              <div className="small" style={{ marginTop: 10 }}>
                Check that the backend is running at http://localhost:8000.
              </div>
            </div>
          )}

          {!result && !error && (
            <div className="placeholder">
              <svg width="46" height="46" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="16" rx="2.5" stroke="#98a2b3" strokeWidth="1.6" />
                <path d="M3 9h18M7 14h6M7 17h9" stroke="#98a2b3" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <div className="big">No execution yet</div>
              <div className="small">
                Enter a prompt and an optional JSON schema, then run it through the
                quality gate to see scores, recovery steps, and the full trace.
              </div>
=======
        <main>
          {error && <div className="card error">{error}</div>}
          {!result && !error && (
            <div className="card muted">
              Enter a prompt and execute to see validation, recovery, and trace.
>>>>>>> a7d0c06 (Initial commit: AI Response Quality Gate POC (FastAPI backend + React debugger))
            </div>
          )}

          {result && (
<<<<<<< HEAD
            <div key={result.id} className="stage">
              <VerdictBanner result={result} />

              <div className="io-grid rise" style={{ animationDelay: "60ms" }}>
                <div className="panel io-panel">
                  <div className="panel-h">
                    <h2>Original response</h2>
                    <span className="tag-chip">attempt #0</span>
                  </div>
                  <pre className="code-block">{original || "(empty)"}</pre>
                </div>
                <div className={`panel io-panel final ${result.passed ? "" : "is-fail"}`}>
                  <div className="panel-h">
                    <h2>Final recovered response</h2>
                    <span className="tag-chip">{result.passed ? "cleared" : "best effort"}</span>
                  </div>
                  <pre className="code-block">{result.final_response || "(empty)"}</pre>
=======
            <>
              <SummaryBar result={result} />

              <div className="two-col">
                <div className="card">
                  <h2>Original model response</h2>
                  <pre className="mono">{original || "(empty)"}</pre>
                </div>
                <div className={`card ${result.passed ? "outline-ok" : "outline-bad"}`}>
                  <h2>Final recovered response</h2>
                  <pre className="mono">{result.final_response || "(empty)"}</pre>
>>>>>>> a7d0c06 (Initial commit: AI Response Quality Gate POC (FastAPI backend + React debugger))
                </div>
              </div>

              <ValidationPanel validation={result.final_validation} />
              <TracePanel trace={result.trace} />

<<<<<<< HEAD
              <div className="panel rise" style={{ animationDelay: "120ms" }}>
                <div className="panel-h"><h2>Recommended actions</h2></div>
                <div className="panel-b">
                  <ul className="rec-list">
                    {result.recommended_actions.map((a, i) => (
                      <li key={i}><span className="bullet" />{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
=======
              <div className="card">
                <h2>Recommended actions</h2>
                <ul>
                  {result.recommended_actions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            </>
>>>>>>> a7d0c06 (Initial commit: AI Response Quality Gate POC (FastAPI backend + React debugger))
          )}
        </main>
      </div>
    </div>
  );
}
