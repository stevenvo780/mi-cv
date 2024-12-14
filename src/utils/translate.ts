'use client';
import { useParams } from 'next/navigation';
import en from '@/locales/en/common.json';
import es from '@/locales/es/common.json';

const translations: { [key: string]: { [key: string]: string } } = { en, es };

export const useTranslate = () => {
  const params = useParams();
  const locale = params.locale || 'en';

  const t = translations[locale as keyof typeof translations] || translations.en;

  return (key: string): string => t[key] || key;
};
