"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import { useTranslate } from '@/utils/translate';
import BrandLogo from './BrandLogo';

export default function CustomNavbar() {
  const t = useTranslate();
  const router = useRouter();
  const pathname = usePathname();
  const [locale, setLocaleState] = useState<'en' | 'es'>('en');

  useEffect(() => {
    setLocaleState(window.location.pathname.startsWith('/es') ? 'es' : 'en');
  }, [pathname]);

  const toggleLocale = () => {
    const currentPath = window.location.pathname;
    const isSpanish = currentPath.startsWith('/es');
    const newPath = isSpanish
      ? currentPath.replace('/es', '/en')
      : currentPath.replace('/en', '/es');
    router.push(newPath || `/${isSpanish ? 'en' : 'es'}`);
  };

  const loreHref = `/${locale}/lore`;

  return (
    <Navbar expand="lg" className="sticky-top" style={{ scrollBehavior: 'smooth' }}>
      <Container>
        <Navbar.Brand
          as={Link}
          href={`/${locale}`}
          className="d-inline-flex align-items-center gap-2"
        >
          <BrandLogo size={30} title={t('header.name')} />
          <span className="d-inline-flex flex-column lh-1">
            <span>{t('header.name')}</span>
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.6rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--teal-light, #6fd3c4)',
                marginTop: '2px',
              }}
            >
              Mouseîon
            </span>
          </span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} href={`/${locale}`}>
              {t('navbar.home')}
            </Nav.Link>
            <Nav.Link as={Link} href={loreHref}>
              {locale === 'es' ? 'Mi historia' : 'My story'}
            </Nav.Link>
            <Nav.Link
              href="https://filosofo.stevenvallejo.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              {locale === 'es' ? 'CV Filósofo' : 'Philosophy CV'}
            </Nav.Link>
            <Nav.Link
              href="https://informatico.stevenvallejo.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              {locale === 'es' ? 'CV Informático' : 'Engineering CV'}
            </Nav.Link>
            <Nav.Link
              href="https://services.stevenvallejo.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              {locale === 'es' ? 'Servicios' : 'Services'}
            </Nav.Link>
          </Nav>

          <div className="d-flex align-items-center gap-2">
            <a
              href="https://blog.stevenvallejo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{
                height: '30px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 600,
                padding: '0 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                whiteSpace: 'nowrap',
              }}
            >
              {t('navbar.blog')}
              <span aria-hidden="true">↗</span>
            </a>
            <button
              onClick={toggleLocale}
              className="btn btn-primary"
              style={{
                width: '50px',
                height: '30px',
                borderRadius: '10px',
                fontSize: '12px',
                padding: '0',
              }}
            >
              {locale === 'en' ? 'Es' : 'En'}
            </button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
