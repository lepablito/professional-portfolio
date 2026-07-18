import { asset, site } from "@/lib/site";
import { ExternalLink } from "./ExternalLink";

// The footer is the drawing's title block — the labelled box of record
// that sits at the bottom of an engineering sheet.
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <dl className="titleblock">
          <div>
            <dt>Drawn by</dt>
            <dd>{site.name}</dd>
          </div>
          <div>
            <dt>Checked by</dt>
            <dd>production</dd>
          </div>
          <div>
            <dt>Sheet</dt>
            <dd>{site.url.replace("https://", "")}</dd>
          </div>
          <div>
            <dt>Contact</dt>
            <dd>
              <a href={`mailto:${site.email}`}>email</a>
              {" · "}
              <a href={asset(site.cvPath)} download>
                CV (PDF)
              </a>
              {" · "}
              <ExternalLink href={site.github}>GitHub ↗</ExternalLink>
              {" · "}
              <ExternalLink href={site.linkedin}>LinkedIn ↗</ExternalLink>
            </dd>
          </div>
        </dl>
        <div className="footer-note">
          <p className="mono">
            © {new Date().getFullYear()} {site.name} · Valladolid, Spain
          </p>
          <p className="mono">Built with Next.js · Deployed on GitHub Pages</p>
        </div>
      </div>
    </footer>
  );
}
