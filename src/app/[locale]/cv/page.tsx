import type { Metadata } from 'next';
import CvClient from './CvClient';
import type { Locale } from './cvData';

function resolveLocale(locale: string | undefined): Locale {
  return locale === 'es' ? 'es' : 'en';
}

const META = {
  es: {
    title: 'Hoja de vida — Steven Vallejo Ortiz',
    description:
      'Hoja de vida de Steven Vallejo Ortiz: perfil de informática (Software Engineer, backend, cloud, IA) y perfil de filosofía (lógica formal, filosofía analítica). Descarga en PDF (ES/EN, versión de diseño y versión ATS).',
  },
  en: {
    title: 'Résumé — Steven Vallejo Ortiz',
    description:
      "Steven Vallejo Ortiz's résumé: software profile (Software Engineer, backend, cloud, AI) and philosophy profile (formal logic, analytic philosophy). PDF download (ES/EN, designed and ATS versions).",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: { locale?: string };
}): Promise<Metadata> {
  const locale = resolveLocale(params.locale);
  const data = META[locale];
  const baseUrl = 'https://stevenvallejo.com';
  return {
    title: data.title,
    description: data.description,
    alternates: {
      canonical: `${baseUrl}/${locale}/cv`,
      languages: {
        es: `${baseUrl}/es/cv`,
        en: `${baseUrl}/en/cv`,
      },
    },
    openGraph: {
      title: data.title,
      description: data.description,
      url: `${baseUrl}/${locale}/cv`,
      type: 'profile',
    },
  };
}

export default function CvPage({ params }: { params: { locale?: string } }) {
  const locale = resolveLocale(params.locale);
  return <CvClient locale={locale} />;
}
