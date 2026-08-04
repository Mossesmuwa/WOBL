// components/admin/OverviewTab.js
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

function KPICard({ label, value, color, trend, loading }) {
  return (
    <div
      className="premium-card"
      style={{
        padding: 20,
        borderRadius: 12,
        border: `1px solid ${G.border}`,
        background: G.bg2,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: G.t3,
          marginBottom: 8,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 36,
          fontWeight: 900,
          color: color || G.gold,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.03em",
          marginBottom: 8,
        }}
      >
        {loading ? "—" : value?.toLocaleString()}
      </div>
      {trend && (
        <div
          style={{
            fontSize: 12,
            color: trend > 0 ? G.green : trend < 0 ? G.red : G.t3,
            fontWeight: 700,
          }}
        >
          {trend > 0 ? "↑" : trend < 0 ? "↓" : "→"} {Math.abs(trend)}% vs last
          week
        </div>
      )}
    </div>
  );
}

function QuickAction({ label, onClick, variant = "default" }) {
  const colors = {
    default: { bg: G.bg3, border: G.border, text: G.t1 },
    primary: { bg: G.gold, border: G.gold, text: "#000" },
    danger: { bg: G.red + "15", border: G.red + "40", text: G.red },
  };

  const c = colors[variant];

  return (
    <button
      className="premium-btn"
      onClick={onClick}
      style={{
        padding: "10px 16px",
        borderRadius: 8,
        border: `1px solid ${c.border}`,
        background: c.bg,
        color: c.text,
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {label}
    </button>
  );
}

export default function OverviewTab({ notify, confirmAction }) {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
  }, []);

  async function fetchStats() {
    setLoading(true);
    try {
      const [itemsRes, usersRes, providersRes, pendingRes, anomaliesRes] =
        await Promise.all([
          supabase
            .from("items")
            .select("id, approved, trending, created_at", {
              count: "exact",
              head: true,
            }),
          supabase
            .from("profiles")
            .select("id, is_pro", { count: "exact", head: true }),
          supabase.from("provider_sync_status").select("status"),
          supabase
            .from("pending_items")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending"),
          supabase
            .from("trend_anomalies")
            .select("id", { count: "exact", head: true })
            .eq("reviewed", false),
        ]);

      const providers = providersRes.data || [];

      setStats({
        totalItems: itemsRes.count || 0,
        totalUsers: usersRes.count || 0,
        activeProviders: providers.filter((p) => p.status === "running").length,
        errorProviders: providers.filter((p) => p.status === "error").length,
        pendingReview: pendingRes.count || 0,
        anomalies: anomaliesRes.count || 0,
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
    setLoading(false);
  }

  async function fetchRecentActivity() {
    try {
      const { data } = await supabase
        .from("admin_audit_logs")
        .select("*, profiles(display_name)")
        .order("created_at", { ascending: false })
        .limit(10);
      setRecentActivity(data || []);
    } catch (err) {
      console.error("Failed to fetch activity:", err);
    }
  }

  async function runAllProviders() {
    confirmAction?.({
      title: "Run all providers?",
      message:
        "This triggers the full content pipeline and may take several minutes.",
      confirmLabel: "Run all",
      onConfirm: async () => {
        try {
          const token = (await supabase.auth.getSession()).data.session
            ?.access_token;
          const res = await fetch("/api/admin/trigger", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ provider: "all" }),
          });

          if (res.ok) {
            notify?.("success", "All providers triggered");
            fetchStats();
          } else {
            const error = await res.json();
            notify?.("error", error.error || "Failed to trigger providers");
          }
        } catch (err) {
          notify?.("error", err.message || "Failed to trigger providers");
        }
      },
    });
  }

  async function calculateNovaScores() {
    confirmAction?.({
      title: "Recalculate Nova Scores?",
      message:
        "This recalculates score fields for many items and can take a while.",
      confirmLabel: "Recalculate",
      onConfirm: async () => {
        try {
          const token = (await supabase.auth.getSession()).data.session
            ?.access_token;
          const res = await fetch("/api/admin/calculate-scores", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            notify?.("success", "Nova Scores recalculated");
          } else {
            notify?.("error", "Failed to calculate scores");
          }
        } catch (err) {
          notify?.("error", err.message || "Failed to calculate scores");
        }
      },
    });
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6 }}>
          System Overview
        </h2>
        <p style={{ fontSize: 14, color: G.t2 }}>
          Real-time metrics and system health
        </p>
      </div>

      {/* KPI Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 40,
        }}
      >
        <KPICard
          label="Total Items"
          value={stats.totalItems}
          color={G.gold}
          loading={loading}
        />
        <KPICard
          label="Total Users"
          value={stats.totalUsers}
          color={G.blue}
          loading={loading}
        />
        <KPICard
          label="Active Providers"
          value={stats.activeProviders}
          color={G.green}
          loading={loading}
        />
        <KPICard
          label="Error Providers"
          value={stats.errorProviders}
          color={G.red}
          loading={loading}
        />
        <KPICard
          label="Pending Review"
          value={stats.pendingReview}
          color={G.orange}
          loading={loading}
        />
        <KPICard
          label="Anomalies"
          value={stats.anomalies}
          color={G.red}
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <div
        style={{
          padding: 20,
          borderRadius: 12,
          border: `1px solid ${G.border}`,
          background: G.bg2,
          marginBottom: 40,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>
          Quick Actions
        </h3>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <QuickAction
            label="Sync All Providers"
            onClick={runAllProviders}
            variant="primary"
          />
          <QuickAction
            label="Calculate Nova Scores"
            onClick={calculateNovaScores}
            variant="default"
          />
          <QuickAction
            label="Export Data"
            onClick={() => notify?.("info", "Export is coming soon")}
            variant="default"
          />
          <QuickAction
            label="View Logs"
            onClick={() => notify?.("info", "Open Security tab for audit logs")}
            variant="default"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div
        style={{
          padding: 20,
          borderRadius: 12,
          border: `1px solid ${G.border}`,
          background: G.bg2,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>
          Recent Activity
        </h3>

        {recentActivity.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: 40,
              color: G.t3,
              fontSize: 14,
            }}
          >
            No recent activity
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recentActivity.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  border: `1px solid ${G.border}`,
                  background: G.bg3,
                  fontSize: 13,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ color: G.gold, fontWeight: 700 }}>
                    {log.action}
                  </span>
                  <span style={{ color: G.t3, fontSize: 11 }}>
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                <div style={{ color: G.t2, fontSize: 12 }}>
                  {log.profiles?.display_name || "Unknown"} ·{" "}
                  {log.resource_type}/{log.resource_id}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Quick Actions */}
      <div className="premium-card" style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <QuickAction
            label="Sync All Providers"
            onClick={runAllProviders}
            variant="primary"
          />
          <QuickAction
            label="Calculate Nova Scores"
            onClick={calculateNovaScores}
            variant="default"
          />
          <QuickAction
            label="Export Data"
            onClick={() => notify?.("info", "Export is coming soon")}
            variant="default"
          />
          <QuickAction
            label="View Logs"
            onClick={() => notify?.("info", "Open Security tab for audit logs")}
            variant="default"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="premium-card">
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Recent Activity</h3>
        {recentActivity.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: 40,
              color: G.t3,
              fontSize: 14,
            }}
          >
            No recent activity
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recentActivity.map((log) => (
              <div
                key={log.id}
                className="premium-card"
                style={{ padding: 12, borderRadius: 8 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ color: G.gold, fontWeight: 700 }}>{log.action}</span>
                  <span style={{ color: G.t3, fontSize: 11 }}>{new Date(log.created_at).toLocaleString()}</span>
                </div>
                <div style={{ color: G.t2, fontSize: 12 }}>{log.profiles?.display_name || "Unknown"} · {log.resource_type}/{log.resource_id}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
