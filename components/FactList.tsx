import type { Fact } from "@/lib/about-data";

export function FactList({ facts }: { facts: readonly Fact[] }) {
  return (
    <ul className="fact-list">
      {facts.map((fact) => (
        <li key={fact.primary}>
          <span>{fact.primary}</span>
          <span className="mono">{fact.secondary}</span>
        </li>
      ))}
    </ul>
  );
}
