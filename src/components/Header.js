import Link from "next/link";

export default function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="logo" aria-label="icebomb – Startseite">
        ice<span>bomb</span>
      </Link>
      <Link href="/hinzufuegen" className="btn btn--nav">
        <span className="plus" aria-hidden="true">+</span> Eis hinzufügen
      </Link>
    </header>
  );
}
