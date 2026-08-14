// pages/account/settings.js
// Wobl — account settings. Update display name, sign out. Redirects to
// login if not authenticated rather than showing a broken/empty page.

import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSupabase } from "shared/lib/SupabaseContext";
import { logout } from "shared/lib/auth";
import { supabase } from "shared/lib/supabase";
import { useToast } from "../../components/shared/Toast";
import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";
import { W, glassPanel } from "../../components/shared/wobl-theme";

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, loading } = useSupabase();
  const { showToast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/account/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (profile?.display_name) setDisplayName(profile.display_name);
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!supabase || !user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() })
      .eq("id", user.id);
    setSaving(false);
    showToast(error ? "Couldn't save changes" : "Changes saved");
  };

  const handleSignOut = async () => {
    await logout();
    router.push("/");
  };

  if (loading || !user) {
    return (
      <>
        <Navbar />
        <main style={{ background: W.bg, minHeight: "70vh" }} />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Account settings — Wobl</title>
      </Head>

      <Navbar />

      <main
        style={{ background: W.bg, minHeight: "70vh", padding: "3rem 2rem" }}
      >
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div
            style={{
              fontFamily: W.monoFont,
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: W.marquee,
              marginBottom: 6,
            }}
          >
            Account
          </div>
          <h1
            style={{
              fontFamily: W.displayFont,
              fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
              color: W.cream,
              margin: "0 0 2rem",
            }}
          >
            Settings
          </h1>

          <div
            style={{
              ...glassPanel,
              borderRadius: W.radius,
              padding: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <form onSubmit={handleSave}>
              <label
                style={{
                  display: "block",
                  fontFamily: W.monoFont,
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: W.creamDim,
                  marginBottom: 6,
                }}
              >
                Display name
              </label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: `0.5px solid ${W.surfaceBorder}`,
                  background: "rgba(255,255,255,0.04)",
                  color: W.cream,
                  fontFamily: W.bodyFont,
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                  marginBottom: 12,
                }}
              />
              <div
                style={{
                  fontFamily: W.monoFont,
                  fontSize: 11,
                  color: W.creamFaint,
                  marginBottom: 16,
                }}
              >
                {user.email}
              </div>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: "9px 18px",
                  borderRadius: 8,
                  border: "none",
                  background: saving ? W.surface : W.marquee,
                  color: saving ? W.creamDim : "#0A0908",
                  fontFamily: W.bodyFont,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: saving ? "default" : "pointer",
                }}
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </form>
          </div>

          <button
            onClick={handleSignOut}
            style={{
              background: "none",
              border: "none",
              fontFamily: W.bodyFont,
              fontSize: 13,
              color: "#E85A4A",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Sign out
          </button>
        </div>
      </main>

      <Footer />
    </>
  );
}
