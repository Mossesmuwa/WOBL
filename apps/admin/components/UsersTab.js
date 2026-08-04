import { useEffect, useMemo, useState } from "react";
import { supabase } from "shared/lib/supabase";

const G = {
  bg2: "#0F0F14",
  bg3: "#16161E",
  gold: "#C9A84C",
  border: "rgba(255,255,255,0.06)",
  t1: "#F2F2F7",
  t2: "#AEAEB2",
  t3: "#636366",
  green: "#30D158",
  red: "#FF453A",
  blue: "#0A84FF",
};

export default function UsersTab({ notify, confirmAction }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [busyUserId, setBusyUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, email, is_admin, is_pro, created_at")
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("[UsersTab] fetch failed:", err);
      notify?.("error", "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function updateRole(userId, patch, successMessage) {
    setBusyUserId(userId);
    try {
      const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
      if (error) throw error;
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...patch } : u)));
      notify?.("success", successMessage);
    } catch (err) {
      console.error("[UsersTab] update failed:", err);
      notify?.("error", "Failed to update user");
    } finally {
      setBusyUserId(null);
    }
  }

  const visibleUsers = useMemo(() => {
    return users.filter((u) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        (u.display_name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q);
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "admin"
            ? u.is_admin
            : filter === "pro"
              ? u.is_pro
              : !u.is_admin && !u.is_pro;
      return matchesQuery && matchesFilter;
    });
  }, [users, query, filter]);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6 }}>Users Management</h2>
        <p style={{ fontSize: 14, color: G.t2 }}>
          Revoke admin/pro access, monitor user roles, and keep account permissions clean.
        </p>
      </div>

      <div
        style={{
          marginBottom: 18,
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email..."
          style={{
            flex: 1,
            minWidth: 220,
            padding: "10px 14px",
            borderRadius: 10,
            border: `1px solid ${G.border}`,
            background: G.bg2,
            color: G.t1,
            fontSize: 13,
            outline: "none",
          }}
        />
        {["all", "admin", "pro", "regular"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="premium-btn"
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: `1px solid ${filter === f ? `${G.gold}66` : G.border}`,
              background: filter === f ? `${G.gold}1F` : "transparent",
              color: filter === f ? G.gold : G.t3,
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              cursor: "pointer",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))",
          gap: 12,
        }}
      >
        {loading ? (
          <div style={{ color: G.t3, padding: 20 }}>Loading users...</div>
        ) : visibleUsers.length === 0 ? (
          <div style={{ color: G.t3, padding: 20 }}>No users found.</div>
        ) : (
          visibleUsers.map((u) => (
            <div
              key={u.id}
              className="premium-card"
              style={{
                background: G.bg2,
                border: `1px solid ${G.border}`,
                borderRadius: 12,
                padding: 14,
              }}
            >
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: G.t1 }}>
                  {u.display_name || "Unnamed User"}
                </div>
                <div style={{ fontSize: 12, color: G.t3 }}>{u.email || "No email"}</div>
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: 10,
                    padding: "4px 8px",
                    borderRadius: 99,
                    background: u.is_admin ? `${G.red}1A` : `${G.blue}1A`,
                    color: u.is_admin ? G.red : G.blue,
                    fontWeight: 800,
                    textTransform: "uppercase",
                  }}
                >
                  {u.is_admin ? "Admin" : "Standard"}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    padding: "4px 8px",
                    borderRadius: 99,
                    background: u.is_pro ? `${G.green}1A` : `${G.border}`,
                    color: u.is_pro ? G.green : G.t3,
                    fontWeight: 800,
                    textTransform: "uppercase",
                  }}
                >
                  {u.is_pro ? "Pro" : "Free"}
                </span>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {u.is_admin ? (
                  <button
                    disabled={busyUserId === u.id}
                    onClick={() =>
                      confirmAction?.({
                        title: "Revoke admin access?",
                        message: `This will remove admin access for ${u.display_name || u.email}.`,
                        confirmLabel: "Revoke admin",
                        tone: "danger",
                        onConfirm: () =>
                          updateRole(u.id, { is_admin: false }, "Admin access revoked"),
                      })
                    }
                    className="premium-btn"
                    style={actionBtn("danger")}
                  >
                    Revoke Admin
                  </button>
                ) : (
                  <button
                    disabled={busyUserId === u.id}
                    onClick={() =>
                      updateRole(u.id, { is_admin: true }, "Admin access granted")
                    }
                    className="premium-btn"
                    style={actionBtn("default")}
                  >
                    Make Admin
                  </button>
                )}

                {u.is_pro ? (
                  <button
                    disabled={busyUserId === u.id}
                    onClick={() =>
                      confirmAction?.({
                        title: "Revoke Pro subscription?",
                        message: `This will downgrade ${u.display_name || u.email} to free.`,
                        confirmLabel: "Revoke Pro",
                        tone: "danger",
                        onConfirm: () =>
                          updateRole(u.id, { is_pro: false }, "Pro access revoked"),
                      })
                    }
                    className="premium-btn"
                    style={actionBtn("danger")}
                  >
                    Revoke Pro
                  </button>
                ) : (
                  <button
                    disabled={busyUserId === u.id}
                    onClick={() => updateRole(u.id, { is_pro: true }, "Pro access granted")}
                    className="premium-btn"
                    style={actionBtn("success")}
                  >
                    Grant Pro
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function actionBtn(kind) {
  const theme =
    kind === "danger"
      ? {
          border: "1px solid rgba(255,69,58,0.42)",
          background: "rgba(255,69,58,0.13)",
          color: "#FF453A",
        }
      : kind === "success"
        ? {
            border: "1px solid rgba(48,209,88,0.42)",
            background: "rgba(48,209,88,0.13)",
            color: "#30D158",
          }
        : {
            border: "1px solid rgba(201,168,76,0.42)",
            background: "rgba(201,168,76,0.13)",
            color: "#C9A84C",
          };

  return {
    padding: "8px 10px",
    borderRadius: 8,
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
    ...theme,
  };
}
