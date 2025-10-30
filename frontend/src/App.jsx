import { useEffect, useMemo, useState } from "react";
import { runQuery, runQueryAll } from "./lib/api";

// --- CSV helpers (kept from your version) ---
function escapeCSVValue(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  const needsQuotes = /[",\n\r]|^\s|\s$/.test(str);
  const escaped = str.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function toCSV(rows, columns) {
  const cols =
    columns && columns.length ? columns : rows.length ? Object.keys(rows[0]) : [];
  const header = cols.join(",");
  const lines = rows.map((r) => cols.map((c) => escapeCSVValue(r[c])).join(","));
  return [header, ...lines].join("\r\n"); // CRLF for Excel friendliness
}

function downloadCSV(filename, rows, columns) {
  const csv = toCSV(rows, columns);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }); // UTF-8 BOM
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Backend response shape: { sql, data?: [], explanation?: string | object }
  const [result, setResult] = useState(null);

  // Derive columns from the first row of data (if any)
  const columns = useMemo(() => {
    if (result?.data && Array.isArray(result.data) && result.data.length > 0) {
      return Object.keys(result.data[0]);
    }
    return [];
  }, [result]);

  function onSubmit(e) {
    e.preventDefault();
    setSubmittedQuery(query.trim());
  }

  function onReset() {
    setQuery("");
    setSubmittedQuery("");
    setResult(null);
    setError(null);
  }

  function timestamp() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(
      d.getHours()
    )}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  }

  function exportTableCSV() {
    if (!result?.data || result.data.length === 0) return;
    const fname = `results_${submittedQuery || "empty"}_${timestamp()}.csv`;
    downloadCSV(fname, result.data, columns);
  }

  async function exportAllCSV() {
    if (!submittedQuery) return;

    try {
      // Fetch full dataset from backend
      const full = await runQueryAll(submittedQuery);

      // Convert backend rows + columns → array of objects for CSV
      const cols = full.columns || [];
      const rows = full.rows.map((r) =>
        Object.fromEntries(cols.map((c, i) => [c, r[i]]))
      );

      const fname = `results_all_${timestamp()}.csv`;
      downloadCSV(fname, rows, cols);

    } catch (err) {
      console.error("Export all CSV failed:", err);
      alert("Failed to export all data. Check backend logs.");
    }
  }



  // Fetch from backend whenever submittedQuery changes (and is non-empty)
  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      if (!submittedQuery) {
        setResult(null);
        setError(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await runQuery(submittedQuery); // POST to backend
        if (!cancelled) setResult(data);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to fetch");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [submittedQuery]);

  return (
    <div className="app">
      <header className="container">
        <h1>SynTra </h1>
        <p className="subtitle">
          Type a query. We’ll call the FastAPI backend and show mocked SQL + results.
        </p>
        <form onSubmit={onSubmit} className="searchRow">
          <label htmlFor="q" className="visuallyHidden">Query</label>
          <input
            id="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Try: "average order value by state"'
            aria-label="Search query"
          />
          <button type="submit" disabled={!query.trim() || loading}>
            {loading ? "Running..." : "Run"}
          </button>
          <button type="button" className="secondary" onClick={onReset}>
            Reset
          </button>
        </form>

        {submittedQuery && (
          <div style={{ marginTop: 8, fontSize: 12 }}>
            <b>Query:</b> <code>{submittedQuery}</code>
          </div>
        )}
      </header>

      <main className="container grid">

        {/* Results table */}
        
        <section aria-labelledby="results-heading" className="card">
        {result?.is_mock && (
          <div className="mockBadge">
            <span className="badge success">MOCK DATA</span> Backend is returning mocked data for CP2
          </div>
        )}
          <div className="cardHeader">
            <h2 id="results-heading">Results</h2>
            <span className="badge">{result?.row_count || 0}</span>

            <div className="actions">
              <button type="button" className="primary" onClick={exportTableCSV}>
                Export table CSV
              </button>
              <button type="button" onClick={exportAllCSV}>
                Export all CSV
              </button>
            </div>
          </div>

          {result?.rows && result.rows.length > 0 ? (
            <div className="tableWrapper">
              <table>
                <thead>
                  <tr>
                    {result.columns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, idx) => (
                    <tr key={idx}>
                      {row.map((cell, i) => (
                        <td key={i}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted">No results yet. Submit a query to see data.</p>
          )}
        </section>


        {/* Guidance panel */}
        <aside aria-labelledby="explain-heading" className="card">
          <h2 id="explain-heading">What’s happening</h2>
          <ul>
            <li>Your query is POSTed to <code>{import.meta.env.VITE_API_BASE_URL}/query</code>.</li>
            <li>Backend returns: <code>{`{ sql, data[], explanation }`}</code>.</li>
            <li>We render the SQL, explanation, and a dynamic table.</li>
            <li>“Export table CSV” downloads the current results with UTF-8 BOM (Excel-friendly).</li>
          </ul>

          <details className="details" style={{ marginTop: 8 }}>
            <summary>Troubleshooting</summary>
            <ul>
              <li>
                <b>CORS error?</b> Ensure FastAPI has <code>CORSMiddleware</code> allowing
                <code>http://localhost:5173</code>.
              </li>
              <li>
                <b>404?</b> Make sure your backend route is <code>@router.post("/query")</code> (or
                change the frontend URL to match).
              </li>
              <li>
                <b>Undefined API base?</b> Frontend must have
                <code>.env.development</code> with <code>VITE_API_BASE_URL</code>, then restart
                <code>npm run dev</code>.
              </li>
            </ul>
          </details>
        </aside>
      </main>

      <footer className="container footer">
        <small>Demo app (React + Vite, JavaScript). CP2 uses mocked backend data.</small>
      </footer>
    </div>
  );
}
