// components/admin/SecurityTab.js
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

export default function SecurityTab() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [providerErrors, setProviderErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAuditLogs();
  }, [filter]);

  async function fetchAuditLogs() {
    setLoading(true);
    try {
      let query = supabase
        .from("admin_audit_logs")
        .select("*, profiles(display_name)")
        .order("created_at", { ascending: false })
        .limit(100);

      if (filter !== "all") {
        query = query.eq("action", filter);
      }

      const [logsRes, providersRes] = await Promise.all([
        query,
        supabase
          .from("provider_sync_status")
          .select("provider_name,status,last_error_message,last_sync_at,items_failed")
          .order("provider_name"),
      ]);

      if (logsRes.error) throw logsRes.error;
      if (providersRes.error) throw providersRes.error;

      setAuditLogs(logsRes.data || []);
      setProviderErrors((providersRes.data || []).filter((p) => p.status === "error" || p.items_failed > 0));
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    }
    setLoading(false);
  }

  const actionTypes = [...new Set(auditLogs.map((log) => log.action))];
  const visibleLogs = auditLogs.filter((log) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (log.action || "").toLowerCase().includes(q) ||
      (log.resource_type || "").toLowerCase().includes(q) ||
      (log.profiles?.display_name || "").toLowerCase().includes(q)
    );
  });

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
            Security & Audit Logs
          </h2>
          <p style={{ fontSize: 14, color: G.t2 }}>
            Track all administrative actions for compliance and security
          </p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setFilter("all")}
            className="premium-btn"
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: `1px solid ${filter === "all" ? G.gold + "50" : G.border}`,
              background: filter === "all" ? G.gold + "15" : "transparent",
              color: filter === "all" ? G.gold : G.t3,
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            All
          </button>
          {actionTypes.slice(0, 5).map((action) => (
            <button
              key={action}
              onClick={() => setFilter(action)}
              className="premium-btn"
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: `1px solid ${filter === action ? G.gold + "50" : G.border}`,
                background: filter === action ? G.gold + "15" : "transparent",
                color: filter === action ? G.gold : G.t3,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div className="premium-card"
          style={{
            padding: 16,
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
            }}
          >
            Total Actions
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: G.gold }}>
            {auditLogs.length}
          </div>
        </div>

        <div className="premium-card"
          style={{
            padding: 16,
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
            }}
          >
            Today
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: G.blue }}>
            {
              auditLogs.filter((log) => {
                const today = new Date().setHours(0, 0, 0, 0);
                const logDate = new Date(log.created_at).setHours(0, 0, 0, 0);
                return logDate === today;
              }).length
            }
          </div>
        </div>

        <div className="premium-card"
          style={{
            padding: 16,
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
            }}
          >
            Unique Admins
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: G.green }}>
            {new Set(auditLogs.map((log) => log.user_id)).size}
          </div>
        </div>
      </div>

      {/* Provider Error Tracking */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>
          Provider Error Tracking
        </h3>
        {providerErrors.length === 0 ? (
          <div className="premium-card"
            style={{
              padding: 14,
              borderRadius: 10,
              border: `1px solid ${G.border}`,
              background: G.bg2,
              color: G.t3,
              fontSize: 13,
            }}
          >
            No provider errors currently detected.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 10 }}>
            {providerErrors.map((p) => (
              <div className="premium-card"
                key={p.provider_name}
                style={{
                  borderRadius: 10,
                  border: `1px solid ${G.red}40`,
                  background: `${G.red}10`,
                  padding: 12,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: G.red, marginBottom: 6 }}>
                  {p.provider_name}
                </div>
                <div style={{ fontSize: 11, color: G.t2, marginBottom: 6 }}>
                  Last sync: {p.last_sync_at ? new Date(p.last_sync_at).toLocaleString() : "N/A"}
                </div>
                <div style={{ fontSize: 11, color: G.t2 }}>
                  {p.last_error_message || "Failure detected without message"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: G.t3 }}>
          Loading audit logs...
        </div>
      ) : auditLogs.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            background: G.bg2,
            border: `1px solid ${G.border}`,
            borderRadius: 12,
            color: G.t3,
          }}
        >
          No audit logs found
        </div>
      ) : (
        <div className="premium-card"
          style={{
            background: G.bg2,
            border: `1px solid ${G.border}`,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div style={{ padding: 12, borderBottom: `1px solid ${G.border}` }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search actions, resources, or admin..."
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: `1px solid ${G.border}`,
                background: G.bg3,
                color: G.t1,
                fontSize: 12,
                outline: "none",
              }}
            />
          </div>
          {visibleLogs.map((log, idx) => (
            <div
              key={log.id}
              style={{
                padding: 16,
                borderBottom:
                  idx < visibleLogs.length - 1 ? `1px solid ${G.border}` : "none",
                fontFamily: "monospace",
                fontSize: 12,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "140px 120px 1fr 180px",
                  gap: 16,
                  alignItems: "center",
                }}
              >
                <div>
                  <span style={{ color: G.t3 }}>Action:</span>{" "}
                  <span style={{ color: G.gold, fontWeight: 700 }}>
                    {log.action}
                  </span>
                </div>
                <div>
                  <span style={{ color: G.t3 }}>Resource:</span>{" "}
                  <span style={{ color: G.t1 }}>{log.resource_type}</span>
                </div>
                <div
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span style={{ color: G.t3 }}>User:</span>{" "}
                  <span style={{ color: G.t1 }}>
                    {log.profiles?.display_name || "Unknown"}
                  </span>
                </div>
                <div style={{ textAlign: "right", color: G.t3 }}>
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>

              {/* Show IP and User Agent if available */}
              {(log.ip_address || log.user_agent) && (
                <div style={{ marginTop: 8, fontSize: 10, color: G.t3 }}>
                  {log.ip_address && <span>IP: {log.ip_address}</span>}
                  {log.ip_address && log.user_agent && <span> · </span>}
                  {log.user_agent && (
                    <span>UA: {log.user_agent.substring(0, 60)}...</span>
                  )}
                </div>
              )}

              {/* Show old/new values if available */}
              {(log.old_value || log.new_value) && (
                <details style={{ marginTop: 8 }}>
                  <summary
                    style={{ cursor: "pointer", color: G.t3, fontSize: 10 }}
                  >
                    View Changes
                  </summary>
                  <div
                    style={{
                      marginTop: 8,
                      padding: 12,
                      background: G.bg3,
                      borderRadius: 8,
                      fontSize: 10,
                    }}
                  >
                    {log.old_value && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ color: G.red, marginBottom: 4 }}>
                          Old Value:
                        </div>
                        <pre
                          style={{
                            margin: 0,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-all",
                          }}
                        >
                          {JSON.stringify(log.old_value, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.new_value && (
                      <div>
                        <div style={{ color: G.green, marginBottom: 4 }}>
                          New Value:
                        </div>
                        <pre
                          style={{
                            margin: 0,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-all",
                          }}
                        >
                          {JSON.stringify(log.new_value, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
