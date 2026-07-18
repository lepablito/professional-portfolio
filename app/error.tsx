"use client";

// Client-side error boundary: a safety net for runtime failures in client
// components (theme toggle, scroll reveals). Static export has no server
// errors to catch — this only ever renders in the browser.
export default function ErrorBoundary({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="hero wrap">
      <p className="eyebrow">
        <span className="eyebrow-mark" aria-hidden="true">
          §
        </span>
        Error
      </p>
      <h1 className="display page-title">Something went wrong.</h1>
      <p className="lede hero-tagline">The page hit an unexpected error while rendering.</p>
      <div className="cta-actions">
        <button type="button" className="btn btn-primary" onClick={reset}>
          Try again
        </button>
        {/* Deliberate <a> instead of <Link>: a full page load escapes
            whatever broken client state triggered this boundary. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a className="btn" href="/">
          Back to home
        </a>
      </div>
    </section>
  );
}
