'use client';
import Head from 'next/head';
import { Container } from 'react-bootstrap';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <Container>
      <Head>
        <title>Hoja de Vida - Steven Vallejo Ortiz</title>
        <meta name="description" content="Curriculum de Steven Vallejo Ortiz" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <main>{children}</main>
    </Container>
  );
}
