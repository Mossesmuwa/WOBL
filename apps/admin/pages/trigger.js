// apps/admin/pages/trigger.js
// Nova Admin Panel — Gold theme, full features
// ======================================================
// PROTECTED: Admin-only page with role verification
// ======================================================

import { useEffect } from "react";
import { useRouter } from "next/router";

// The old trigger page has been consolidated into the main admin
// dashboard. Keep a lightweight redirect so external links still work.

export default function TriggerRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return null;
}

const PROVIDERS = [
  // No key needed
  {
    key: "tmdb",
    label: "TMDB",
    icon: "FILM",
    desc: "Movies + TV · 500+ items · 12 endpoints",
    needsKey: false,
    group: "content",
  },
  {
    key: "producthunt",
    label: "Product Hunt",
    icon: "ROCKET",
    desc: "Trending tools · 50 posts per run",
    needsKey: false,
    group: "content",
  },
  {
    key: "github",
    label: "GitHub",
    icon: "CODE",
    desc: "Trending repos · 30 items per run",
    needsKey: false,
    group: "content",
  },
  {
    key: "hackernews",
    label: "Hacker News",
    icon: "NEWS",
    desc: "Top stories · 30 items per run",
    needsKey: false,
    group: "content",
  },
  {
    key: "books",
    label: "Google Books",
    icon: "BOOK",
    desc: "Curated books · 8 rotating subjects",
    needsKey: false,
    group: "content",
  },
  {
    key: "openlibrary",
    label: "OpenLibrary",
    icon: "LIBRARY",
    desc: "Community books · 10 subjects",
    needsKey: false,
    group: "content",
  },
  {
    key: "steam",
    label: "Steam",
    icon: "GAMES",
    desc: "Top PC games · 40 items per run",
    needsKey: false,
    group: "content",
  },
  {
    key: "arxiv",
    label: "arXiv",
    icon: "RESEARCH",
    desc: "Research papers · AI + Security + Physics",
    needsKey: false,
    group: "content",
  },
  {
    key: "reddit",
    label: "Reddit",
    icon: "SOCIAL",
    desc: "Top posts · 10 subreddits curated",
    needsKey: false,
    group: "content",
  },
  {
    key: "devto",
    label: "DEV.to",
    icon: "DEV",
    desc: "Dev articles · 6 technology tags",
    needsKey: false,
    group: "content",
  },
  {
    key: "courses",
    label: "Courses",
    icon: "LEARN",
    desc: "Coursera + Udemy · 30 items",
    needsKey: false,
    group: "content",
  },
  // Need keys
  {
    key: "rawg",
    label: "RAWG Games",
    icon: "🎮",
    desc: "Top-rated games · 40 items per run",
    needsKey: true,
    group: "content",
    keyName: "RAWG_API_KEY",
  },
  {
    key: "spotify",
    label: "Spotify",
    icon: "🎵",
    desc: "New releases + trending music",
    needsKey: true,
    group: "content",
    keyName: "SPOTIFY_CLIENT_ID",
  },
  {
    key: "nyt",
    label: "NYT Books",
    icon: "📰",
    desc: "Bestseller lists · 5 categories",
    needsKey: true,
    group: "content",
    keyName: "NYT_API_KEY",
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: "▶️",
    desc: "Trending videos · 5 categories",
    needsKey: true,
    group: "content",
    keyName: "YOUTUBE_API_KEY",
  },
  {
    key: "igdb",
    label: "IGDB",
    icon: "🏆",
    desc: "Games + Metacritic · 40 items per run",
    needsKey: true,
    group: "content",
    keyName: "IGDB_CLIENT_ID",
  },
  // Enrichers
  {
    key: "omdb",
    label: "OMDB Ratings",
    icon: "⭐",
    desc: "IMDB + RT + Metacritic on all movies",
    needsKey: true,
    group: "enricher",
    keyName: "OMDB_API_KEY",
  },
  {
    key: "wikipedia",
    label: "Wikipedia",
    icon: "📝",
    desc: "Adds summaries to items missing descriptions",
    needsKey: false,
    group: "enricher",
  },
  {
    key: "justwatch",
    label: "JustWatch",
    icon: "📺",
    desc: "Netflix · Prime · Disney+ availability",
    needsKey: false,
    group: "enricher",
  },
];

