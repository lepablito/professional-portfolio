import { asset, site } from "@/lib/site";
import { ExternalLink } from "./ExternalLink";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap site-footer-inner">
        <p className="mono">
          © {new Date().getFullYear()} {site.name} · Valladolid, Spain
        </p>
        <div className="footer-links">
          <a className="link-more" href={`mailto:${site.email}`}>
            Email
          </a>
          <a className="link-more" href={asset(site.cvPath)} download>
            CV (PDF)
          </a>
          <ExternalLink className="link-ext" href={site.github}>
            GitHub
          </ExternalLink>
          <ExternalLink className="link-ext" href={site.linkedin}>
            LinkedIn
          </ExternalLink>
        </div>
      </div>
    </footer>
  );
}
