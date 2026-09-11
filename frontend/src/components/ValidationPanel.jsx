import ScoreBar from "./ScoreBar.jsx";

export default function ValidationPanel({ validation }) {
  if (!validation) return null;
<<<<<<< HEAD
  const { schema_valid, grounding_score, completeness_score, quality_score,
          contradictions, hallucinations, reasoning } = validation;

  return (
    <div className="panel rise">
      <div className="panel-h">
        <h2>Validation scores</h2>
        <span className="sub">threshold 0.70</span>
      </div>
      <div className="panel-b">
        <ScoreBar label="Grounding" value={grounding_score} />
        <ScoreBar label="Completeness" value={completeness_score} />
        <ScoreBar label="Quality" value={quality_score} />

        <div className="chips-row" style={{ marginTop: 16 }}>
          <span className={`chip ${schema_valid ? "ok" : "bad"}`}>
            {schema_valid ? "Schema valid" : "Schema invalid"}
          </span>
          <span className={`chip ${hallucinations.length ? "bad" : "ok"}`}>
            {hallucinations.length
              ? `${hallucinations.length} hallucination${hallucinations.length > 1 ? "s" : ""}`
              : "No hallucinations"}
          </span>
          <span className={`chip ${contradictions.length ? "bad" : "ok"}`}>
            {contradictions.length
              ? `${contradictions.length} contradiction${contradictions.length > 1 ? "s" : ""}`
              : "No contradictions"}
          </span>
        </div>

        {reasoning && <p className="reasoning">{reasoning}</p>}

        <IssueList title="Hallucinations detected" items={hallucinations} />
        <IssueList title="Contradictions detected" items={contradictions} />
      </div>
=======
  const {
    schema_valid,
    grounding_score,
    completeness_score,
    quality_score,
    contradictions,
    hallucinations,
    reasoning,
  } = validation;

  return (
    <div className="card">
      <h2>Validation results</h2>

      <ScoreBar label="Grounding" value={grounding_score} />
      <ScoreBar label="Completeness" value={completeness_score} />
      <ScoreBar label="Quality" value={quality_score} />

      <div className="chips">
        <span className={`chip ${schema_valid ? "chip-ok" : "chip-bad"}`}>
          Schema {schema_valid ? "valid" : "invalid"}
        </span>
      </div>

      {reasoning && <p className="reasoning">{reasoning}</p>}

      <IssueList title="Hallucinations" items={hallucinations} />
      <IssueList title="Contradictions" items={contradictions} />
>>>>>>> a7d0c06 (Initial commit: AI Response Quality Gate POC (FastAPI backend + React debugger))
    </div>
  );
}

function IssueList({ title, items }) {
  if (!items || items.length === 0) return null;
  return (
<<<<<<< HEAD
    <div className="issues h-bad">
      <h3>{title}</h3>
      <ul>{items.map((it, i) => <li key={i}>{it}</li>)}</ul>
=======
    <div className="issues">
      <h3 className="bad">{title}</h3>
      <ul>
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
>>>>>>> a7d0c06 (Initial commit: AI Response Quality Gate POC (FastAPI backend + React debugger))
    </div>
  );
}
