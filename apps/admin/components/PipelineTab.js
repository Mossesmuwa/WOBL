// components/admin/PipelineTab.js
import { useState, useEffect } from "react";
import { supabase } from "shared/lib/supabase";

const G = {
  bg: "#09090C",
  bg2: "#0F0F14",
  bg3: "#16161E",
  bg4: "#1C1C26",
  gold: "#C9A84C",
  goldL: "#E8C97A",
  border: "rgba(255,255,255,0.06)",
  borderG: "rgba(201,168,76,0.20)",
  t1: "#F2F2F7",
  t2: "#AEAEB2",
  t3: "#636366",
  green: "#30D158",
  red: "#FF453A",
  orange: "#FF9F0A",
  blue: "#0A84FF",
};

function StatusDot({ status }) {
  const colors = {
    running: G.gold,
    idle: G.green,
    error: G.red,
    disabled: G.t3,
  };

  return (
    <div
      style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: colors[status] || G.t3,
        animation: status === "running" ? "pulse 1.5s infinite" : "none",
        boxShadow: status === "running" ? `0 0 8px ${colors[status]}` : "none",
      }}
    />
  );
}

function ProviderCard({ provider, onTrigger }) {
  const [triggering, setTriggering] = useState(false);

  async function handleTrigger() {
    setTriggering(true);
    await onTrigger(provider.provider_name);
    setTriggering(false);
  }

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        border: `1px solid ${provider.status === "error" ? G.red + "40" : G.border}`,
        background: G.bg2,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <StatusDot status={provider.status} />
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                textTransform: "capitalize",
              }}
            >
              {provider.provider_name}
            </div>
            <div style={{ fontSize: 11, color: G.t3, marginTop: 2 }}>
              {provider.requires_api_key && (
                <span style={{ color: provider.has_api_key ? G.green : G.red }}>
                  {provider.has_api_key ? "✓ API Key" : "✗ Missing Key"}
                </span>
              )}
              {!provider.requires_api_key && (
                <span style={{ color: G.green }}>✓ No Key Required</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleTrigger}
            disabled={provider.status === "running" || triggering}
            className="premium-btn"
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor:
                provider.status === "running" || triggering
                  ? "not-allowed"
                  : "pointer",
              opacity: provider.status === "running" || triggering ? 0.5 : 1,
            }}
          >
            {triggering ? "Triggering..." : "Trigger"}
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
          gap: 12,
          fontSize: 12,
          paddingTop: 12,
          borderTop: `1px solid ${G.border}`,
        }}
      >
        <div>
          <div style={{ color: G.t3, marginBottom: 2 }}>Last Sync</div>
          <div style={{ color: G.t1, fontWeight: 600 }}>
            {provider.last_sync_at
              ? new Date(provider.last_sync_at).toLocaleTimeString()
              : "Never"}
          </div>
        </div>
        <div>
          <div style={{ color: G.t3, marginBottom: 2 }}>Items</div>
          <div style={{ color: G.green, fontWeight: 700 }}>
            {provider.items_synced || 0}
          </div>
        </div>
        <div>
          <div style={{ color: G.t3, marginBottom: 2 }}>Failed</div>
          <div
            style={{
              color: provider.items_failed > 0 ? G.red : G.t1,
              fontWeight: 700,
            }}
          >
            {provider.items_failed || 0}
          </div>
        </div>
        <div>
          <div style={{ color: G.t3, marginBottom: 2 }}>Duration</div>
          <div style={{ color: G.t1, fontWeight: 600 }}>
            {provider.sync_duration_ms
              ? `${(provider.sync_duration_ms / 1000).toFixed(1)}s`
              : "N/A"}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {provider.last_error_message && (
        <div
          style={{
            marginTop: 12,
            padding: 10,
            borderRadius: 8,
            background: G.red + "10",
            border: `1px solid ${G.red}30`,
            fontSize: 11,
            color: G.red,
            fontFamily: "monospace",
          }}
        >
          {provider.last_error_message}
        </div>
      )}
    </div>
  );
}

export default function PipelineTab({ notify, confirmAction }) {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchProviders();

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchProviders, 10000);
    return () => clearInterval(interval);
  }, []);

  async function fetchProviders() {
    try {
      const { data, error } = await supabase
        .from("provider_sync_status")
        .select("*")
        .order("provider_name");

      if (error) throw error;
      setProviders(data || []);
    } catch (err) {
      console.error("Failed to fetch providers:", err);
    }
    setLoading(false);
  }

  async function triggerProvider(providerName) {
    try {
      const token = (await supabase.auth.getSession()).data.session
        ?.access_token;
      const res = await fetch("/api/admin/trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ provider: providerName }),
      });

      if (res.ok) {
        notify?.("success", `${providerName} triggered`);
        fetchProviders();
      } else {
        const error = await res.json();
        notify?.("error", error.error || "Failed to trigger");
      }
    } catch (err) {
      notify?.("error", err.message || "Failed to trigger");
    }
  }

  const filtered = providers.filter((p) => {
    if (filter === "all") return true;
    if (filter === "has_key") return p.has_api_key;
    if (filter === "no_key") return !p.has_api_key;
    if (filter === "running") return p.status === "running";
    if (filter === "error") return p.status === "error";
    if (filter === "idle") return p.status === "idle";
    return true;
  });

  const stats = {
    total: providers.length,
    running: providers.filter((p) => p.status === "running").length,
    errors: providers.filter((p) => p.status === "error").length,
    idle: providers.filter((p) => p.status === "idle").length,
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6 }}>
            Data Pipeline
          </h2>
          <p style={{ fontSize: 14, color: G.t2 }}>
            {stats.running} running · {stats.errors} errors · {stats.idle} idle
          </p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() =>
              confirmAction?.({
                title: "Run all available providers?",
                message:
                  "This runs all providers one after another via the trigger API.",
                confirmLabel: "Run all",
                onConfirm: async () => {
                  for (const provider of providers) {
                    await triggerProvider(provider.provider_name);
                  }
                },
              }
            )}
              className="premium-btn"
              style={{ padding: "6px 12px" }}
            >
              run all
            </button>
            {["all", "running", "idle", "error", "has_key", "no_key"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="premium-btn"
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: `1px solid ${filter === f ? G.gold + "50" : G.border}`,
                  background: filter === f ? G.gold + "15" : "transparent",
                  color: filter === f ? G.gold : G.t3,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {f.replace("_", " ")}
              </button>
            ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: G.t3 }}>
          Loading providers...
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {filtered.map((provider) => (
            <div key={provider.provider_name} className="premium-card" style={{ padding: 0 }}>
              <ProviderCard
                provider={provider}
                onTrigger={triggerProvider}
              />
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            color: G.t3,
            background: G.bg2,
            border: `1px solid ${G.border}`,
            borderRadius: 12,
          }}
        >
          No providers match this filter
        </div>
      )}

      <style jsx global>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
