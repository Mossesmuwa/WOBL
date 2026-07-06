import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" data-theme="dark">
      <Head>
        {/* 1. Fix for TMDB Image Blocking (OpaqueResponseBlocking) */}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <link
          rel="icon"
          href="/assets/novahub_favicon.svg"
          type="image/svg+xml"
        />
        <link rel="shortcut icon" href="/assets/novahub_favicon.svg" />
        <link rel="apple-touch-icon" href="/assets/novahub_favicon.svg" />

        {/* 2. Optimized Font Loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
          type="text/css"
        />

        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
          (function() {
            try {
              var t = localStorage.getItem('nh-theme');
              if (!t) t = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              requestAnimationFrame(function() {
                document.documentElement.setAttribute('data-theme', t);
              });
            } catch(e) {}
          })();
        `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
