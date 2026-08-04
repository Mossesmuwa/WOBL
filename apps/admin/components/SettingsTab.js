// components/admin/SettingsTab.js
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

export default function SettingsTab({ notify }) {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*");

      if (error) throw error;

      const settingsObj = {};
      (data || []).forEach((s) => {
        settingsObj[s.key] = s.value;
      });
      setSettings(settingsObj);
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
    setLoading(false);
  }

  async function updateSetting(key, value) {
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from("system_settings").upsert({
        key,
        value,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setSettings((prev) => ({ ...prev, [key]: value }));
      notify?.("success", "Setting updated");
    } catch (err) {
      console.error("Failed to update setting:", err);
      notify?.("error", "Failed to update setting");
    }
    setSaving(false);
  }

  function ToggleSetting({ settingKey, label, description }) {
    const value =
      settings[settingKey] === "true" || settings[settingKey] === true;

    return (
      <div className="premium-card"
        style={{
          padding: 20,
          borderRadius: 12,
          border: `1px solid ${G.border}`,
          background: G.bg2,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
              {label}
            </div>
            <div style={{ fontSize: 12, color: G.t3 }}>{description}</div>
          </div>
          <button
            onClick={() => updateSetting(settingKey, !value)}
            disabled={saving}
            style={{
              width: 48,
              height: 28,
              borderRadius: 14,
              background: value ? G.green : G.bg3,
              border: `1px solid ${value ? G.green : G.border}`,
              position: "relative",
              cursor: saving ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "#fff",
                position: "absolute",
                top: 2,
                left: value ? 22 : 2,
                transition: "left 0.2s ease",
              }}
            />
          </button>
        </div>
      </div>
    );
  }

  function NumberSetting({ settingKey, label, description, min, max }) {
    const value = parseInt(settings[settingKey]) || 0;

    return (
      <div className="premium-card"
        style={{
          padding: 20,
          borderRadius: 12,
          border: `1px solid ${G.border}`,
          background: G.bg2,
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
            {label}
          </div>
          <div style={{ fontSize: 12, color: G.t3 }}>{description}</div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            onChange={(e) => updateSetting(settingKey, e.target.value)}
            disabled={saving}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 8,
              border: `1px solid ${G.border}`,
              background: G.bg3,
              color: G.t1,
              fontSize: 14,
              outline: "none",
            }}
          />
          <span style={{ color: G.t3, fontSize: 12 }}>
            (Min: {min}, Max: {max})
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6 }}>
          System Settings
        </h2>
        <p style={{ fontSize: 14, color: G.t2 }}>
          Configure global platform behavior
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: G.t3 }}>
          Loading settings...
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 800,
              marginTop: 16,
              marginBottom: 8,
            }}
          >
            Content Moderation
          </h3>

          <ToggleSetting
            settingKey="auto_approve_items"
            label="Auto-Approve New Items"
            description="Automatically approve new items without manual review (not recommended for production)"
          />

          <ToggleSetting
            settingKey="retry_failed_syncs"
            label="Auto-Retry Failed Syncs"
            description="Automatically retry provider sync jobs that fail"
          />

          <ToggleSetting
            settingKey="premium_admin_ui"
            label="Enable Premium Admin UI"
            description="Toggle the premium gold-themed admin dashboard and additional controls for admins."
          />

          <h3
            style={{
              fontSize: 16,
              fontWeight: 800,
              marginTop: 24,
              marginBottom: 8,
            }}
          >
            Performance & Limits
          </h3>

          <NumberSetting
            settingKey="items_per_page"
            label="Items Per Page"
            description="Default number of items to show per page"
            min={10}
            max={100}
          />

          <NumberSetting
            settingKey="max_items_per_provider"
            label="Max Items Per Provider Run"
            description="Maximum number of items each provider should sync per run"
            min={10}
            max={200}
          />

          <NumberSetting
            settingKey="min_quality_score"
            label="Minimum Quality Score"
            description="Minimum quality score (0-100) required to show items publicly"
            min={0}
            max={100}
          />

          <h3
            style={{
              fontSize: 16,
              fontWeight: 800,
              marginTop: 24,
              marginBottom: 8,
            }}
          >
            Algorithm
          </h3>

          <div
            style={{
              padding: 20,
              borderRadius: 12,
              border: `1px solid ${G.border}`,
              background: G.bg2,
            }}
          >
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                Trending Algorithm
              </div>
              <div style={{ fontSize: 12, color: G.t3 }}>
                Choose which algorithm to use for trending calculations
              </div>
            </div>
            <select
              value={settings.trending_algorithm || "nova_score"}
              onChange={(e) =>
                updateSetting("trending_algorithm", e.target.value)
              }
              disabled={saving}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 8,
                border: `1px solid ${G.border}`,
                background: G.bg3,
                color: G.t1,
                fontSize: 14,
                outline: "none",
              }}
            >
              <option value="nova_score">Nova Score (Recommended)</option>
              <option value="simple">Simple (View count only)</option>
              <option value="hybrid">Hybrid (Nova Score + Views)</option>
            </select>
          </div>

          <div
            style={{
              marginTop: 32,
              padding: 20,
              borderRadius: 12,
              border: `1px solid ${G.orange}40`,
              background: G.orange + "10",
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: G.orange,
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              ⚠️ Advanced Settings
            </div>
            <div style={{ fontSize: 12, color: G.t2 }}>
              Changes to these settings affect platform-wide behavior. Test
              thoroughly before deploying to production.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
