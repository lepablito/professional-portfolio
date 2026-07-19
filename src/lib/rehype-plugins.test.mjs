// Plain .mjs like the module under test, so no TS types are needed for the
// hand-built hast fixtures.
import { describe, expect, it } from "vitest";
import { rehypeBasePath, rehypePreTabIndex } from "./rehype-plugins.mjs";

const el = (tagName, properties = {}, children = []) => ({
  type: "element",
  tagName,
  properties,
  children,
});

describe("rehypeBasePath", () => {
  it("prefixes internal src/href, leaving external URLs alone", () => {
    const img = el("img", { src: "/images/diagram.svg" });
    const protocolRelative = el("a", { href: "//cdn.example.com/x" });
    const absolute = el("a", { href: "https://example.com/" });
    const tree = { type: "root", children: [el("p", {}, [img, protocolRelative, absolute])] };

    rehypeBasePath({ base: "/repo/" })(tree);

    expect(img.properties.src).toBe("/repo/images/diagram.svg");
    expect(protocolRelative.properties.href).toBe("//cdn.example.com/x");
    expect(absolute.properties.href).toBe("https://example.com/");
  });

  it("does not double-prefix relative paths or anchors", () => {
    const rel = el("a", { href: "other-post/" });
    const anchor = el("a", { href: "#section" });
    const tree = { type: "root", children: [rel, anchor] };

    rehypeBasePath({ base: "/repo" })(tree);

    expect(rel.properties.href).toBe("other-post/");
    expect(anchor.properties.href).toBe("#section");
  });

  it("is a no-op when no base is configured", () => {
    const img = el("img", { src: "/images/diagram.svg" });
    const tree = { type: "root", children: [img] };

    rehypeBasePath()(tree);

    expect(img.properties.src).toBe("/images/diagram.svg");
  });
});

describe("rehypePreTabIndex", () => {
  it("makes pre blocks keyboard-focusable and leaves everything else alone", () => {
    const pre = el("pre", { class: "astro-code" });
    const code = el("code");
    const tree = { type: "root", children: [el("div", {}, [pre, code])] };

    rehypePreTabIndex()(tree);

    expect(pre.properties.tabIndex).toBe(0);
    expect(code.properties.tabIndex).toBeUndefined();
  });
});
