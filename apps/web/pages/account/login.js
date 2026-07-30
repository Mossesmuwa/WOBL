// pages/account/login.js
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { colors } from "shared/lib/design";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      router.push("/account/dashboard");
    } catch (err) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    setLoading(true);
    try {
      window.location.href = `/api/auth/oauth/${provider}`;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign In | Intelligence Platform</title>
        <meta name="description" content="Sign in to your account" />
      </Head>

      <Navbar />

      <div
        style={{
          background: colors.bg || "#0b0f17",
          minHeight: "calc(100vh - 200px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          position: "relative",
          overflow: "hidden",
          fontFamily: "sans-serif",
        }}
      >
        {/* Glow ambient background effect */}
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: colors.gold
              ? `${colors.gold}15`
              : "rgba(245, 158, 11, 0.1)",
            filter: "blur(120px)",
            pointerEvents: "none",
          }}
        />

        {/* Card Container */}
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            padding: 36,
            background: colors.bg2 || "#131924",
            borderRadius: 20,
            border: `1px solid ${colors.bg3 || "rgba(255,255,255,0.1)"}`,
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            backdropFilter: "blur(12px)",
            zIndex: 1,
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: colors.t1 || "#fff",
                margin: 0,
                marginBottom: 6,
                letterSpacing: "-0.02em",
              }}
            >
              Welcome Back
            </h1>
            <p
              style={{
                fontSize: 14,
                color: colors.t3 || "#94a3b8",
                margin: 0,
              }}
            >
              Sign in to your account to save and compare
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                padding: "12px 16px",
                background: colors.red
                  ? `${colors.red}15`
                  : "rgba(239, 68, 68, 0.1)",
                border: `1px solid ${colors.red ? `${colors.red}40` : "rgba(239, 68, 68, 0.3)"}`,
                borderRadius: 10,
                color: colors.red || "#f87171",
                fontSize: 13,
                fontWeight: 600,
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              {error}
            </div>
          )}

          {/* OAuth Buttons */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
              marginBottom: 24,
            }}
          >
            {[
              {
                name: "Google",
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                ),
              },
              {
                name: "GitHub",
                icon: (
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                ),
              },
              {
                name: "Apple",
                icon: (
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.09c.68-.82 1.13-1.96.99-3.09-1 .04-2.2.67-2.9 1.48-.62.72-1.16 1.88-1.02 3 1.12.09 2.25-.57 2.93-1.39z" />
                  </svg>
                ),
              },
            ].map((provider) => (
              <button
                key={provider.name}
                type="button"
                onClick={() => handleOAuthLogin(provider.name.toLowerCase())}
                disabled={loading}
                style={{
                  padding: "10px 8px",
                  background: colors.bg || "#0b0f17",
                  border: `1px solid ${colors.bg3 || "rgba(255,255,255,0.1)"}`,
                  borderRadius: 10,
                  color: colors.t1 || "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  transition: "all 0.2s ease",
                  opacity: loading ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading)
                    e.currentTarget.style.borderColor =
                      colors.gold || "#f59e0b";
                }}
                onMouseLeave={(e) => {
                  if (!loading)
                    e.currentTarget.style.borderColor =
                      colors.bg3 || "rgba(255,255,255,0.1)";
                }}
              >
                {provider.icon}
                {provider.name}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                flex: 1,
                height: "1px",
                background: colors.bg3 || "rgba(255,255,255,0.1)",
              }}
            />
            <span
              style={{
                fontSize: 11,
                color: colors.t3 || "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              OR
            </span>
            <div
              style={{
                flex: 1,
                height: "1px",
                background: colors.bg3 || "rgba(255,255,255,0.1)",
              }}
            />
          </div>

          {/* Email/Password Form */}
          <form
            onSubmit={handleEmailLogin}
            style={{ display: "grid", gap: 16 }}
          >
            <div>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  color: colors.t2 || "#cbd5e1",
                  marginBottom: 6,
                }}
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: `1px solid ${colors.bg3 || "rgba(255,255,255,0.1)"}`,
                  background: colors.bg || "#0b0f17",
                  color: colors.t1 || "#fff",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "all 0.2s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.gold || "#f59e0b";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor =
                    colors.bg3 || "rgba(255,255,255,0.1)";
                }}
              />
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <label
                  htmlFor="password"
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: colors.t2 || "#cbd5e1",
                  }}
                >
                  Password
                </label>
                <Link href="/account/forgot-password" passHref legacyBehavior>
                  <a
                    style={{
                      fontSize: 11,
                      color: colors.gold || "#f59e0b",
                      textDecoration: "none",
                    }}
                  >
                    Forgot password?
                  </a>
                </Link>
              </div>

              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    paddingRight: 45,
                    borderRadius: 10,
                    border: `1px solid ${colors.bg3 || "rgba(255,255,255,0.1)"}`,
                    background: colors.bg || "#0b0f17",
                    color: colors.t1 || "#fff",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "all 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      colors.gold || "#f59e0b";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      colors.bg3 || "rgba(255,255,255,0.1)";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: colors.t3 || "#94a3b8",
                    fontSize: 11,
                    cursor: "pointer",
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                background: colors.gold || "#f59e0b",
                color: "#000",
                border: "none",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                marginTop: 8,
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading)
                  e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Sign up Link */}
          <div
            style={{
              textAlign: "center",
              marginTop: 24,
              fontSize: 13,
              color: colors.t3 || "#94a3b8",
            }}
          >
            Don't have an account?{" "}
            <Link href="/account/signup" passHref legacyBehavior>
              <a
                style={{
                  color: colors.gold || "#f59e0b",
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                Sign up
              </a>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
