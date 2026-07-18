import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { site } from "@/lib/site";
import "./globals.css";

// Deliberate trade-off: Fraunces ships as a variable font with the full
// weight range plus the optical-size axis (~67 KB woff2). The opsz axis is
// what gives headlines their display cut — the core of the site's visual
// identity — and next/font only allows extra axes with weight: "variable".
// Accepted after a performance audit flagged it (LCP remains ~100 ms).
const display = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  axes: ["opsz"],
});

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Applied AI Engineer`,
    template: `%s — ${site.name}`,
  },
  description: site.tagline,
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title: `${site.name} — Applied AI Engineer`,
    description: site.tagline,
    locale: "en_US",
    // TODO: add a 1200×630 image at public/og.png and uncomment:
    // images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary",
    title: `${site.name} — Applied AI Engineer`,
    description: site.tagline,
  },
};

// Runs before first paint: applies the saved (or system) theme so there is
// no flash, and tags <html> with "js" so scroll reveals only hide content
// when JavaScript is actually available.
const themeScript = `(function(){try{var d=document.documentElement;d.classList.add("js");var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}d.dataset.theme=t}catch(e){}})()`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <head>
        {/* GitHub Pages can't set HTTP headers; a meta CSP is the only
            option. 'unsafe-inline' for scripts is required by Next's own
            inline flight/bootstrap scripts and the theme script below. */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
