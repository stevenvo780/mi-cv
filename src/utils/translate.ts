import { useRouter } from 'next/router';
import en from '@/locales/en/common.json';
import es from '@/locales/es/common.json';

const translations = { en, es };

export const useTranslate = () => {
  const { locale } = useRouter();

  if (typeof window === 'undefined') {
    return (key: string): string => key;
  }
  const t = (translations[locale as keyof typeof translations] || translations.en) as { [key: string]: string };
  return (key: string): string => t[key] || key;
};
