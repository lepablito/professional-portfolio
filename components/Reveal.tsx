"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Subtle scroll reveal (fade + 12px slide). The hidden initial state only
// applies when <html> has the "js" class, so content is always visible
// without JavaScript. A CSS-only safety animation (see .reveal in
// globals.css) fades everything in after a delay even if hydration fails,
// so this component can never permanently hide content. Reduced motion
// shows everything immediately.
export function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -32px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="reveal">
      {children}
    </div>
  );
}
