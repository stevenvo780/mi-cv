import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/globals.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;
import localFont from 'next/font/local';
import { Metadata, Viewport } from 'next';
import Script from 'next/script';
import CustomNavbar from '../components/Navbar';

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

const baseUrl = 'https://stevenvallejo.com';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0b1417' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1417' },
  ],
};

type Locale = 'es' | 'en';

const META = {
  es: {
    ogLocale: 'es_ES',
    htmlLang: 'es-ES',
    title: 'Steven Vallejo Ortiz — Ingeniero de Software & Líder de Sistemas',
    description:
      'Ingeniería de software empresarial de extremo a extremo: arquitectura backend, integración de IA y LLMs, sistemas distribuidos y liderazgo técnico de equipos y plataformas.',
    keywords: [
      'Steven Vallejo Ortiz',
      'Ingeniero de Software',
      'Líder de Sistemas',
      'Arquitectura de Software',
      'Ingeniería de IA',
      'LLMs',
      'Backend',
      'NestJS',
      'Next.js',
      'TypeScript',
      'Sistemas distribuidos',
      'DevOps',
      'Liderazgo técnico',
    ],
  },
  en: {
    ogLocale: 'en_US',
    htmlLang: 'en-US',
    title: 'Steven Vallejo Ortiz — Software Engineer & Systems Lead',
    description:
      'End-to-end enterprise software engineering: backend architecture, AI and LLM integration, distributed systems, and technical leadership of teams and platforms.',
    keywords: [
      'Steven Vallejo Ortiz',
      'Software Engineer',
      'Systems Lead',
      'Software Architecture',
      'AI Engineering',
      'LLMs',
      'Backend',
      'NestJS',
      'Next.js',
      'TypeScript',
      'Distributed systems',
      'DevOps',
      'Technical leadership',
    ],
  },
} as const;

function resolveLocale(locale: string | undefined): Locale {
  return locale === 'es' ? 'es' : 'en';
}

export async function generateMetadata({
  params,
}: {
  params: { locale?: string };
}): Promise<Metadata> {
  const locale = resolveLocale(params.locale);
  const data = META[locale];
  const localizedUrl = `${baseUrl}/${locale}`;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: data.title,
      template: '%s | Steven Vallejo Ortiz',
    },
    description: data.description,
    keywords: [...data.keywords],
    authors: [{ name: 'Steven Vallejo Ortiz', url: baseUrl }],
    creator: 'Steven Vallejo Ortiz',
    publisher: 'Steven Vallejo Ortiz',
    applicationName: 'Steven Vallejo Ortiz — CV',
    alternates: {
      canonical: localizedUrl,
      languages: {
        es: `${baseUrl}/es`,
        en: `${baseUrl}/en`,
        'x-default': `${baseUrl}/en`,
      },
    },
    openGraph: {
      type: 'profile',
      firstName: 'Steven',
      lastName: 'Vallejo Ortiz',
      username: 'stevenvo780',
      title: data.title,
      description: data.description,
      locale: data.ogLocale,
      alternateLocale: locale === 'es' ? ['en_US'] : ['es_ES'],
      url: localizedUrl,
      siteName: 'Steven Vallejo Ortiz',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
  };
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale?: string };
}) {
  const locale = resolveLocale(params.locale);
  const data = META[locale];

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Steven Vallejo Ortiz',
    jobTitle: data.title.split('—')[1]?.trim() ?? data.title,
    description: data.description,
    url: baseUrl,
    image: `${baseUrl}/opengraph-image`,
    sameAs: [
      'https://github.com/stevenvo780',
      'https://www.linkedin.com/in/stevenvo780',
    ],
    knowsAbout: [
      'TypeScript',
      'NestJS',
      'Next.js',
      'Artificial Intelligence',
      'LLMs',
      'Distributed Systems',
      'DevOps',
      'Software Architecture',
      'Backend Engineering',
      'Technical Leadership',
    ],
    knowsLanguage: ['es', 'en'],
  };

  return (
    <html
      lang={data.htmlLang}
      className={`${geistSans.variable} ${geistMono.variable}`}
      prefix="og: http://ogp.me/ns#"
    >
      <body>
        <Script
          id="ld-json-person"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <CustomNavbar />
        {children}
      </body>
    </html>
  );
}
