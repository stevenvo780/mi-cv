"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import { useTranslate } from '@/utils/translate';
import BrandLogo from './BrandLogo';
import { useSearch } from './SearchContext';

export default function CustomNavbar() {
  const t = useTranslate();
  const router = useRouter();
  const pathname = usePathname();
  const [locale, setLocaleState] = useState<'en' | 'es'>('en');
  const { query, setQuery } = useSearch();
  const isHome = /^\/(es|en)\/?$/.test(pathname || '') || pathname === '/';

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
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .nav-search { display:inline-flex; align-items:center; gap:6px; height:32px; padding:0 12px;
          border-radius:999px; border:1px solid rgba(255,255,255,0.14); background:rgba(255,255,255,0.04);
          width:190px; max-width:40vw; margin-left:12px; transition:border-color .18s, background .18s; }
        .nav-search:focus-within { border-color:var(--teal,#43b5a6); background:rgba(67,181,166,0.08); }
        .nav-search svg { color:var(--muted,#8fa3a8); flex-shrink:0; }
        .nav-search:focus-within svg { color:var(--teal,#43b5a6); }
        .nav-search input { flex:1; min-width:0;
          -webkit-appearance:none !important; appearance:none !important;
          border:0 !important; background:transparent !important; border-radius:0 !important;
          box-shadow:none !important; outline:none !important; padding:0 !important; margin:0 !important;
          color:var(--text,#e8e0d4); font-size:13px; font-family:inherit; height:auto; line-height:normal; }
        .nav-search input:focus, .nav-search input:focus-visible { box-shadow:none !important; border:0 !important; outline:none !important; }
        .nav-search input::placeholder { color:var(--muted,#8fa3a8); }
        .nav-search input::-webkit-search-cancel-button { display:none; }
        @media (max-width: 575.98px) { .nav-search { width:128px; margin-left:6px; } }
      ` }} />
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

        {isHome && (
          <form className="nav-search" role="search" onSubmit={(e) => e.preventDefault()}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={locale === 'es' ? 'Buscar…' : 'Search…'}
              aria-label={locale === 'es' ? 'Buscar productos' : 'Search products'}
            />
          </form>
        )}

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
              {locale === 'es' ? 'Filósofo' : 'Philosopher'}
            </Nav.Link>
            <Nav.Link
              href="https://informatico.stevenvallejo.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              {locale === 'es' ? 'Informático' : 'Engineer'}
            </Nav.Link>
            <Nav.Link
              href="https://praxis.stevenvallejo.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              {locale === 'es' ? 'Servicios' : 'Services'}
            </Nav.Link>
          </Nav>

          <div className="d-flex align-items-center gap-2">
            <a
              href="https://schole.stevenvallejo.com"
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
    </>
  );
}
