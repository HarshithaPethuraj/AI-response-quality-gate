import { useState } from "react";

const EXAMPLE = {
  prompt: "State when the company was founded, based only on the source.",
  source:
    "Acme Corp is a plumbing SaaS company based in Austin. It offers live call answering.",
  schema: JSON.stringify(
    {
      type: "object",
      properties: {
        answer: { type: "string" },
        confidence: { type: "number" },
      },
      required: ["answer", "confidence"],
    },
<<<<<<< HEAD
    null, 2
=======
    null,
    2
>>>>>>> a7d0c06 (Initial commit: AI Response Quality Gate POC (FastAPI backend + React debugger))
  ),
};

export default function PromptForm({ onExecute, loading }) {
  const [prompt, setPrompt] = useState("");
  const [source, setSource] = useState("");
  const [schemaText, setSchemaText] = useState("");
  const [schemaError, setSchemaError] = useState("");

  function loadExample() {
    setPrompt(EXAMPLE.prompt);
    setSource(EXAMPLE.source);
    setSchemaText(EXAMPLE.schema);
    setSchemaError("");
  }

  function submit() {
    let expected_schema = null;
    if (schemaText.trim()) {
      try {
        expected_schema = JSON.parse(schemaText);
        setSchemaError("");
      } catch (e) {
<<<<<<< HEAD
        setSchemaError("Schema is not valid JSON: " + e.message);
=======
        setSchemaError("Invalid JSON schema: " + e.message);
>>>>>>> a7d0c06 (Initial commit: AI Response Quality Gate POC (FastAPI backend + React debugger))
        return;
      }
    }
    onExecute({ prompt, source_content: source, expected_schema });
  }

  return (
<<<<<<< HEAD
    <div className="panel">
      <div className="panel-h">
        <h2>New request</h2>
        <button className="ghost-btn" type="button" onClick={loadExample}>
          Load example
        </button>
      </div>
      <div className="panel-b">
        <div className="field">
          <label>Prompt</label>
          <textarea rows={3} value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What should the model do?" />
        </div>

        <div className="field">
          <label>Source content <span className="hint">ground truth</span></label>
          <textarea rows={4} value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Text the answer must stay faithful to…" />
        </div>

        <div className="field">
          <label>Expected JSON schema <span className="hint">optional</span></label>
          <textarea rows={8} className="code" value={schemaText}
            onChange={(e) => setSchemaText(e.target.value)}
            placeholder='{ "type": "object", "properties": { … } }' />
          {schemaError && <div className="inline-error">{schemaError}</div>}
        </div>

        <button className="run-btn" onClick={submit} disabled={loading || !prompt.trim()}>
          {loading ? (<><span className="spinner" />Running quality gate…</>) : "Execute request"}
        </button>
      </div>
=======
    <div className="card">
      <div className="card-head">
        <h2>Request</h2>
        <button className="link-btn" onClick={loadExample} type="button">
          Load example
        </button>
      </div>

      <label>Prompt</label>
      <textarea
        rows={3}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="What should the model do?"
      />

      <label>Source content (ground truth to validate against)</label>
      <textarea
        rows={4}
        value={source}
        onChange={(e) => setSource(e.target.value)}
        placeholder="Paste the source text the answer must stay faithful to..."
      />

      <label>Expected JSON schema (optional)</label>
      <textarea
        rows={8}
        className="mono"
        value={schemaText}
        onChange={(e) => setSchemaText(e.target.value)}
        placeholder='{ "type": "object", "properties": { ... } }'
      />
      {schemaError && <div className="error">{schemaError}</div>}

      <button className="primary" onClick={submit} disabled={loading || !prompt.trim()}>
        {loading ? "Executing..." : "Execute request"}
      </button>
>>>>>>> a7d0c06 (Initial commit: AI Response Quality Gate POC (FastAPI backend + React debugger))
    </div>
  );
}
