import { AppProps } from 'next/app';
import Layout from '@/app/layout';
import Head from 'next/head';


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Steven Vallejo Ortiz - Hoja de Vida</title>
        <meta name="description" content="Soy Steven Vallejo Ortiz, científico de la computación, ingeniero de software, emergentista y holista, con pasión por la filosofía y las ciencias." />
        <meta property="og:title" content="Steven Vallejo Ortiz - Hoja de Vida" />
        <meta property="og:description" content="Descubre más sobre mi experiencia, habilidades y logros. Estoy comprometido a ayudar a la humanidad a través del pensamiento crítico y soluciones tecnológicas." />
        <meta property="og:image" content="/images/profile.jpeg" />
        <meta property="og:url" content="https://stevenvallejo.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:type" content="website" />
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>

  );
}

export default MyApp;
