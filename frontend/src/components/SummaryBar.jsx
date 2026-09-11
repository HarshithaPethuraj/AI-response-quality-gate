export default function SummaryBar({ result }) {
  if (!result) return null;
  const {
    passed,
    failure_type,
    retry_count,
    fallback_used,
    total_latency_ms,
  } = result;

  return (
    <div className="summary">
      <Stat label="Result" value={passed ? "PASSED" : "FAILED"}
            tone={passed ? "ok" : "bad"} />
      <Stat label="Failure type" value={failure_type} />
      <Stat label="Retries" value={retry_count} />
      <Stat label="Fallback model" value={fallback_used ? "Used" : "No"}
            tone={fallback_used ? "warn" : ""} />
      <Stat label="Total latency" value={`${total_latency_ms} ms`} />
    </div>
  );
}

function Stat({ label, value, tone = "" }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${tone}`}>{value}</div>
    </div>
  );
}
