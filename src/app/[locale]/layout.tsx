
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/globals.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;
import localFont from 'next/font/local';

const geistSans = localFont({
  src: '../fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: '../fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata = {
  title: 'Steven Vallejo',
  description:
    'Soy Steven Vallejo Ortiz, Informático y filosofo, comprometido a ayudar a la humanidad a través del pensamiento crítico y soluciones tecnológicas.',
  keywords: [
    'Steven Vallejo Ortiz',
    'Ciencias de la computación',
    'Ingeniero de software',
    'Filosofía',
    'Ciencias',
    'Informática',
    'Tecnología',
    'Pensamiento crítico',
    'Soluciones tecnológicas',
    'Desarrollo de software',
    'Desarrollo web',
    'Desarrollo móvil',
    'Desarrollo de aplicaciones',
    'Desarrollo de sistemas',
    'Desarrollo de software a medida',
    'Desarrollo de software personalizado',
    'Desarrollo de software empresarial',
    'Desarrollo de software para empresas',
    'Desarrollo de software para organizaciones',
  ],
  openGraph: {
    title: 'Steven Vallejo Ortiz - Informático y filosofo',
    description:
      'Explora mi perfil como científico de la computación e ingeniero de software, con pasión por la filosofía y ciencias.',
    url: 'https://www.stevenvallejo.com',
    siteName: 'Steven Vallejo - Portafolio',
    images: [
      {
        url: '/images/profile.jpeg',
        width: 1200,
        height: 630,
        alt: 'Imagen de Steven Vallejo',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  viewport: 'width=device-width, initial-scale=1.0',
  themeColor: '#ffffff',
};

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = params.locale || 'en';
  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}