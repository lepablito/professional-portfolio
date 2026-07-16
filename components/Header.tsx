import Link from "next/link";
import { site } from "@/lib/site";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="site-header">
      <div className="wrap site-header-inner">
        <Link href="/" className="brand">
          {site.name}
        </Link>
        <nav className="site-nav" aria-label="Main">
          <NavLinks />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
