import Link from "next/link";

export default function NotFound() {
  return (
    <section className="hero wrap">
      <p className="eyebrow">
        <span className="eyebrow-mark">§ 404</span>Not found
      </p>
      <h1 className="display hero-title article-title">This page doesn&apos;t exist.</h1>
      <p className="lede hero-tagline">
        The link may be old, or the page may have moved.
      </p>
      <div className="cta-actions">
        <Link className="btn btn-primary" href="/">
          Back to home
        </Link>
        <Link className="btn" href="/projects">
          Browse projects
        </Link>
      </div>
    </section>
  );
}