const CRON_SCHEDULE = [
  { time: "1:00", key: "github" },
  { time: "2:00", key: "tmdb" },
  { time: "3:00", key: "rawg" },
  { time: "4:00", key: "books" },
  { time: "5:00", key: "producthunt" },
  { time: "6:00", key: "pulse" },
  { time: "7:00", key: "omdb" },
  { time: "8:00", key: "hackernews" },
  { time: "9:00", key: "reddit" },
  { time: "10:00", key: "arxiv" },
  { time: "11:00", key: "steam" },
  { time: "12:00", key: "devto" },
  { time: "13:00", key: "openlibrary" },
  { time: "15:00", key: "wikipedia" },
  { time: "16:00", key: "justwatch" },
  { time: "17:00", key: "courses" },
  { time: "18:00", key: "igdb" },
  { time: "20:00", key: "spotify" },
  { time: "21:00", key: "nyt" },
  { time: "22:00", key: "youtube" },
];

export default function AdminPanel() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [results, setResults] = useState({});
  const [running, setRunning] = useState({});
  const [stats, setStats] = useState({
    total: null,
    bySource: [],
    byCategory: [],
  });
  const [activeTab, setActiveTab] = useState("providers");
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("all"); // all | content | enricher | needsKey
  const logsRef = useRef(null);

  // --------------------------------------------------
  // CHECK ADMIN ACCESS ON MOUNT
  // --------------------------------------------------
  useEffect(() => {
    verifyAdminAccess();
  }, []);

  async function verifyAdminAccess() {
    const { authenticated, profile } = await checkAuth();

    if (!authenticated) {
      router.replace("/account/login");
      return;
    }

    if (!profile?.is_admin) {
      router.replace("/");
      return;
    }

    setUser(profile);
    setProfile(profile);
    setAuthLoading(false);
    loadStats();
  }

  useEffect(() => {
    if (logsRef.current)
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
  }, [logs]);

  function addLog(msg, type = "info") {
    const time = new Date().toLocaleTimeString("en", { hour12: false });
    setLogs((l) => [...l.slice(-99), { msg, type, time, id: Date.now() }]);
  }

  async function loadStats() {
    const { count } = await supabase
      .from("items")
      .select("*", { count: "exact", head: true })
      .eq("approved", true);
    const { data: sourceData } = await supabase
      .from("items")
      .select("source_name")
      .eq("approved", true);
    const { data: catData } = await supabase
      .from("items")
      .select("category_id")
      .eq("approved", true);

    const bySource = Object.entries(
      (sourceData || []).reduce((a, r) => {
        a[r.source_name] = (a[r.source_name] || 0) + 1;
        return a;
      }, {}),
    ).sort((a, b) => b[1] - a[1]);

    const byCategory = Object.entries(
      (catData || []).reduce((a, r) => {
        a[r.category_id] = (a[r.category_id] || 0) + 1;
        return a;
      }, {}),
    ).sort((a, b) => b[1] - a[1]);

    setStats({ total: count, bySource, byCategory });
  }

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
        loadStats();
      } else {
        addLog(
          `✗ ${key} — ${r?.error || data.error || `HTTP ${res.status}`}`,
          "error",
        );
      }
    } catch (e) {
      setResults((p) => ({ ...p, [key]: { error: e.message } }));
      addLog(`✗ ${key} — ${e.message}`, "error");
    }
    setRunning((p) => ({ ...p, [key]: false }));
  }

  async function runGroup(group) {
    const list = PROVIDERS.filter((p) => p.group === group);
    addLog(`Running ${list.length} ${group} providers...`, "info");
    for (const p of list) await trigger(p.key);
    addLog(`${group} group complete`, "success");
  }

  async function runAll() {
    addLog("Starting full pipeline run...", "info");
    for (const p of PROVIDERS) await trigger(p.key);
    addLog("Full pipeline complete", "success");
  }

  function getSummary(key, res) {
    if (!res?.success) return null;
    const r = res.results?.[key];
    if (!r) return "complete";
    if (r.enriched !== undefined) return `${r.enriched} enriched`;
    if (r.synced !== undefined) return `${r.synced} synced`;
    return "done";
  }

  const filteredProviders = PROVIDERS.filter((p) => {
    if (filter === "content") return p.group === "content";
    if (filter === "enricher") return p.group === "enricher";
    if (filter === "needsKey") return p.needsKey;
    if (filter === "free") return !p.needsKey;
    return true;
  });

  const anyRunning = Object.values(running).some(Boolean);
  const totalSynced = Object.values(results).reduce((sum, r) => {
    const v = r?.results;
    if (!v) return sum;
    return (
      sum +
      Object.values(v).reduce((s, x) => s + (x?.synced || x?.enriched || 0), 0)
    );
  }, 0);

  if (authLoading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: GOLD.bg,
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: `2px solid ${GOLD.muted2}`,
            borderTopColor: GOLD.primary,
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <span
          style={{ color: GOLD.muted, fontSize: 13, fontFamily: "monospace" }}
        >
          Authenticating...
        </span>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow    { 0%,100%{box-shadow:0 0 12px ${GOLD.glow}} 50%{box-shadow:0 0 28px ${GOLD.glowHard}} }

        html, body { background: ${GOLD.bg}; color: ${GOLD.text}; font-family: 'Syne', system-ui, sans-serif; }

        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${GOLD.muted2}; border-radius: 4px; }

        .btn-gold {
          background: linear-gradient(135deg, ${GOLD.light}, ${GOLD.primary}, ${GOLD.dark});
          color: #09090C;
          border: none;
          border-radius: 10px;
          padding: 10px 22px;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.02em;
        }
        .btn-gold:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 20px ${GOLD.glow}; }
        .btn-gold:disabled { opacity: 0.4; cursor: not-allowed; }

        .btn-ghost {
          background: transparent;
          color: ${GOLD.muted};
          border: 1px solid ${GOLD.borderSoft};
          border-radius: 8px;
          padding: 7px 14px;
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-ghost:hover:not(:disabled) { border-color: ${GOLD.primary}; color: ${GOLD.primary}; }
        .btn-ghost:disabled { opacity: 0.4; cursor: not-allowed; }

        .card {
          background: ${GOLD.surface};
          border: 1px solid ${GOLD.borderSoft};
          border-radius: 16px;
          transition: border-color 0.2s;
        }
        .card:hover { border-color: ${GOLD.border}; }

        .tab { 
          padding: 8px 18px; 
          font-family: 'Syne', sans-serif;
          font-size: 12px; 
          font-weight: 700; 
          border-radius: 8px; 
          cursor: pointer; 
          border: none;
          transition: all 0.15s;
          letter-spacing: 0.04em;
        }
        .tab-active { background: ${GOLD.glow}; color: ${GOLD.primary}; border: 1px solid ${GOLD.border}; }
        .tab-inactive { background: transparent; color: ${GOLD.muted}; border: 1px solid transparent; }
        .tab-inactive:hover { color: ${GOLD.text}; }

        .provider-card {
          background: ${GOLD.surface};
          border: 1px solid ${GOLD.borderSoft};
          border-radius: 14px;
          padding: 16px;
          transition: all 0.2s;
          animation: fadeIn 0.3s ease both;
        }
        .provider-card:hover { border-color: ${GOLD.border}; background: ${GOLD.surface2}; }
        .provider-card.running { border-color: ${GOLD.primary}; animation: glow 2s ease infinite; }
        .provider-card.success { border-color: rgba(48,209,88,0.3); }
        .provider-card.error   { border-color: rgba(255,69,58,0.3); }

        .stat-card {
          background: ${GOLD.surface};
          border: 1px solid ${GOLD.borderSoft};
          border-radius: 14px;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, ${GOLD.primary}, transparent);
        }

        .gold-text {
          background: linear-gradient(135deg, ${GOLD.light}, ${GOLD.primary});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .log-line { animation: fadeIn 0.2s ease; }

        .filter-pill {
          padding: 5px 12px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 700;
          font-family: 'Syne', sans-serif;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.15s;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .filter-active { background: ${GOLD.glow}; color: ${GOLD.primary}; border-color: ${GOLD.border}; }
        .filter-inactive { color: ${GOLD.muted}; border-color: ${GOLD.muted2}; }
        .filter-inactive:hover { color: ${GOLD.text}; border-color: ${GOLD.muted}; }

        .progress-bar {
          height: 3px;
          border-radius: 99px;
          background: ${GOLD.muted2};
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, ${GOLD.dark}, ${GOLD.primary}, ${GOLD.light});
          background-size: 200% auto;
          animation: shimmer 2s linear infinite;
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: GOLD.bg }}>
        {/* Top bar */}
        <div
          style={{
            borderBottom: `1px solid ${GOLD.borderSoft}`,
            padding: "0 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 60,
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: `${GOLD.bg}E0`,
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <a
              href="/"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: `linear-gradient(135deg, ${GOLD.light}, ${GOLD.dark})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                }}
              >
                ◆
              </div>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 900,
                  color: GOLD.primary,
                  letterSpacing: "-0.02em",
                }}
              >
                NOVA
              </span>
            </a>
            <div style={{ width: 1, height: 20, background: GOLD.muted2 }} />
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: GOLD.muted,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Admin Panel
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {anyRunning && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12,
                  color: GOLD.primary,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: GOLD.primary,
                    animation: "pulse 1s infinite",
                  }}
                />
                Pipeline running
              </div>
            )}
            {totalSynced > 0 && (
              <div
                style={{
                  fontSize: 12,
                  color: GOLD.muted,
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                +{totalSynced} this session
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {profile?.avatar_url && (
                <img
                  src={profile.avatar_url}
                  alt=""
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border: `1px solid ${GOLD.border}`,
                  }}
                />
              )}
              <span style={{ fontSize: 12, color: GOLD.muted }}>
                {profile?.display_name || user?.email}
              </span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
          {/* Page header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: 32,
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                <span className="gold-text">Content</span> Pipeline
              </h1>
              <p style={{ fontSize: 13, color: GOLD.muted, marginTop: 6 }}>
                {PROVIDERS.length} providers ·{" "}
                {PROVIDERS.filter((p) => !p.needsKey).length} free ·{" "}
                {PROVIDERS.filter((p) => p.needsKey).length} need keys
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn-ghost"
                onClick={() => runGroup("enricher")}
                disabled={anyRunning}
              >
                Run Enrichers
              </button>
              <button
                className="btn-ghost"
                onClick={() => runGroup("content")}
                disabled={anyRunning}
              >
                Run Content
              </button>
              <button
                className="btn-gold"
                onClick={runAll}
                disabled={anyRunning}
              >
                {anyRunning ? "⟳ Running pipeline..." : "▶ Run All Providers"}
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 12,
              marginBottom: 32,
            }}
          >
            <div className="stat-card">
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: GOLD.muted,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Total Items
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                }}
                className="gold-text"
              >
                {stats.total?.toLocaleString() ?? "…"}
              </div>
            </div>
            {stats.byCategory.map(([cat, count]) => (
              <div className="stat-card" key={cat}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: GOLD.muted,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 8,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {cat}
                </div>
                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 900,
                    letterSpacing: "-0.04em",
                    color: GOLD.text,
                  }}
                >
                  {count.toLocaleString()}
                </div>
                <div style={{ marginTop: 8 }}>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(100, (count / (stats.total || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: 4,
              marginBottom: 24,
              borderBottom: `1px solid ${GOLD.borderSoft}`,
              paddingBottom: 16,
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", gap: 4 }}>
              {[
                { id: "providers", label: "Providers" },
                { id: "schedule", label: "Cron Schedule" },
                {
                  id: "logs",
                  label: `Logs ${logs.length > 0 ? `(${logs.length})` : ""}`,
                },
                { id: "sources", label: "Source Breakdown" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`tab ${activeTab === tab.id ? "tab-active" : "tab-inactive"}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "providers" && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[
                  { id: "all", label: "All" },
                  { id: "content", label: "Content" },
                  { id: "enricher", label: "Enrichers" },
                  { id: "free", label: "No Key" },
                  { id: "needsKey", label: "Needs Key" },
                ].map((f) => (
                  <button
                    key={f.id}
                    className={`filter-pill ${filter === f.id ? "filter-active" : "filter-inactive"}`}
                    onClick={() => setFilter(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Providers tab */}
          {activeTab === "providers" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: 10,
              }}
            >
              {filteredProviders.map((p, i) => {
                const res = results[p.key];
                const busy = running[p.key];
                const ok = res?.success;
                const err = res && !ok;
                const sum = getSummary(p.key, res);

                return (
                  <div
                    key={p.key}
                    className={`provider-card ${busy ? "running" : ok ? "success" : err ? "error" : ""}`}
                    style={{ animationDelay: `${i * 0.03}s` }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                      }}
                    >
                      {/* Icon */}
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: GOLD.surface2,
                          border: `1px solid ${GOLD.borderSoft}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                          flexShrink: 0,
                        }}
                      >
                        {p.icon}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 3,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 800,
                              letterSpacing: "-0.01em",
                            }}
                          >
                            {p.label}
                          </span>
                          {p.needsKey && (
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 800,
                                background: "rgba(255,159,10,0.12)",
                                color: GOLD.orange,
                                padding: "2px 6px",
                                borderRadius: 4,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                              }}
                            >
                              KEY
                            </span>
                          )}
                          {p.group === "enricher" && (
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 800,
                                background: `${GOLD.glow}`,
                                color: GOLD.primary,
                                padding: "2px 6px",
                                borderRadius: 4,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                              }}
                            >
                              ENRICHER
                            </span>
                          )}
                          {/* Status dot */}
                          {busy && (
                            <div
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                background: GOLD.primary,
                                animation: "pulse 0.8s infinite",
                                marginLeft: "auto",
                              }}
                            />
                          )}
                          {!busy && ok && (
                            <div
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                background: GOLD.green,
                                marginLeft: "auto",
                              }}
                            />
                          )}
                          {!busy && err && (
                            <div
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                background: GOLD.red,
                                marginLeft: "auto",
                              }}
                            />
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: GOLD.muted,
                            lineHeight: 1.4,
                          }}
                        >
                          {p.desc}
                        </div>
                        {p.needsKey && (
                          <div
                            style={{
                              fontSize: 10,
                              color: GOLD.muted2,
                              marginTop: 3,
                              fontFamily: "JetBrains Mono, monospace",
                            }}
                          >
                            {p.keyName}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress bar when running */}
                    {busy && (
                      <div style={{ marginTop: 12 }}>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: "60%" }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Result */}
                    {res && !busy && (
                      <div
                        style={{
                          marginTop: 12,
                          padding: "8px 12px",
                          borderRadius: 8,
                          background: ok
                            ? "rgba(48,209,88,0.05)"
                            : "rgba(255,69,58,0.05)",
                          border: `1px solid ${ok ? "rgba(48,209,88,0.15)" : "rgba(255,69,58,0.15)"}`,
                        }}
                      >
                        {ok ? (
                          <span
                            style={{
                              fontSize: 12,
                              color: GOLD.green,
                              fontWeight: 700,
                            }}
                          >
                            ✓ {sum}
                          </span>
                        ) : (
                          <div>
                            <div
                              style={{
                                fontSize: 12,
                                color: GOLD.red,
                                fontWeight: 700,
                              }}
                            >
                              ✗{" "}
                              {res.error ||
                                res.results?.[p.key]?.error ||
                                `HTTP ${res.httpStatus}`}
                            </div>
                            {res.fix && (
                              <div
                                style={{
                                  fontSize: 10,
                                  color: GOLD.orange,
                                  marginTop: 4,
                                  fontFamily: "JetBrains Mono, monospace",
                                }}
                              >
                                {res.fix}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Run button */}
                    <div
                      style={{
                        marginTop: 14,
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        className="btn-ghost"
                        onClick={() => trigger(p.key)}
                        disabled={busy}
                        style={{ fontSize: 11 }}
                      >
                        {busy ? (
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <span
                              style={{
                                width: 10,
                                height: 10,
                                border: `1.5px solid ${GOLD.muted2}`,
                                borderTopColor: GOLD.primary,
                                borderRadius: "50%",
                                display: "inline-block",
                                animation: "spin 0.7s linear infinite",
                              }}
                            />
                            Running
                          </span>
                        ) : (
                          "▶ Run"
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Schedule tab */}
          {activeTab === "schedule" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: 8,
              }}
            >
              {CRON_SCHEDULE.map(({ time, key }) => {
                const provider = PROVIDERS.find((p) => p.key === key);
                const isNext = false; // could compute based on current time
                return (
                  <div
                    key={key}
                    style={{
                      background: GOLD.surface,
                      border: `1px solid ${GOLD.borderSoft}`,
                      borderRadius: 12,
                      padding: "14px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: 13,
                        fontWeight: 500,
                        color: GOLD.primary,
                        minWidth: 46,
                      }}
                    >
                      {time}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>
                        {provider?.label || key}
                      </div>
                      <div style={{ fontSize: 10, color: GOLD.muted }}>
                        UTC daily
                      </div>
                    </div>
                    <span style={{ marginLeft: "auto", fontSize: 16 }}>
                      {provider?.icon || "⚙️"}
                    </span>
                  </div>
                );
              })}
              <div
                style={{
                  background: GOLD.surface,
                  border: `1px solid ${GOLD.border}`,
                  borderRadius: 12,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 13,
                    fontWeight: 500,
                    color: GOLD.primary,
                    minWidth: 46,
                  }}
                >
                  6:00
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>
                    Nova Pulse
                  </div>
                  <div style={{ fontSize: 10, color: GOLD.muted }}>
                    Score recalculation
                  </div>
                </div>
                <span style={{ marginLeft: "auto", fontSize: 16 }}>🔥</span>
              </div>
            </div>
          )}

          {/* Logs tab */}
          {activeTab === "logs" && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: 12, color: GOLD.muted }}>
                  {logs.length} log entries this session
                </span>
                <button
                  className="btn-ghost"
                  onClick={() => setLogs([])}
                  style={{ fontSize: 11 }}
                >
                  Clear
                </button>
              </div>
              <div
                ref={logsRef}
                style={{
                  background: GOLD.surface,
                  border: `1px solid ${GOLD.borderSoft}`,
                  borderRadius: 14,
                  padding: 20,
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 12,
                  lineHeight: 1.8,
                  maxHeight: 500,
                  overflowY: "auto",
                }}
              >
                {logs.length === 0 ? (
                  <div
                    style={{
                      color: GOLD.muted2,
                      textAlign: "center",
                      padding: "40px 0",
                    }}
                  >
                    No logs yet. Run a provider to see output.
                  </div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="log-line"
                      style={{
                        display: "flex",
                        gap: 16,
                        paddingBottom: 4,
                        borderBottom: `1px solid ${GOLD.borderSoft}`,
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          color: GOLD.muted2,
                          minWidth: 60,
                          flexShrink: 0,
                        }}
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
          )}

          {/* Sources tab */}
          {activeTab === "sources" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 10,
              }}
            >
              {stats.bySource.map(([src, count]) => (
                <div key={src} className="stat-card">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: GOLD.text,
                      }}
                    >
                      {src}
                    </span>
                    <span
                      style={{
                        fontSize: 22,
                        fontWeight: 900,
                        color: GOLD.primary,
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      {count}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(100, (count / (stats.total || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: GOLD.muted,
                      marginTop: 6,
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {((count / (stats.total || 1)) * 100).toFixed(1)}% of total
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
