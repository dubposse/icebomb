export const metadata = {
  title: "Impressum – icebomb",
  description: "Impressum und Kontaktangaben für icebomb.",
};

export default function ImpressumPage() {
  return (
    <article className="legal-page">
      <h1 className="page-title">Impressum</h1>

      <section>
        <h2>Angaben gemäß § 5 DDG</h2>
        <address>
          Matthias Brehm
          <br />
          Einzelunternehmer – Webentwicklung
          <br />
          Nordwestring 89 | 90419 Nürnberg
          <br />
          Deutschland
        </address>
      </section>

      <section>
        <h2>Kontakt</h2>
        <p>
          <a href="mailto:kontakt@matthiasbrehm.de">kontakt@matthiasbrehm.de</a>
          <br />
          <a href="https://matthiasbrehm.de">matthiasbrehm.de</a>
        </p>
      </section>

      <section>
        <h2>Verantwortlich für den Inhalt gemäß § 18 Abs. 2 MStV, soweit anwendbar</h2>
        <address>
          Matthias Brehm
          <br />
          Nordwestring 89 | 90419 Nürnberg
          <br />
          Deutschland
        </address>
      </section>
    </article>
  );
}
