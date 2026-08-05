import { Metadata } from 'next';
import Script from 'next/script';
import CustomNavbar from '../components/Navbar';
import { SearchProvider } from '../components/SearchContext';
import LocaleLangSync from '../components/LocaleLangSync';

const baseUrl = 'https://stevenvallejo.com';

type Locale = 'es' | 'en';

const META = {
  es: {
    ogLocale: 'es_ES',
    htmlLang: 'es-ES',
    title: 'Mouseîon — Portal de Steven Vallejo (Ingeniero & Filósofo)',
    jobTitle: ['Ingeniero de Software', 'Filósofo'],
    metaDescription:
      'Portal de Steven Vallejo Ortiz: ingeniero de software backend (Node.js, NestJS, GCP, LLMs) y filósofo (lógica, filosofía analítica, ética, IA). Mouseîon.',
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
    title: 'Mouseîon — Steven Vallejo Portal (Engineer & Philosopher)',
    jobTitle: ['Software Engineer', 'Philosopher'],
    metaDescription:
      'Portal of Steven Vallejo Ortiz: backend software engineer (Node.js, NestJS, GCP, LLMs) and philosopher (logic, analytic philosophy, ethics, AI). Mouseîon.',
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
      template: '%s | Mouseîon · Steven Vallejo',
    },
    description: data.metaDescription,
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
      type: 'website',
      title: data.title,
      description: data.metaDescription,
      locale: data.ogLocale,
      alternateLocale: locale === 'es' ? ['en_US'] : ['es_ES'],
      url: localizedUrl,
      siteName: 'Mouseîon',
      images: [
        {
          url: `${baseUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: data.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.metaDescription,
      images: [`${baseUrl}/opengraph-image`],
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
      'https://www.linkedin.com/in/stevenvo780',
      'https://www.instagram.com/stev_vallejo/',
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

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Mouseîon',
    description: locale === 'es'
      ? 'Portal de Steven Vallejo — ingeniero de software y filósofo'
      : 'Portal of Steven Vallejo — software engineer and philosopher',
    url: baseUrl,
    author: {
      '@type': 'Person',
      name: 'Steven Vallejo Ortiz',
      url: baseUrl,
    },
    inLanguage: [locale === 'es' ? 'es-ES' : 'en-US', locale === 'es' ? 'en-US' : 'es-ES'],
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/en?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
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
      <Script
        id="ld-json-website"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <SearchProvider>
        <CustomNavbar />
        {children}
      </SearchProvider>
    </>
  );
}
