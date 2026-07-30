import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import SEO from "../../components/SEO";
import * as Auth from "shared/lib/auth";
import { getCurrentUser } from "shared/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-redirect if already logged in
  useEffect(() => {
    getCurrentUser().then((u) => {
      if (u) router.replace("/account/dashboard");
    });
  }, [router]);

  async function doRegister(e) {
    if (e) e.preventDefault();
    setErr("");
    setOk("");

    if (!name.trim()) {
      setErr("Please enter your name.");
      return;
    }
    if (!email.trim()) {
      setErr("Please enter your email.");
      return;
    }
    if (password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const result = await Auth.register(email, password, name);
    setLoading(false);

    if (!result?.success) {
      setErr(result?.error || "Registration failed. Please try again.");
      return;
    }

    setOk("Account created! Check your email to verify it, then sign in →");
  }

  return (
    <>
      <SEO title="Create Account — NovaHub" />

      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-100 relative overflow-hidden font-sans py-12 px-4">
        {/* Background Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-2xl overflow-hidden z-10"
        >
          {/* LEFT PANEL: Brand Perks (45%) */}
          <div className="lg:col-span-5 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between bg-gradient-to-br from-white/5 to-transparent">
            <div>
              <Link
                href="/"
                className="flex items-center gap-3 mb-12 group w-fit"
              >
                <img
                  src="/assets/novahub_logo.svg"
                  alt="NovaHub"
                  className="h-7 w-auto transition-transform group-hover:scale-105"
                />
              </Link>

              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight mb-3">
                Create account
              </h1>
              <p className="text-slate-400 text-sm mb-8">
                Free forever. No credit card required.
              </p>

              {/* Perks List */}
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-xs">
                  <div className="w-5 h-5 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    ♥
                  </div>
                  <div>
                    <strong className="block text-slate-200 font-semibold text-sm">
                      Unlimited Saves
                    </strong>
                    <span className="text-slate-400">
                      Save as many items as you want
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <div className="w-5 h-5 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    ★
                  </div>
                  <div>
                    <strong className="block text-slate-200 font-semibold text-sm">
                      AI Recs
                    </strong>
                    <span className="text-slate-400">
                      Personalised to your taste
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <div className="w-5 h-5 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    ⊞
                  </div>
                  <div>
                    <strong className="block text-slate-200 font-semibold text-sm">
                      Lists
                    </strong>
                    <span className="text-slate-400">
                      Create and share custom lists
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <div className="w-5 h-5 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    ↻
                  </div>
                  <div>
                    <strong className="block text-slate-200 font-semibold text-sm">
                      Sync
                    </strong>
                    <span className="text-slate-400">Any device, anytime</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Form (55%) */}
          <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {!ok ? (
                <motion.div
                  key="signup-form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  {/* OAuth Buttons */}
                  <div className="grid grid-cols-3 gap-2.5 mb-6">
                    <button
                      type="button"
                      onClick={() => Auth.loginWithGoogle()}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium text-slate-200"
                    >
                      Google
                    </button>
                    <button
                      type="button"
                      onClick={() => Auth.loginWithGithub()}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium text-slate-200"
                    >
                      GitHub
                    </button>
                    <button
                      type="button"
                      onClick={() => Auth.loginWithApple()}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium text-slate-200"
                    >
                      Apple
                    </button>
                  </div>

                  <div className="relative flex items-center justify-center mb-6">
                    <div className="border-t border-white/10 w-full" />
                    <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider absolute">
                      or create with email
                    </span>
                  </div>

                  {err && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                      {err}
                    </div>
                  )}

                  <form onSubmit={doRegister} className="space-y-4">
                    <div>
                      <label
                        className="block text-xs font-medium text-slate-300 mb-1.5"
                        htmlFor="name"
                      >
                        Your name
                      </label>
                      <input
                        id="name"
                        type="text"
                        placeholder="Moses"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-950/60 border border-white/10 focus:border-amber-400/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-xs font-medium text-slate-300 mb-1.5"
                        htmlFor="email"
                      >
                        Email address
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950/60 border border-white/10 focus:border-amber-400/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-xs font-medium text-slate-300 mb-1.5"
                        htmlFor="password"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="At least 8 characters"
                          autoComplete="new-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-slate-950/60 border border-white/10 focus:border-amber-400/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all duration-200 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-semibold text-sm hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-40 disabled:pointer-events-none shadow-lg shadow-amber-500/10 mt-6"
                    >
                      {loading ? "Creating account…" : "Create Free Account"}
                    </button>
                  </form>

                  <p className="text-center text-xs text-slate-500 mt-4 leading-relaxed">
                    By signing up you agree to our{" "}
                    <Link
                      href="/privacy"
                      className="text-amber-400 hover:underline"
                    >
                      Privacy Policy
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/terms"
                      className="text-amber-400 hover:underline"
                    >
                      Terms
                    </Link>
                    .
                  </p>

                  <div className="mt-6 text-center text-xs text-slate-400">
                    Already have an account?{" "}
                    <Link
                      href="/account/login"
                      className="text-amber-400 hover:underline font-medium"
                    >
                      Sign in
                    </Link>
                  </div>
                </motion.div>
              ) : (
                /* SUCCESS STATE */
                <motion.div
                  key="success-screen"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl">
                    ✉️
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Check your email
                  </h2>
                  <p className="text-slate-300 text-sm max-w-sm mx-auto mb-6 leading-relaxed">
                    {ok}
                  </p>
                  <Link
                    href="/account/login"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-amber-400 text-slate-950 font-semibold text-sm hover:brightness-110 transition-all shadow-lg shadow-amber-500/10"
                  >
                    Proceed to Sign In →
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  );
}
