import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/globals.css';
import '@/styles/brand.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;
import localFont from 'next/font/local';
import { Inter, JetBrains_Mono, Cormorant_Garamond } from 'next/font/google';
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

// Cloud Atlas typography: Inter (UI), JetBrains Mono (eyebrows/chips/meta),
// Cormorant Garamond (Philosophy front + blog only).
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
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
    title: 'Steven Vallejo Ortiz — Ingeniero de Software y Filósofo',
    jobTitle: ['Ingeniero de Software', 'Filósofo'],
    description:
      'Steven Vallejo Ortiz, ingeniero de software y filósofo. Ingeniería backend de extremo a extremo (Node.js, NestJS, TypeScript, PostgreSQL, Docker, Linux, GCP/Cloud Run, microservicios, APIs REST, integración de LLMs, RAG, OCR y automatización de procesos) y formación filosófica en lógica formal, filosofía analítica, epistemología, filosofía de la mente y de la IA, ética y argumentación.',
    keywords: [
      'Steven Vallejo Ortiz',
      'Ingeniero de Software',
      'Filósofo',
      'Arquitectura de Software',
      'Backend',
      'Node.js',
      'NestJS',
      'TypeScript',
      'PostgreSQL',
      'Docker',
      'Linux',
      'GCP',
      'Cloud Run',
      'APIs REST',
      'Microservicios',
      'Integración de LLMs',
      'RAG',
      'OCR',
      'Automatización de procesos',
      'React',
      'Next.js',
      'Lógica formal',
      'Filosofía analítica',
      'Epistemología',
      'Filosofía de la mente',
      'Filosofía de la inteligencia artificial',
      'Ética',
      'Argumentación',
      'Lógica simbólica',
      'Teoría de tipos',
      'SAT solving',
      'Universidad de Antioquia',
    ],
  },
  en: {
    ogLocale: 'en_US',
    htmlLang: 'en-US',
    title: 'Steven Vallejo Ortiz — Software Engineer and Philosopher',
    jobTitle: ['Software Engineer', 'Philosopher'],
    description:
      'Steven Vallejo Ortiz, software engineer and philosopher. End-to-end backend engineering (Node.js, NestJS, TypeScript, PostgreSQL, Docker, Linux, GCP/Cloud Run, microservices, REST APIs, LLM integration, RAG, OCR and process automation) together with a philosophical background in formal logic, analytic philosophy, epistemology, philosophy of mind and of AI, ethics and argumentation.',
    keywords: [
      'Steven Vallejo Ortiz',
      'Software Engineer',
      'Philosopher',
      'Software Architecture',
      'Backend',
      'Node.js',
      'NestJS',
      'TypeScript',
      'PostgreSQL',
      'Docker',
      'Linux',
      'GCP',
      'Cloud Run',
      'REST APIs',
      'Microservices',
      'LLM integration',
      'RAG',
      'OCR',
      'Process automation',
      'React',
      'Next.js',
      'Formal logic',
      'Analytic philosophy',
      'Epistemology',
      'Philosophy of mind',
      'Philosophy of artificial intelligence',
      'Ethics',
      'Argumentation',
      'Symbolic logic',
      'Type theory',
      'SAT solving',
      'Universidad de Antioquia',
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
    jobTitle: [...data.jobTitle],
    description: data.description,
    url: baseUrl,
    image: `${baseUrl}/opengraph-image`,
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'Universidad de Antioquia',
    },
    sameAs: [
      'https://github.com/stevenvo780',
      'https://www.linkedin.com/in/steven-vallejo/',
    ],
    knowsAbout: [
      'Node.js',
      'NestJS',
      'TypeScript',
      'PostgreSQL',
      'Docker',
      'Linux',
      'Google Cloud Platform',
      'Cloud Run',
      'REST APIs',
      'Microservices',
      'LLM integration',
      'RAG',
      'OCR',
      'Process automation',
      'React',
      'Next.js',
      'Software Architecture',
      'Backend Engineering',
      'Formal logic',
      'Analytic philosophy',
      'Epistemology',
      'Philosophy of mind',
      'Philosophy of artificial intelligence',
      'Ethics',
      'Argumentation',
      'Symbolic logic',
      'Type theory',
      'SAT solving',
    ],
    knowsLanguage: ['es', 'en'],
  };

  return (
    <html
      lang={data.htmlLang}
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${jetbrainsMono.variable} ${cormorant.variable}`}
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
