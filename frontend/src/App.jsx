import { useMemo, useState } from "react";

const MOCK_DATA = [
  { id: 1, name: "Acme Analytics Suite", category: "Analytics", score: 92 },
  { id: 2, name: "Beacon Billing", category: "FinTech", score: 84 },
  { id: 3, name: "Cinder CRM", category: "Sales", score: 88 },
  { id: 4, name: "Delta Docs", category: "Docs", score: 77 },
  { id: 5, name: "Echo ETL", category: "Data", score: 81 },
  { id: 6, name: "Flux Forecast", category: "Analytics", score: 90 },
  { id: 7, name: "Glint Gateway", category: "FinTech", score: 73 },
  { id: 8, name: "Helio Helpdesk", category: "Support", score: 85 },
  { id: 9, name: "Iota Insights", category: "Analytics", score: 89 },
  { id: 10, name: "Jolt Jira Sync", category: "DevTools", score: 80 },
];

function mockSearch(query) {
  const q = query.trim().toLowerCase();
  if (!q) {
    return {
      items: [],
      explanation: "Type a query and press Search. Results are mocked for demo.",
      tips: ["Filtering matches on name or category (case-insensitive)."],
    };
  }

  const items = MOCK_DATA
    .filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
    )
    .sort((a, b) => b.score - a.score);

  const explanation = `Showing ${items.length} result(s) for "${query}". This mocked search filters by name/category and sorts by mocked "score" (desc).`;
  const tips = [
    `Filter: name/category contains "${query}" (case-insensitive).`,
    "Sort: score descending.",
    "To go real, replace mockSearch() with an API call.",
  ];

  return { items, explanation, tips };
}
// --- CSV helpers ---
function escapeCSVValue(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  const needsQuotes = /[",\n\r]|^\s|\s$/.test(str);
  const escaped = str.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function toCSV(rows, columns) {
  const cols = columns && columns.length
    ? columns
    : rows.length ? Object.keys(rows[0]) : [];

  const header = cols.join(",");
  const lines = rows.map((r) => cols.map((c) => escapeCSVValue(r[c])).join(","));
  return [header, ...lines].join("\r\n"); // CRLF for Excel friendliness
}

function downloadCSV(filename, rows, columns) {
  const csv = toCSV(rows, columns);
  // Add UTF-8 BOM so Excel reads non-ASCII correctly
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
// --- end CSV helpers ---

export default function App() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const { items, explanation, tips } = useMemo(
    () => mockSearch(submittedQuery),
    [submittedQuery]
  );

  function onSubmit(e) {
    e.preventDefault();
    setSubmittedQuery(query);
  }

  function onReset() {
    setQuery("");
    setSubmittedQuery("");
  }
  // columns to export (align with your table)
  const columns = ["id", "name", "category", "score"];

  function timestamp() {
    // e.g., 20250925-021530
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  }

  function exportFilteredCSV() {
    const fname = `results_${submittedQuery || "empty"}_${timestamp()}.csv`;
    downloadCSV(fname, items, columns);
  }

  function exportAllCSV() {
    const fname = `results_all_${timestamp()}.csv`;
    downloadCSV(fname, MOCK_DATA, columns);
  }

  return (
    <div className="app">
      <header className="container">
        <h1>Query Demo (JS)</h1>
        <p className="subtitle">
          Type a query. We’ll show mocked results & a friendly explanation.
        </p>
        <form onSubmit={onSubmit} className="searchRow">
          <label htmlFor="q" className="visuallyHidden">Query</label>
          <input
            id="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Try "analytics" or "FinTech"...'
            aria-label="Search query"
          />
          <button type="submit">Search</button>
          <button type="button" className="secondary" onClick={onReset}>
            Reset
          </button>
        </form>
      </header>

      <main className="container grid">
        {/* Results table */}
        <section aria-labelledby="results-heading" className="card">
          <div className="cardHeader">
            <h2 id="results-heading">Results</h2>
            <span className="badge">{items.length}</span>

            <div className="actions">
              <button type="button" className="primary" onClick={exportFilteredCSV}>
                Export table CSV
              </button>
              <button type="button" onClick={exportAllCSV}>
                Export all CSV
              </button>
            </div>
          </div>

          {items.length === 0 ? (
            <p className="muted">No results. Try searching for “analytics”.</p>
          ) : (
            <div className="tableWrapper">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: "56px" }}>ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r) => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{r.name}</td>
                      <td>{r.category}</td>
                      <td>{r.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Explanation panel */}
        <aside aria-labelledby="explain-heading" className="card">
          <h2 id="explain-heading">Explanation</h2>
          <p>{explanation}</p>
          <ul>
            {tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>

          <details className="details">
            <summary>How to wire a real API later</summary>
            <ol>
              <li>Replace <code>mockSearch()</code> with an <code>async</code> function.</li>
              <li>Call your endpoint with <code>fetch</code> in a <code>useEffect</code> on <code>submittedQuery</code>.</li>
              <li>Map API data to <code>{`{ id, name, category, score }`}</code> and render.</li>
            </ol>
          </details>
        </aside>
      </main>

      <footer className="container footer">
        <small>Demo app (React + Vite, JavaScript). All data and scores are mocked.</small>
      </footer>
    </div>
  );
}
