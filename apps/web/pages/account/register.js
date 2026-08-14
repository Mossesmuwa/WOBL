// pages/account/register.js
// Wobl — Create account. Same visual system as login.js, with real
// client-side validation (password match, minimum length) before hitting
// the API — not just delegating everything to server error messages.

import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion } from "motion/react";
import { register } from "shared/lib/auth";
import { useToast } from "../../components/shared/Toast";
import { W, glassPanel } from "../../components/shared/wobl-theme";

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    if (password.length < 8) {
      setError("Password needs at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const result = await register(email.trim(), password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Couldn't create your account — try again.");
      return;
    }

    showToast("Welcome to Wobl");
    router.push("/movies");
  };

  return (
    <>
      <Head>
        <title>Create account — Wobl</title>
      </Head>

      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: `radial-gradient(ellipse at 30% 20%, #241a13 0%, ${W.bg} 65%)`,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            ...glassPanel,
            width: "min(400px, 100%)",
            borderRadius: W.radius,
            padding: "2rem",
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: W.displayFont,
              fontSize: 17,
              fontWeight: 600,
              color: W.cream,
              textDecoration: "none",
            }}
          >
            WOBL
          </Link>

          <h1
            style={{
              fontFamily: W.displayFont,
              fontSize: "1.6rem",
              color: W.cream,
              margin: "1.25rem 0 0.25rem",
            }}
          >
            Create your shelf
          </h1>
          <p
            style={{
              fontFamily: W.bodyFont,
              fontSize: 13,
              color: W.creamDim,
              marginBottom: "1.5rem",
            }}
          >
            Save titles, build your own collection.
          </p>

          <form onSubmit={handleSubmit}>
            <FormField
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
            />
            <FormField
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
            />
            <FormField
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
            />

            {error && (
              <div
                role="alert"
                style={{
                  fontFamily: W.bodyFont,
                  fontSize: 12,
                  color: "#E85A4A",
                  marginBottom: "1rem",
                }}
              >
                {error}
              </div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              style={{
                width: "100%",
                padding: "11px 0",
                borderRadius: 10,
                border: "none",
                background: loading
                  ? W.surface
                  : `linear-gradient(135deg, ${W.marquee}, ${W.amber})`,
                color: loading ? W.creamDim : "#0A0908",
                fontFamily: W.bodyFont,
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? "default" : "pointer",
              }}
            >
              {loading ? "Creating account…" : "Create account"}
            </motion.button>
          </form>

          <div
            style={{
              marginTop: "1.5rem",
              textAlign: "center",
              fontFamily: W.bodyFont,
              fontSize: 13,
              color: W.creamDim,
            }}
          >
            Already have an account?{" "}
            <Link
              href="/account/login"
              style={{ color: W.marquee, textDecoration: "none" }}
            >
              Sign in
            </Link>
          </div>
        </motion.div>
      </main>
    </>
  );
}

function FormField({ label, type, value, onChange, autoComplete }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
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
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
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
        }}
      />
    </div>
  );
}
