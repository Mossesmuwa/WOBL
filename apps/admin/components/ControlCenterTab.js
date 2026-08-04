import { useEffect, useState } from "react";
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

const TOGGLES = [
  { key: "maintenance_mode", label: "Maintenance Mode", desc: "Lock public experience for maintenance window." },
  { key: "ingestion_enabled", label: "Ingestion Enabled", desc: "Allow provider sync and enrich jobs." },
  { key: "ai_recommendations_enabled", label: "AI Recommendations", desc: "Enable AI recommendation endpoints." },
  { key: "new_user_onboarding_enabled", label: "Onboarding Flow", desc: "Show onboarding to new users." },
];

export default function ControlCenterTab({ notify }) {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [health, setHealth] = useState(null);
  const [env, setEnv] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [{ data }, h, e] = await Promise.all([
        supabase.from("system_settings").select("key,value"),
        fetch("/api/health").then((r) => r.json()).catch(() => null),
        fetch("/api/admin/env-check").then((r) => r.json()).catch(() => null),
      ]);

      const mapped = {};
      (data || []).forEach((row) => {
        mapped[row.key] = row.value;
      });
      setSettings(mapped);
      setHealth(h);
      setEnv(e);
    } catch (err) {
      console.error("[ControlCenter] load failed:", err);
      notify?.("error", "Failed to load control center data");
    } finally {
      setLoading(false);
    }
  }

  function asBool(v, defaultValue = true) {
    if (v === undefined || v === null || v === "") return defaultValue;
    return v === true || v === "true";
  }

  async function setFlag(key, value) {
    setSaving(key);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from("system_settings").upsert({
        key,
        value: value ? "true" : "false",
        updated_by: auth?.user?.id || null,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;

      setSettings((prev) => ({ ...prev, [key]: value ? "true" : "false" }));
      notify?.("success", `${key} updated`);
    } catch (err) {
      console.error("[ControlCenter] setFlag failed:", err);
      notify?.("error", `Failed to update ${key}`);
    } finally {
      setSaving("");
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6 }}>Control Center</h2>
        <p style={{ fontSize: 14, color: G.t2 }}>
          Central toggles for platform behavior, health status, and runtime readiness.
        </p>
      </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12, marginBottom: 24 }}>
            <div className="premium-card"><StatusCard label="API Health" value={health?.status || "unknown"} tone={health?.status === "ok" ? "green" : "red"} /></div>
            <div className="premium-card"><StatusCard
              label="Service Role"
              value={env?.verdict?.service_role_ok ? "ready" : "missing"}
              tone={env?.verdict?.service_role_ok ? "green" : "red"}
            /></div>
            <div className="premium-card"><StatusCard
              label="Cron Secret"
              value={env?.verdict?.cron_secret_ok ? "ready" : "missing"}
              tone={env?.verdict?.cron_secret_ok ? "green" : "red"}
            /></div>
            <div className="premium-card"><StatusCard
              label="AI Key"
              value={env?.ANTHROPIC_API_KEY?.set ? "ready" : "missing"}
              tone={env?.ANTHROPIC_API_KEY?.set ? "green" : "red"}
            /></div>
          </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 12 }}>
        {TOGGLES.map((toggle) => {
          const value = asBool(settings[toggle.key], true);
          return (
            <div
              key={toggle.key}
              className="premium-card"
              style={{
                background: G.bg2,
                border: `1px solid ${G.border}`,
                borderRadius: 12,
                padding: 16,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 800, color: G.t1, marginBottom: 4 }}>
                {toggle.label}
              </div>
              <div style={{ fontSize: 12, color: G.t3, marginBottom: 12 }}>{toggle.desc}</div>
              <button
                disabled={saving === toggle.key || loading}
                onClick={() => setFlag(toggle.key, !value)}
                className="premium-btn"
                style={{ padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 800, background: value ? `${G.green}22` : `${G.red}22`, color: value ? G.green : G.red }}
              >
                {saving === toggle.key ? "Saving..." : value ? "Enabled" : "Disabled"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusCard({ label, value, tone }) {
  const colors =
    tone === "green"
      ? { fg: "#30D158", bg: "rgba(48,209,88,0.13)" }
      : tone === "red"
        ? { fg: "#FF453A", bg: "rgba(255,69,58,0.13)" }
        : { fg: "#0A84FF", bg: "rgba(10,132,255,0.13)" };

  return (
    <div
      style={{
        background: "#0F0F14",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 12,
        padding: 14,
      }}
    >
      <div style={{ fontSize: 11, color: "#636366", marginBottom: 7, textTransform: "uppercase", fontWeight: 800 }}>
        {label}
      </div>
      <span
        style={{
          fontSize: 12,
          fontWeight: 800,
          borderRadius: 99,
          padding: "5px 10px",
          background: colors.bg,
          color: colors.fg,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {value}
      </span>
    </div>
  );
}
