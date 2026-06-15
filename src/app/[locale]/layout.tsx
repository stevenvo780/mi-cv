import { Metadata } from 'next';
import Script from 'next/script';
import CustomNavbar from '../components/Navbar';
import LocaleLangSync from '../components/LocaleLangSync';

const baseUrl = 'https://stevenvallejo.com';

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
    <>
      <LocaleLangSync lang={data.htmlLang} />
      <Script
        id="ld-json-person"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <CustomNavbar />
      {children}
    </>
  );
}
