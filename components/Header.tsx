import Link from "next/link";
import { site } from "@/lib/site";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";

// ThemeToggle sits next to the nav, not inside it: it's a control, not a
// navigation link, so it shouldn't be announced as part of the "Main"
// navigation landmark.
export function Header() {
  return (
    <header className="site-header">
      <div className="wrap site-header-inner">
        <Link href="/" className="brand">
          {site.name}
        </Link>
        <div className="site-nav">
          <nav className="site-nav-links" aria-label="Main">
            <NavLinks />
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
