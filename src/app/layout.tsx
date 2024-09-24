import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/globals.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;
import type { Metadata } from "next";
import localFont from "next/font/local";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Steven Vallejo",
  description: "Soy Steven Vallejo Ortiz, Informático y filosofo, comprometido a ayudar a la humanidad a través del pensamiento crítico y soluciones tecnológicas.",
  keywords: [
    "Steven Vallejo Ortiz", "Científico de la computación", "Ingeniero de software", "Filosofía", "Holista", "Emergentismo", "Soluciones tecnológicas",
    "Ontología", "Ciencia", "Alain Badiou", "Jean-Paul Sartre", "Immanuel Kant", "Filosofía de la mente", "Ética", "Estética", "Existencialismo",
    "Conocimiento científico", "Pensamiento crítico", "Filosofía de la ciencia", "Filosofía de la tecnología", "Filosofía de la mente", "Filosofía de la ciencia",
    "Filosofía de la tecnología", "Filosofía de la mente", "Filosofía de la ciencia", "Filosofía de la tecnología", "Filosofía de la mente", "Filosofía de la ciencia",
    "Filosofía etica", "Filosofía estética", "Filosofía ontológica", "Filosofía de la mente", "Filosofía de la ciencia", "Filosofía de la tecnología", "Filosofía de la mente",
    "Filosofía de la ciencia", "Filosofía de la tecnología", "Filosofía de la mente", "Filosofía de la ciencia", "Filosofía de la tecnología", "Filosofía de la mente",
    "Ciencias", "Tecnología", "Ontología", "Epistemología", "Metafísica", "Lógica", "Filosofía de la mente", "Filosofía de la ciencia", "Filosofía de la tecnología",
  ],
  authors: [{ name: "Steven Vallejo Ortiz" }],
  openGraph: {
    title: "Steven Vallejo Ortiz - Informático y filosofo",
    description: "Explora mi perfil como científico de la computación e ingeniero de software, con pasión por la filosofía y ciencias. Mi misión es contribuir a un mejor vivir a través de soluciones críticas y emergentes.",
    url: "https://www.stevenvallejo.com",
    siteName: "Steven Vallejo - Portafolio",
    images: [
      {
        url: "/images/profile.jpeg",
        width: 1200,
        height: 630,
        alt: "Imagen de Steven Vallejo",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@stevenvallejo",
    creator: "@stevenvallejo",
    title: "Steven Vallejo Ortiz - Informático y filosofo",
    description: "Conoce más sobre mi trayectoria como informático y filosofo comprometido a ayudar a la humanidad a través del pensamiento crítico y soluciones tecnológicas.",
    images: [
      {
        url: "/images/profile.jpeg",
        alt: "Imagen de Steven Vallejo",
      },
    ],
  },
  viewport: "width=device-width, initial-scale=1.0",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
