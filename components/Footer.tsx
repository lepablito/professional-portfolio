import { asset, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap site-footer-inner">
        <p className="mono">
          © {new Date().getFullYear()} {site.name} · Valladolid, Spain
        </p>
        <div className="footer-links">
          <a className="link-ext" href={site.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a className="link-ext" href={site.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a className="link-more" href={`mailto:${site.email}`}>
            Email
          </a>
          <a className="link-more" href={asset(site.cvPath)} download>
            CV (PDF)
          </a>
        </div>
      </div>
    </footer>
  );
}
