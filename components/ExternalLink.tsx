import type { ReactNode } from "react";

// Single place that owns target="_blank" + rel, so a new external link can't
// forget the noopener/noreferrer pair (reverse-tabnabbing guard).
export function ExternalLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
