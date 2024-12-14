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
  title: {
    es: 'Steven Vallejo',
    en: 'Steven Vallejo',
  },
  description: {
    es: 'Soy Steven Vallejo Ortiz, Informático y filósofo, comprometido a ayudar a la humanidad a través del pensamiento crítico y soluciones tecnológicas.',
    en: 'I am Steven Vallejo Ortiz, a Computer Scientist and Philosopher, committed to helping humanity through critical thinking and technological solutions.',
  },
  keywords: {
    es: [
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
    en: [
      'Steven Vallejo Ortiz',
      'Computer Science',
      'Software Engineer',
      'Philosophy',
      'Science',
      'Information Technology',
      'Critical Thinking',
      'Technological Solutions',
      'Software Development',
      'Web Development',
      'Mobile Development',
      'App Development',
      'System Development',
      'Custom Software Development',
      'Business Software Development',
      'Organizational Software Development',
    ],
  },
  openGraph: {
    es: {
      title: 'Steven Vallejo Ortiz - Informático y Filósofo',
      description:
        'Explora mi perfil como científico de la computación e ingeniero de software, con pasión por la filosofía y ciencias.',
    },
    en: {
      title: 'Steven Vallejo Ortiz - Computer Scientist and Philosopher',
      description:
        'Explore my profile as a Computer Scientist and Software Engineer with a passion for philosophy and science.',
    },
  },
  twitter: {
    es: {
      title: 'Steven Vallejo Ortiz - Informático y Filósofo',
      description:
        'Explora mi perfil como científico de la computación e ingeniero de software, con pasión por la filosofía y ciencias.',
    },
    en: {
      title: 'Steven Vallejo Ortiz - Computer Scientist and Philosopher',
      description:
        'Explore my profile as a Computer Scientist and Software Engineer with a passion for philosophy and science.',
    },
  },
  locale: { es: 'es_ES', en: 'en_US' },
  viewport: 'width=device-width, initial-scale=1.0',
  themeColor: '#ffffff',
  alternates: {
    canonical: 'https://www.stevenvallejo.com',
    languages: {
      en: 'https://www.stevenvallejo.com/en',
      es: 'https://www.stevenvallejo.com/es',
    },
  },
};

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = (params.locale as 'es' | 'en') || 'en';
  return (
    <html lang={locale}>
      <head>
        <meta name="author" content="Steven Vallejo Ortiz" />
        <meta name="keywords" content={metadata.keywords[locale].join(', ')} />
        <meta name="viewport" content={metadata.viewport} />
        <meta name="theme-color" content={metadata.themeColor} />
        <meta name="robots" content="index, follow" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.twitter[locale].title} />
        <meta name="twitter:description" content={metadata.twitter[locale].description} />
        <meta name="twitter:image" content="/images/profile.jpeg" />
        <meta property="og:title" content={metadata.openGraph[locale].title} />
        <meta property="og:description" content={metadata.openGraph[locale].description} />
        <meta property="og:image" content="/images/profile.jpeg" />
        <meta property="og:url" content="https://www.stevenvallejo.com" />
        <meta property="og:locale" content={metadata.locale[locale]} />
        <meta property="og:site_name" content="Steven Vallejo - Portfolio" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://www.stevenvallejo.com" />
        <link rel="alternate" hrefLang="es" href="https://www.stevenvallejo.com/es" />
        <link rel="alternate" hrefLang="en" href="https://www.stevenvallejo.com/en" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
