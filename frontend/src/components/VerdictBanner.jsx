import QualityGauge from "./QualityGauge.jsx";

export default function VerdictBanner({ result }) {
  if (!result) return null;
  const { passed, failure_type, retry_count, fallback_used,
          total_latency_ms, final_validation } = result;

  const v = final_validation;
  const overall = v
    ? (v.grounding_score + v.completeness_score + v.quality_score) / 3
    : 0;

  return (
    <div className="panel rise">
      <div className="verdict">
        <QualityGauge value={overall} passed={passed} />

        <div className="verdict-body">
          <span className={`verdict-badge ${passed ? "pass" : "fail"}`}>
            <Icon passed={passed} />
            {passed ? "Passed the quality gate" : "Failed the quality gate"}
          </span>
          <h2 className="verdict-title">
            {passed
              ? "Response validated and cleared for use"
              : `Unresolved after recovery — ${failure_type}`}
          </h2>
          <p className="verdict-sub">
            {passed
              ? `Recovered in ${retry_count} ${retry_count === 1 ? "retry" : "retries"}.`
              : "Best available attempt is shown below with recommended actions."}
          </p>

          <div className="meta-strip">
            <Meta k="Failure type" v={failure_type} mono />
            <Meta k="Retries" v={retry_count} />
            <Meta k="Fallback model" v={fallback_used ? "Used" : "None"}
                  hot={fallback_used} />
            <Meta k="Total latency" v={`${total_latency_ms} ms`} mono />
          </div>
        </div>
      </div>
    </div>
  );
}

function Meta({ k, v, mono, hot }) {
  return (
    <div className={`meta ${hot ? "hot" : ""}`}>
      <span className="k">{k}</span>
      <span className={`v ${mono ? "mono" : ""}`}>{v}</span>
    </div>
  );
}

function Icon({ passed }) {
  return passed ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 8v5M12 16h.01M10.3 3.8 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
