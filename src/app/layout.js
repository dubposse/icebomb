import { Archivo, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Header from "@/components/Header";
import MotionRoot from "@/components/MotionRoot";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "icebomb – Eis entdecken, bewerten & Geschmack vergleichen",
  description: "Eis am Stiel, im Kanister oder von der Diele: Entdecke Eissorten, bewerte sie auf neun ungewöhnlichen Skalen und vergleiche deinen Geschmack mit anderen.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de" className={`${archivo.variable} ${mono.variable}`}>
      <body>
        <MotionRoot>
          <Header />
          <main>{children}</main>
          <footer className="site-footer">
            <div className="site-footer__inner">
              <p>icebomb – Eis entdecken, Geschmack vergleichen, Senf dazugeben.</p>
              <nav className="site-footer__links" aria-label="Informationen">
                <Link href="/impressum">Impressum</Link>
                <Link href="/datenschutz">Datenschutz</Link>
                <a href="https://github.com/dubposse/icebomb" target="_blank" rel="noopener noreferrer">GitHub</a>
                <a href="https://github.com/dubposse/icebomb/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">Lizenz</a>
              </nav>
            </div>
          </footer>
        </MotionRoot>
      </body>
    </html>
  );
}
