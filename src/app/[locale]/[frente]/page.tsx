import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { frentesMeta, type FrenteId } from '@/data/frentes';
import FrentePageClient from './FrentePageClient';

const VALID_FRENTES: FrenteId[] = ['filosofia', 'ciencias', 'informatica', 'enterprise'];

export async function generateMetadata({
  params,
}: {
  params: { locale: string; frente: string };
}): Promise<Metadata> {
  const locale = params.locale === 'es' ? 'es' : 'en';
  const frente = params.frente as FrenteId;

  if (!VALID_FRENTES.includes(frente)) {
    return {};
  }

  const meta = frentesMeta[frente];
  const title = `${meta.nombre[locale]} | Mouseîon · Steven Vallejo`;
  const description = meta.descripcion[locale];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://stevenvallejo.com/${locale}/${frente}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function FrentePage({
  params,
}: {
  params: { locale: string; frente: string };
}) {
  const locale = params.locale === 'es' ? 'es' : 'en';
  const frente = params.frente as FrenteId;

  if (!VALID_FRENTES.includes(frente)) {
    notFound();
  }

  return <FrentePageClient locale={locale} frenteId={frente} />;
}
