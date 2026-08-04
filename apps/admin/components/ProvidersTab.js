// components/admin/ProvidersTab.js
import { useState, useEffect, useRef } from "react";
import { supabase } from "shared/lib/supabase";

const GOLD = {
  primary: "#C9A84C",
  light: "#E8C97A",
  dark: "#9B7520",
  glow: "rgba(201,168,76,0.15)",
  glowHard: "rgba(201,168,76,0.35)",
  surface: "#111116",
  surface2: "#16161E",
  borderSoft: "rgba(255,255,255,0.06)",
  border: "rgba(201,168,76,0.12)",
  text: "#F2F2F7",
  muted: "#636366",
  muted2: "#3A3A3E",
  green: "#30D158",
  red: "#FF453A",
  orange: "#FF9F0A",
};

const PROVIDERS = [
  {
    key: "tmdb",
    label: "TMDB",
    icon: "🎬",
    desc: "Movies + TV",
    group: "content",
    needsKey: false,
  },
  {
    key: "github",
    label: "GitHub",
    icon: "⚡",
    desc: "Trending repos",
    group: "content",
    needsKey: false,
  },
  {
    key: "hackernews",
    label: "Hacker News",
    icon: "🔶",
    desc: "Top stories",
    group: "content",
    needsKey: false,
  },
  {
    key: "producthunt",
    label: "Product Hunt",
    icon: "🚀",
    desc: "Trending tools",
    group: "content",
    needsKey: false,
  },
  {
    key: "reddit",
    label: "Reddit",
    icon: "🟠",
    desc: "Top posts",
    group: "content",
    needsKey: false,
  },
  {
    key: "books",
    label: "Books",
    icon: "📚",
    desc: "Curated books",
    group: "content",
    needsKey: false,
  },
  {
    key: "steam",
    label: "Steam",
    icon: "🖥️",
    desc: "PC games",
    group: "content",
    needsKey: false,
  },
  {
    key: "arxiv",
    label: "arXiv",
    icon: "🔬",
    desc: "Research papers",
    group: "content",
    needsKey: false,
  },
  {
    key: "spotify",
    label: "Spotify",
    icon: "🎵",
    desc: "Music releases",
    group: "content",
    needsKey: true,
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: "▶️",
    desc: "Videos",
    group: "content",
    needsKey: true,
  },
  {
    key: "omdb",
    label: "OMDB",
    icon: "⭐",
    desc: "Movie ratings",
    group: "enricher",
    needsKey: true,
  },
  {
    key: "wikipedia",
    label: "Wikipedia",
    icon: "📝",
    desc: "Summaries",
    group: "enricher",
    needsKey: false,
  },
];

