export const metadata = {
  title: "Datenschutzerklärung – icebomb",
  description: "Informationen zur Verarbeitung personenbezogener Daten bei icebomb.",
};

export default function DatenschutzPage() {
  return (
    <article className="legal-page">
      <h1 className="page-title">Datenschutz</h1>

      <section>
        <h2>1. Verantwortlicher</h2>
        <address>
          Matthias Brehm
          <br />
          Nordwestring 89 | 90419 Nürnberg
          <br />
          Deutschland
        </address>
        <p>
          <a href="mailto:kontakt@matthiasbrehm.de">kontakt@matthiasbrehm.de</a>
        </p>
      </section>

      <section>
        <h2>2. Zweck der Anwendung</h2>
        <p>
          icebomb ist eine öffentlich zugängliche Webanwendung, auf der Besucher
          Eisprodukte mit Bildern hinzufügen und auf neun Skalen bewerten können.
          Eine Registrierung ist nicht erforderlich.
        </p>
        <p>
          Die Verarbeitung personenbezogener Daten erfolgt im Rahmen der
          gesetzlichen Voraussetzungen. Welche Rechtsgrundlage nach Art. 6
          DSGVO einschlägig ist, richtet sich nach dem jeweiligen
          Verarbeitungsvorgang.
        </p>
      </section>

      <section>
        <h2>3. Technischer Betrieb</h2>
        <p>
          Die Anwendung wird über Vercel bereitgestellt. Produktinformationen
          und Bewertungen werden in einer PostgreSQL-Datenbank bei Neon
          gespeichert. Hochgeladene Produktbilder werden über Cloudflare R2
          gespeichert und öffentlich ausgeliefert. Beim Aufruf von Produktbildern
          stellt der Browser eine Verbindung zur jeweils konfigurierten
          öffentlichen Bildadresse her.
        </p>
        <p>
          Beim Betrieb können technisch notwendige Verbindungsdaten wie
          IP-Adressen und Zeitpunkte von Anfragen verarbeitet werden. Eine
          Speicherfrist für Protokolle der Hosting- und Infrastruktur-
          Dienstleister ist hier nicht angegeben.
        </p>
        <p>
          Die verwendeten Schriftarten werden mit Next.js als statische Dateien
          über die eigene Website bereitgestellt. Beim Seitenaufruf wird daher
          nach der aktuellen Implementierung keine Schriftdatei direkt von
          Google geladen. Derzeit sind keine Analyse- oder Marketing-Tracker
          eingebunden.
        </p>
        <p>
          Für die Verarbeitung personenbezogener Verbindungsdaten ist eine
          Rechtsgrundlage nach Art. 6 DSGVO erforderlich. Welche Daten die
          Dienstleister zusätzlich protokollieren und wie lange sie gespeichert
          werden, richtet sich nach den jeweiligen Diensten und deren
          Einstellungen.
        </p>
      </section>

      <section>
        <h2>4. Bewertungen und anonyme Besucherkennung</h2>
        <p>
          icebomb verwendet das technisch notwendige Cookie <code>ib_vid</code>.
          Es enthält eine zufällig erzeugte pseudonyme Kennung mit einer
          serverseitigen Signatur. Das Cookie ist HttpOnly, SameSite=Lax und in
          der Produktionsumgebung Secure. Es wird beim ersten Bild-Upload oder
          bei der ersten Bewertung gesetzt und hat eine feste Speicherdauer von
          365 Tagen. Bei späteren Aufrufen wird seine Laufzeit nicht automatisch
          verlängert.
        </p>
        <p>
          Die Kennung ordnet Bewertungen demselben Browser zu, damit eine
          vorhandene Bewertung aktualisiert werden kann. Sie wird außerdem
          benötigt, um einen eigenen Bild-Upload einem neu eingereichten Produkt
          zuzuordnen. Eine Registrierung oder Angabe eines Namens ist nicht
          erforderlich. Die Kennung erlaubt für sich allein keine verlässliche
          Identifizierung einer natürlichen Person, ist aber pseudonym und nicht
          mit anonym gleichzusetzen.
        </p>
        <p>
          Bewertungen werden zusammen mit dieser Kennung in der Datenbank
          gespeichert. Das Ablaufen oder Löschen des Cookies löscht vorhandene
          Bewertungen nicht. Für Bewertungen ist keine feste Speicherfrist
          angegeben.
        </p>
        <p>
          Das Cookie ist für die Bewertung und Zuordnung eigener Uploads
          erforderlich und wird nicht für Analyse oder Werbung verwendet. Für
          technisch notwendige Cookies sieht § 25 Abs. 2 TDDDG eine Ausnahme
          vom Einwilligungserfordernis vor. Für die damit verbundene
          Verarbeitung der Kennung bedarf es zusätzlich einer Rechtsgrundlage
          nach Art. 6 DSGVO.
        </p>
      </section>

      <section>
        <h2>5. Schutz vor Missbrauch</h2>
        <p>
          Für Uploads, Produkte und Bewertungen gelten jeweils
          Anfragelimits innerhalb von Zeitfenstern von zehn Minuten. Dafür wird
          aus der vom Server ermittelten IP-Adresse mit einem geheimen
          Serverschlüssel eine HMAC-Kennung gebildet. Gespeichert werden diese
          Kennung zusammen mit der Art der Anfrage, dem Beginn des Zeitfensters
          und einem Zähler; die rohe IP-Adresse wird in diesen Einträgen nicht
          gespeichert.
        </p>
        <p>
          Alte Rate-Limit-Einträge werden nicht nach einer festen Frist
          garantiert gelöscht. Die Anwendung stößt die Bereinigung von Einträgen
          älter als einen Tag bei einem kleinen Teil der Anfragen an; die
          Bereinigung erfolgt best effort. Die Kennung ist pseudonym und kann
          innerhalb der jeweiligen Schlüsselkonfiguration Anfragen derselben
          IP-Adresse zuordnen.
        </p>
        <p>
          Die Verarbeitung der IP-basierten Kennung dient dazu, automatisierte
          oder übermäßige Anfragen zu begrenzen und die Verfügbarkeit der
          Anwendung zu schützen. Für diese Verarbeitung ist eine Rechtsgrundlage
          nach Art. 6 DSGVO erforderlich.
        </p>
      </section>

      <section>
        <h2>6. Hochgeladene Bilder und Inhalte</h2>
        <p>
          Von Besuchern hochgeladene Produktbilder und Produktinformationen
          werden öffentlich angezeigt. Bilder werden serverseitig verarbeitet,
          auf höchstens 1000 Pixel Kantenlänge verkleinert, als WebP gespeichert
          und dabei von Bildmetadaten wie EXIF-Daten bereinigt. Zusätzlich wird
          eine kleinere Vorschaudatei erzeugt.
        </p>
        <p>
          Nicht einem Produkt zugeordnete Uploads werden nach mehr als sechs
          Stunden für eine best-effort-Bereinigung vorgemerkt. Für bereits
          übernommene Produktbilder und Produktinformationen ist keine
          automatische Löschung oder feste Speicherfrist eingerichtet. Die
          Bilddateien werden mit einem öffentlichen Cache-Hinweis ausgeliefert,
          der eine Cache-Dauer von einem Jahr angibt.
        </p>
        <p>
          Bitte laden Sie keine personenbezogenen Informationen und keine Bilder
          erkennbarer Personen hoch. Rechtsgrundlage für die Verarbeitung
          personenbezogener Inhalte muss sich nach Art. 6 DSGVO richten. Für
          bestimmte Verarbeitungsvorgänge kann Art. 6 Abs. 1 lit. f DSGVO
          (berechtigtes Interesse am Betrieb und an der öffentlichen Anzeige der
          Anwendung) in Betracht kommen.
        </p>
      </section>

      <section>
        <h2>7. Externe Dienstleister</h2>
        <p>
          Für den Betrieb werden Vercel (Bereitstellung), Neon (Datenbank) und
          Cloudflare R2 (Bildspeicherung und öffentliche Auslieferung)
          eingesetzt. Je nach Dienst, Kontoeinstellung und Vertragskonfiguration
          können Daten auch außerhalb der Europäischen Union verarbeitet werden.
        </p>
        <p>
          Die konkreten Verarbeitungsorte, eingesetzten Vertragsbedingungen,
          Vereinbarungen zur Auftragsverarbeitung und gegebenenfalls
          erforderlichen Garantien für Drittlandübermittlungen hängen von den
          tatsächlich genutzten Diensten und Kontoeinstellungen ab. Eine
          Verarbeitung außerhalb der EU ist möglich.
        </p>
      </section>

      <section>
        <h2>8. Rechte betroffener Personen</h2>
        <p>
          Betroffene Personen haben im Rahmen der gesetzlichen Voraussetzungen
          Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der
          Verarbeitung, Datenübertragbarkeit und Widerspruch. Außerdem besteht
          ein Beschwerderecht bei einer zuständigen Datenschutzaufsichtsbehörde.
        </p>
        <p>
          Anfragen können an{" "}
          <a href="mailto:kontakt@matthiasbrehm.de">kontakt@matthiasbrehm.de</a>{" "}
          gerichtet werden. Beschwerden können an eine zuständige
          Datenschutzaufsichtsbehörde gerichtet werden.
        </p>
      </section>
    </article>
  );
}
