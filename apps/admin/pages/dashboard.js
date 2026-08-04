// apps/admin/pages/dashboard.js - Main Admin Dashboard
// ======================================================
// PROTECTED: Admin-only page with full auth checks
// ======================================================

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "shared/lib/supabase";
import { checkAuth } from "shared/lib/checkAuth";
import Head from "next/head";
import OverviewTab from "../components/OverviewTab";
import PipelineTab from "../components/PipelineTab";
import IntelligenceTab from "../components/IntelligenceTab";
import SecurityTab from "../components/SecurityTab";
import BusinessTab from "../components/BusinessTab";
import SettingsTab from "../components/SettingsTab";
import UsersTab from "../components/UsersTab";
import ControlCenterTab from "../components/ControlCenterTab";
import NotificationsTab from "../components/NotificationsTab";

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

const Icon = {
  shield: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  database: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  brain: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.14Z" />
    </svg>
  ),
  users: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  refresh: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  settings: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6m5.66-12.66L15 9m-6 6-2.66 2.66M23 12h-6m-6 0H1m17.66 5.66L15 15m-6-6-2.66-2.66" />
    </svg>
  ),
};

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [premiumEnabled, setPremiumEnabled] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: "",
    message: "",
    confirmLabel: "Confirm",
    tone: "default",
    onConfirm: null,
  });

  // --------------------------------------------------
  // CHECK AUTH ON MOUNT
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
    // fetch premium setting when admin signs in
    fetchPremiumSetting();
    setLoading(false);
  }

  async function fetchPremiumSetting() {
    try {
      const { data } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "premium_admin_ui")
        .single();
      if (data) setPremiumEnabled(data.value === "true" || data.value === true);
    } catch (err) {
      console.error("Failed to fetch premium setting:", err);
    }
  }

  function notify(type, message) {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }

  function openConfirm({
    title,
    message,
    confirmLabel = "Confirm",
    tone = "default",
    onConfirm,
  }) {
    setConfirmState({
      open: true,
      title,
      message,
      confirmLabel,
      tone,
      onConfirm,
    });
  }

  function closeConfirm() {
    setConfirmState((prev) => ({ ...prev, open: false, onConfirm: null }));
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: G.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: G.t2,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
            Loading Admin Dashboard...
          </div>
          <div style={{ fontSize: 12, color: G.t3 }}>Verifying permissions</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - Nova</title>
      </Head>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
        html, body { font-family: 'Syne', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background: ${G.bg}; color: ${G.t1}; }
        .premium-header { background: linear-gradient(90deg, ${G.goldL}10, transparent); border-bottom: 1px solid ${G.borderG}; box-shadow: 0 6px 30px rgba(0,0,0,0.5); }
        .premium-logo { display:flex; align-items:center; gap:8px; text-decoration:none }
        .premium-logo .mark { width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:900;background:linear-gradient(135deg, ${G.goldL}, ${G.gold}); color:#09090C }
        .premium-badge { padding:8px 10px;border-radius:10px;background:linear-gradient(135deg, ${G.goldL}, ${G.gold});color:#09090C;font-weight:800 }
        .premium-tabs button { padding:12px 16px;border-radius:10px;border:none;background:transparent;color:${G.t2};font-weight:800;cursor:pointer }
        .premium-tabs button.active { color:${G.gold}; box-shadow: 0 6px 18px rgba(201,168,76,0.12); }
        .premium-btn { background: linear-gradient(135deg, ${G.goldL}, ${G.gold}); color:#09090C; border:none; padding:10px 16px; border-radius:12px; font-weight:900; cursor:pointer }
        .premium-card { background: linear-gradient(180deg, ${G.bg2}, ${G.bg3}); border:1px solid ${G.borderG}; border-radius:14px; padding:18px }
      `}</style>

      <div style={{ minHeight: "100vh", background: G.bg }}>
        {/* Header */}
        <div className="premium-header"
          style={{
            padding: "18px 24px",
            background: G.bg2,
          }}
        >
          <div
            style={{
              maxWidth: 1600,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <a className="premium-logo" href="/">
                <div className="mark">◆</div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: G.gold }}>{'Nova Intelligence'}</div>
                  <div style={{ fontSize: 12, color: G.t3 }}>Welcome back, {user?.display_name || "Admin"}</div>
                </div>
              </a>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div className="premium-badge">{user?.admin_role || "ADMIN"}</div>
            </div>
          </div>
        </div>

        {premiumEnabled && (
          <div
            style={{
              maxWidth: 1600,
              margin: "12px auto",
              padding: "12px 24px",
              borderRadius: 12,
              border: `1px solid ${G.borderG}`,
              background: G.gold + "12",
              color: G.gold,
            }}
          >
            <strong style={{ fontWeight: 900 }}>Premium Admin Enabled</strong>
            <span style={{ marginLeft: 8, color: G.t2 }}>
              You are using the premium gold-themed dashboard with expanded
              controls.
            </span>
          </div>
        )}

        {/* Tabs */}
        <div style={{ borderBottom: `1px solid ${G.border}`, background: G.bg, position: "sticky", top: 0, zIndex: 100 }}>
          <div className="premium-tabs" style={{ maxWidth:1600, margin: '0 auto', padding: '0 24px', display: 'flex', gap:8, overflowX:'auto' }}>
            {[
              { id: "overview", label: "Overview", icon: Icon.database },
              { id: "pipeline", label: "Pipeline", icon: Icon.refresh },
              { id: "control", label: "Control", icon: Icon.settings },
              { id: "notifications", label: "Notifications", icon: Icon.database },
              { id: "intelligence", label: "Intelligence", icon: Icon.brain },
              { id: "users", label: "Users", icon: Icon.users },
              { id: "security", label: "Security", icon: Icon.shield },
              { id: "business", label: "Business", icon: Icon.users },
              { id: "settings", label: "Settings", icon: Icon.settings },
            ].map((t) => {
              const IconComp = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={tab===t.id? 'active': ''}
                >
                  <IconComp /> {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 1600, margin: "0 auto", padding: "24px" }}>
          {tab === "overview" && (
            <OverviewTab notify={notify} confirmAction={openConfirm} />
          )}
          {tab === "pipeline" && (
            <PipelineTab notify={notify} confirmAction={openConfirm} />
          )}
          {tab === "control" && <ControlCenterTab notify={notify} />}
          {tab === "notifications" && <NotificationsTab />}
          {tab === "intelligence" && (
            <IntelligenceTab notify={notify} confirmAction={openConfirm} />
          )}
          {tab === "users" && (
            <UsersTab notify={notify} confirmAction={openConfirm} />
          )}
          {tab === "security" && <SecurityTab />}
          {tab === "business" && (
            <BusinessTab notify={notify} confirmAction={openConfirm} />
          )}
          {tab === "settings" && <SettingsTab notify={notify} />}
        </div>
      </div>

      {/* Toasts */}
      <div
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          zIndex: 2000,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          maxWidth: 360,
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: `1px solid ${
                toast.type === "success"
                  ? `${G.green}66`
                  : toast.type === "error"
                    ? `${G.red}66`
                    : `${G.borderG}`
              }`,
              background:
                toast.type === "success"
                  ? `${G.green}1A`
                  : toast.type === "error"
                    ? `${G.red}1A`
                    : G.bg3,
              color:
                toast.type === "success"
                  ? G.green
                  : toast.type === "error"
                    ? G.red
                    : G.t1,
              fontSize: 12,
              fontWeight: 700,
              boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
              animation: "fadeIn 0.2s ease",
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* Confirm Modal */}
      {confirmState.open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2100,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 460,
              borderRadius: 14,
              border: `1px solid ${G.border}`,
              background: G.bg2,
              padding: 20,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>
              {confirmState.title}
            </div>
            <p style={{ fontSize: 13, color: G.t2, lineHeight: 1.6 }}>
              {confirmState.message}
            </p>
            <div
              style={{
                marginTop: 18,
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <button
                onClick={closeConfirm}
                style={{
                  padding: "9px 14px",
                  borderRadius: 8,
                  border: `1px solid ${G.border}`,
                  background: "transparent",
                  color: G.t2,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const fn = confirmState.onConfirm;
                  closeConfirm();
                  if (fn) await fn();
                }}
                style={{
                  padding: "9px 14px",
                  borderRadius: 8,
                  border: "none",
                  background:
                    confirmState.tone === "danger"
                      ? G.red
                      : `linear-gradient(135deg, ${G.goldL}, ${G.gold})`,
                  color: confirmState.tone === "danger" ? "#fff" : "#000",
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {confirmState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
