import Link from "next/link";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-glow auth-glow-blue" />
        <div className="auth-glow auth-glow-gold" />
      </div>

      <div className="auth-container">
        {/* Left Panel */}
        <section className="auth-brand">
          <Link href="/" className="brand-logo">
            <img src="/assets/novahub_logo.svg" alt="NovaHub" />
          </Link>

          <h1>
            Discover
            <br />
            what matters.
          </h1>

          <p>
            AI-powered intelligence for discovering the world's best apps, AI
            tools, games, movies, books and research.
          </p>

          <div className="brand-features">
            <div>✓ AI Recommendations</div>
            <div>✓ Unlimited Collections</div>
            <div>✓ Sync Everywhere</div>
            <div>✓ Completely Free</div>
          </div>
        </section>

        {/* Right Panel */}

        <section className="auth-panel">
          <div className="auth-card">
            <h2>{title}</h2>

            <p>{subtitle}</p>

            {children}
          </div>
        </section>
      </div>
    </div>
  );
}
