import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function HistoryPanel({ refreshKey, onOpen }) {
  const [tab, setTab] = useState("all");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const load = tab === "all" ? api.listExecutions : api.listFailures;
    load().then(setRows).catch(() => setRows([]));
  }, [tab, refreshKey]);

  return (
<<<<<<< HEAD
    <div className="panel">
      <div className="panel-h">
        <h2>History</h2>
        <div className="seg">
          <button className={tab === "all" ? "on" : ""} onClick={() => setTab("all")}>All</button>
          <button className={tab === "failures" ? "on" : ""} onClick={() => setTab("failures")}>Failures</button>
        </div>
      </div>
      <div className="panel-b">
        {rows.length === 0
          ? <div className="hist-empty">Nothing here yet. Run a request to populate.</div>
          : (
            <ul className="hist">
              {rows.map((r) => (
                <li key={r.id} onClick={() => onOpen(r.id)}>
                  <span className="h-prompt">{r.prompt}</span>
                  {"passed" in r && (
                    <span className={`h-state ${r.passed ? "pass" : "fail"}`}>
                      {r.passed ? "pass" : "fail"}
                    </span>
                  )}
                  {"failure_type" in r && <span className="tag-chip">{r.failure_type}</span>}
                </li>
              ))}
            </ul>
          )}
      </div>
=======
    <div className="card">
      <div className="tabs">
        <button className={tab === "all" ? "tab active" : "tab"}
                onClick={() => setTab("all")}>All executions</button>
        <button className={tab === "failures" ? "tab active" : "tab"}
                onClick={() => setTab("failures")}>Failures</button>
      </div>

      {rows.length === 0 && <p className="muted">Nothing yet.</p>}
      <ul className="history">
        {rows.map((r) => (
          <li key={r.id} onClick={() => onOpen(r.id)}>
            <span className="mono ellipsis">{r.prompt}</span>
            {"passed" in r && (
              <span className={r.passed ? "ok" : "bad"}>
                {r.passed ? "pass" : "fail"}
              </span>
            )}
            {"failure_type" in r && <span className="tag">{r.failure_type}</span>}
          </li>
        ))}
      </ul>
>>>>>>> a7d0c06 (Initial commit: AI Response Quality Gate POC (FastAPI backend + React debugger))
    </div>
  );
}
