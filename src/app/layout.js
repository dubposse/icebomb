import { Archivo, JetBrains_Mono } from "next/font/google";
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
             icebomb – Eis entdecken, Geschmack vergleichen, Senf dazugeben.
          </footer>
        </MotionRoot>
      </body>
    </html>
  );
}
