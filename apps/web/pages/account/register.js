// pages/account/register.js
import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { login, register, loginWithGoogle } from "shared/lib/auth";
import { useToast } from "../../components/shared/Toast";
import { W } from "../../components/shared/wobl-theme";

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Calculate password strength rating (0 to 4)
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return score;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strengthScore = getPasswordStrength(password);
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["#E85A4A", "#E8A84A", "#D9713C", "#4AE895"];

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

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    if (result?.error) {
      setError(result.error);
      setGoogleLoading(false);
    }
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
          backgroundColor: W.bg || "#0A0908",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Kinetic Background Glow Orbs */}
        <motion.div
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 40, -20, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "15%",
            right: "25%",
            width: "420px",
            height: "420px",
            background: `radial-gradient(circle, ${W.marquee || "#D9713C"} 0%, transparent 70%)`,
            opacity: 0.12,
            filter: "blur(90px)",
            pointerEvents: "none",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "relative",
            width: "min(420px, 100%)",
            borderRadius: 24,
            padding: "3rem 2.5rem",
            background: "rgba(15, 14, 13, 0.65)",
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow:
              "0 30px 60px -12px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
            zIndex: 1,
          }}
        >
          {/* Logo Brand Mark */}
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
            }}
          >
            <Image
              src="/favicon.svg"
              alt="Wobl Logo"
              width={30}
              height={30}
              priority
            />
            <span
              style={{
                fontFamily: W.displayFont,
                fontSize: 19,
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: W.cream,
              }}
            >
              WOBL
            </span>
          </Link>

          <h1
            style={{
              fontFamily: W.displayFont,
              fontSize: "1.85rem",
              color: W.cream,
              margin: "1.75rem 0 0.4rem",
              fontWeight: 500,
            }}
          >
            Create your shelf
          </h1>
          <p
            style={{
              fontFamily: W.bodyFont,
              fontSize: 14,
              color: "rgba(255,255,255,0.5)",
              marginBottom: "2rem",
              lineHeight: 1.5,
            }}
          >
            Save titles, build your collection, and skip algorithm noise.
          </p>

          {/* Google Auth Button */}
          <motion.button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            whileHover={{
              scale: 1.01,
              backgroundColor: "rgba(255,255,255,0.08)",
            }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 12,
              border: "1px solid rgba(255, 255, 255, 0.12)",
              background: "rgba(255, 255, 255, 0.04)",
              color: W.cream,
              fontFamily: W.bodyFont,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              marginBottom: "1.5rem",
              transition: "all 0.2s ease",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
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
            {googleLoading ? "Connecting..." : "Sign up with Google"}
          </motion.button>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              margin: "1.5rem 0",
              gap: 12,
            }}
          >
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "rgba(255,255,255,0.08)",
              }}
            />
            <span
              style={{
                fontFamily: W.monoFont,
                fontSize: 10,
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.3)",
              }}
            >
              OR
            </span>
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "rgba(255,255,255,0.08)",
              }}
            />
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label
                style={{
                  display: "block",
                  fontFamily: W.monoFont,
                  fontSize: 11,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: 8,
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  background: "rgba(255, 255, 255, 0.02)",
                  color: W.cream,
                  fontFamily: W.bodyFont,
                  fontSize: 15,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Password Field with View Toggle */}
            <div style={{ marginBottom: "0.75rem" }}>
              <label
                style={{
                  display: "block",
                  fontFamily: W.monoFont,
                  fontSize: 11,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: 8,
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  style={{
                    width: "100%",
                    padding: "14px 44px 14px 16px",
                    borderRadius: 12,
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    background: "rgba(255, 255, 255, 0.02)",
                    color: W.cream,
                    fontFamily: W.bodyFont,
                    fontSize: 15,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.4)",
                    cursor: "pointer",
                    padding: 0,
                    fontFamily: W.bodyFont,
                    fontSize: 12,
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Password Strength Meter */}
            {password.length > 0 && (
              <div style={{ marginBottom: "1.25rem" }}>
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    height: 4,
                    marginBottom: 6,
                  }}
                >
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      style={{
                        flex: 1,
                        borderRadius: 2,
                        background:
                          strengthScore >= step
                            ? strengthColors[strengthScore - 1]
                            : "rgba(255,255,255,0.1)",
                        transition: "background 0.3s ease",
                      }}
                    />
                  ))}
                </div>
                <span
                  style={{
                    fontFamily: W.monoFont,
                    fontSize: 10,
                    color:
                      strengthColors[strengthScore - 1] ||
                      "rgba(255,255,255,0.4)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Strength: {strengthLabels[strengthScore - 1] || "Weak"}
                </span>
              </div>
            )}

            {/* Confirm Password Field with View Toggle */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  fontFamily: W.monoFont,
                  fontSize: 11,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: 8,
                }}
              >
                Confirm Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  style={{
                    width: "100%",
                    padding: "14px 44px 14px 16px",
                    borderRadius: 12,
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    background: "rgba(255, 255, 255, 0.02)",
                    color: W.cream,
                    fontFamily: W.bodyFont,
                    fontSize: 15,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.4)",
                    cursor: "pointer",
                    padding: 0,
                    fontFamily: W.bodyFont,
                    fontSize: 12,
                  }}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  role="alert"
                  style={{
                    fontFamily: W.bodyFont,
                    fontSize: 13,
                    color: "#FF6B6B",
                    marginBottom: "1.25rem",
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: "rgba(255, 107, 107, 0.1)",
                    border: "1px solid rgba(255, 107, 107, 0.2)",
                  }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              style={{
                width: "100%",
                padding: "14px 0",
                borderRadius: 12,
                border: "none",
                background: `linear-gradient(135deg, ${W.marquee}, ${W.amber})`,
                color: "#0A0908",
                fontFamily: W.bodyFont,
                fontSize: 15,
                fontWeight: 600,
                cursor: loading ? "default" : "pointer",
                boxShadow: `0 8px 24px -6px rgba(217, 113, 60, 0.4)`,
              }}
            >
              {loading ? "Creating account..." : "Create account"}
            </motion.button>
          </form>

          <div
            style={{
              marginTop: "2rem",
              textAlign: "center",
              fontFamily: W.bodyFont,
              fontSize: 14,
              color: "rgba(255,255,255,0.4)",
            }}
          >
            Already have an account?{" "}
            <Link
              href="/account/login"
              style={{
                color: W.cream,
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Sign in
            </Link>
          </div>
        </motion.div>
      </main>
    </>
  );
}