export default function ProvidersTab({ onRefresh }) {
  const [running, setRunning] = useState({});
  const [results, setResults] = useState({});
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const logsRef = useRef(null);

  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs]);

  async function trigger(key) {
    if (running[key]) return;
    setRunning((p) => ({ ...p, [key]: true }));
    setResults((p) => ({ ...p, [key]: null }));
    addLog(`Starting ${key}...`, "info");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ provider: key }),
      });
      const data = await res.json();
      setResults((p) => ({ ...p, [key]: { ...data, httpStatus: res.status } }));

      const r = data.results?.[key];
      if (res.ok && data.success) {
        const count = r?.synced ?? r?.enriched ?? 0;
        addLog(`✓ ${key} — ${count} items synced`, "success");
        onRefresh();
      } else {
        addLog(
          `✗ ${key} — ${r?.error || data.error || `HTTP ${res.status}`}`,
          "error",
        );
      }
    } catch (e) {
      addLog(`✗ ${key} — ${e.message}`, "error");
    }
    setRunning((p) => ({ ...p, [key]: false }));
  }

  async function runAll() {
    addLog("Starting full pipeline...", "info");
    for (const p of PROVIDERS) {
      await trigger(p.key);
      await new Promise((r) => setTimeout(r, 100));
    }
    addLog("Pipeline complete", "success");
  }

  function addLog(msg, type = "info") {
    const time = new Date().toLocaleTimeString();
    setLogs((l) => [...l.slice(-99), { msg, type, time, id: Date.now() }]);
  }

  const filteredProviders = PROVIDERS.filter((p) => {
    const matchesFilter =
      filter === "content"
        ? p.group === "content"
        : filter === "enricher"
          ? p.group === "enricher"
          : filter === "free"
            ? !p.needsKey
            : filter === "needsKey"
              ? p.needsKey
              : true;

    const matchesSearch =
      searchQuery === "" ||
      p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
          ⚙️ Content Pipeline
        </h1>
        <p style={{ fontSize: 14, color: GOLD.muted }}>
          Manage data providers and sync schedule
        </p>
      </div>

      {/* Search & Filters */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 24,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Search providers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            minWidth: 200,
            padding: "10px 16px",
            borderRadius: 10,
            border: `1px solid ${GOLD.borderSoft}`,
            background: GOLD.surface,
            color: GOLD.text,
            fontSize: 13,
            fontFamily: "'Syne', sans-serif",
            outline: "none",
          }}
        />

        <div style={{ display: "flex", gap: 8 }}>
          {['all', 'content', 'enricher', 'free', 'needsKey'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="premium-btn"
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border:
                  filter === f
                    ? `1px solid ${GOLD.primary}`
                    : `1px solid ${GOLD.borderSoft}`,
                background: filter === f ? GOLD.glow : "transparent",
                color: filter === f ? GOLD.primary : GOLD.muted,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s",
                textTransform: "capitalize",
              }}
            >
              {f === "needsKey" ? "API Key" : f}
            </button>
          ))}
        </div>

        <button
          onClick={runAll}
          className="premium-btn"
          style={{
            padding: "10px 24px",
            fontSize: 12,
          }}
        >
          ▶ Run All
        </button>
      </div>

      {/* Providers Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 14,
          marginBottom: 32,
        }}
      >
        {filteredProviders.map((p) => {
          const res = results[p.key];
          const busy = running[p.key];
          const success = res?.success && !res?.error;
          const error = res && res?.error;

          return (
            <div
              key={p.key}
              className="premium-card"
              style={{
                background: GOLD.surface,
                border: busy
                  ? `2px solid ${GOLD.primary}`
                  : success
                    ? `2px solid ${GOLD.green}`
                    : error
                      ? `2px solid ${GOLD.red}`
                      : `1px solid ${GOLD.borderSoft}`,
                borderRadius: 14,
                padding: 20,
                transition: "all 0.3s",
                animation: busy ? `0 0 12px ${GOLD.glow} infinite` : "none",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div style={{ fontSize: 28 }}>{p.icon}</div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 800 }}>
                      {p.label}
                    </span>
                    {p.needsKey && (
                      <span
                        style={{
                          fontSize: 9,
                          background: "rgba(255,159,10,0.2)",
                          color: GOLD.orange,
                          padding: "3px 8px",
                          borderRadius: 4,
                          fontWeight: 700,
                        }}
                      >
                        API KEY
                      </span>
                    )}
                    {busy && (
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: GOLD.primary,
                          animation: "pulse 0.8s infinite",
                          marginLeft: "auto",
                        }}
                      />
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: GOLD.muted }}>{p.desc}</p>
                </div>
              </div>

              {/* Result */}
              {res && (
                <div
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    background: success
                      ? "rgba(48,209,88,0.1)"
                      : "rgba(255,69,58,0.1)",
                    border: `1px solid ${success ? "rgba(48,209,88,0.3)" : "rgba(255,69,58,0.3)"}`,
                    marginBottom: 12,
                    fontSize: 11,
                    color: success ? GOLD.green : GOLD.red,
                    fontWeight: 700,
                  }}
                >
                  {success ? "✓ Complete" : `✗ ${res.error}`}
                </div>
              )}

              {/* Button */}
              <button
                onClick={() => trigger(p.key)}
                disabled={busy}
                className="premium-btn"
                style={{ width: "100%", fontSize: 12, padding: "10px 12px", opacity: busy ? 0.5 : 1 }}
              >
                {busy ? "⟳ Running..." : "▶ Run"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Logs */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 800 }}>
            Execution Logs ({logs.length})
          </h3>
          <button
            onClick={() => setLogs([])}
            className="btn-ghost"
            style={{ fontSize: 11, padding: "6px 12px" }}
          >
            Clear
          </button>
        </div>
        <div
          ref={logsRef}
          style={{
            background: GOLD.surface,
            border: `1px solid ${GOLD.borderSoft}`,
            borderRadius: 10,
            padding: 16,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            lineHeight: 1.8,
            maxHeight: 300,
            overflowY: "auto",
            minHeight: 100,
          }}
        >
          {logs.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: GOLD.muted2,
                paddingTop: 20,
              }}
            >
              No logs yet. Run a provider to see output.
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: "flex",
                  gap: 12,
                  paddingBottom: 6,
                  borderBottom: `1px solid ${GOLD.muted2}`,
                  marginBottom: 6,
                  animation: "fadeIn 0.3s ease",
                }}
              >
                <span
                  style={{ color: GOLD.muted2, minWidth: 70, flexShrink: 0 }}
                >
                  {log.time}
                </span>
                <span
                  style={{
                    color:
                      log.type === "success"
                        ? GOLD.green
                        : log.type === "error"
                          ? GOLD.red
                          : GOLD.muted,
                  }}
                >
                  {log.msg}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
