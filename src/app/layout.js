import { Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import MotionRoot from "@/components/MotionRoot";
import { StoreProvider } from "@/components/StoreProvider";

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
  title: "icebomb – Eis bewerten, spielerisch",
  description: "Bewerte Eis am Stiel, im Kanister und von der Eisdiele auf neun spielerischen Skalen.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de" className={`${archivo.variable} ${mono.variable}`}>
      <body>
        <MotionRoot>
          <StoreProvider>
          <Header />
          <main>{children}</main>
          <footer className="site-footer">
            icebomb — Mock-Phase. Alle Daten sind Beispiele und nur lokal im Browser.
          </footer>
        </StoreProvider>
        </MotionRoot>
      </body>
    </html>
  );
}
