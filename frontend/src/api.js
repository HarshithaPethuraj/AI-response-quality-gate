const BASE = import.meta.env.VITE_API_BASE || ""; // "" -> use Vite proxy

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`${res.status}: ${detail}`);
  }
  return res.json();
}

export const api = {
  execute: (payload) =>
    request("/api/execute", { method: "POST", body: JSON.stringify(payload) }),
  getExecution: (id) => request(`/api/execution/${id}`),
  listExecutions: () => request("/api/executions"),
  listFailures: () => request("/api/failures"),
};
