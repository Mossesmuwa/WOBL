// components/Footer.js
// Premium responsive footer with links, social, and newsletter
import Link from "next/link";
import { colors } from "shared/lib/design";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { label: "Discover", href: "/discover" },
      { label: "Compare", href: "/compare" },
      { label: "Trending", href: "/trending" },
      { label: "Pro", href: "/pro" },
    ],
    Company: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
    Resources: [
      { label: "API Docs", href: "/api" },
      { label: "FAQ", href: "/faq" },
      { label: "Status", href: "/status" },
      { label: "Changelog", href: "/changelog" },
    ],
    Legal: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Security", href: "/security" },
    ],
  };

  const socials = [
    { name: "Twitter", icon: "𝕏", href: "https://twitter.com" },
    { name: "LinkedIn", icon: "💼", href: "https://linkedin.com" },
    { name: "GitHub", icon: "🐙", href: "https://github.com" },
    { name: "Discord", icon: "💬", href: "https://discord.com" },
  ];

  return (
    <footer
      style={{
        background: colors.bg2,
        borderTop: `1px solid ${colors.bg3}`,
        padding: "60px 24px 24px",
        color: colors.t3,
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Main footer content */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 40,
            marginBottom: 60,
          }}
        >
          {/* Brand section */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <img
                src="/assets/novahub_logo.svg"
                alt="NovaHub"
                style={{ height: 34, width: "auto" }}
              />
            </div>
            <p
              style={{
                fontSize: 13,
                color: colors.t2,
                margin: 0,
                marginBottom: 16,
                lineHeight: 1.6,
              }}
            >
              Decision intelligence for fast-moving tech markets.
            </p>
            {/* Social links */}
            <div
              style={{
                display: "flex",
                gap: 12,
              }}
            >
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.name}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: colors.bg3,
                    border: `1px solid ${colors.bg4}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: colors.t2,
                    fontSize: 16,
                    textDecoration: "none",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.gold;
                    e.currentTarget.style.color = "#000";
                    e.currentTarget.style.borderColor = colors.gold;
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = colors.bg3;
                    e.currentTarget.style.color = colors.t2;
                    e.currentTarget.style.borderColor = colors.bg4;
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  color: colors.t1,
                  margin: 0,
                  marginBottom: 16,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {category}
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {links.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <a
                      style={{
                        color: colors.t3,
                        textDecoration: "none",
                        fontSize: 13,
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = colors.gold;
                        e.currentTarget.style.transform = "translateX(4px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = colors.t3;
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                    >
                      {link.label}
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div
          style={{
            borderTop: `1px solid ${colors.bg3}`,
            paddingTop: 24,
            marginBottom: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Bottom content */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
              fontSize: 12,
              color: colors.t3,
            }}
          >
            <div>© {currentYear} NovaHub. All rights reserved.</div>

            {/* Status indicator */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: colors.green,
                  animation: "pulse 2s infinite",
                }}
              />
              <span>All systems operational</span>
            </div>

            {/* Made with love */}
            <div>
              Made with <span style={{ color: colors.red }}>♥</span> for makers
            </div>
          </div>
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </footer>
  );
}
