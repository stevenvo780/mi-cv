// app/[lang]/layout.tsx
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/globals.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;
import localFont from 'next/font/local';
import { Metadata, Viewport } from 'next';

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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export async function generateMetadata({
  params,
}: {
  params: { lang: 'en' | 'es' };
}): Promise<Metadata> {
  const metaData = {
    'en-US': {
      title: 'Steven Vallejo - Computer Scientist and Philosopher',
      description:
        'Explore my profile as a Computer Scientist and Software Engineer with a passion for philosophy and science.',
      keywords: [
        'Steven Vallejo Ortiz',
        'Computer Science',
        'Software Engineer',
        'Philosophy',
        'Science',
        'Information Technology',
      ],
    },
    'es-ES': {
      title: 'Steven Vallejo Ortiz - Informático y Filósofo',
      description:
        'Explora mi perfil como científico de la computación e ingeniero de software, con pasión por la filosofía y ciencias.',
      keywords: [
        'Steven Vallejo Ortiz',
        'Ciencias de la computación',
        'Ingeniero de software',
        'Filosofía',
        'Ciencias',
        'Tecnologías de la información',
      ],
    },
  };

  const locale = params.lang === 'es' ? 'es-ES' : 'en-US';
  const data = metaData[locale];

  return {
    title: data.title,
    description: data.description,
    keywords: data.keywords,
    alternates: {
      canonical: 'https://www.stevenvallejo.com',
      languages: {
        'en-US': 'https://www.stevenvallejo.com/en',
        'es-ES': 'https://www.stevenvallejo.com/es',
      },
    },
    openGraph: {
      title: data.title,
      description: data.description,
      type: 'website',
      locale: locale,
      url: 'https://www.stevenvallejo.com',
      siteName: 'Steven Vallejo',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Steven Vallejo Portfolio',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.description,
      images: ['/twitter-image.jpg'],
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
    verification: {
      google: 'your-google-verification-code',
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
  params: { lang: 'es' | 'en' };
}) {
  return (
    <html
      lang={params.lang === 'es' ? 'es-ES' : 'en-US'}
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}