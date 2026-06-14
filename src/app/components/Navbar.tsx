"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import { useTranslate } from '@/utils/translate';
import BrandLogo from './BrandLogo';

// In-page section anchors for the long-scroll portal (scroll-spy targets).
const SECTION_IDS = [
  'filosofia',
  'ciencias',
  'informatica',
  'enterprise',
  'servicios',
] as const;

export default function CustomNavbar() {
  const t = useTranslate();
  const router = useRouter();
  const pathname = usePathname();
  const [locale, setLocaleState] = useState<'en' | 'es'>('en');
  const [active, setActive] = useState<string>('home');

  // Only treat the locale root (/es or /en) as the long-scroll portal page.
  const isPortal = pathname === '/es' || pathname === '/en' || pathname === '/';

  useEffect(() => {
    const path = window.location.pathname;
    setLocaleState(path.startsWith('/es') ? 'es' : 'en');
  }, []);

  // Scroll-spy: highlight the nav link of the section currently in view.
  useEffect(() => {
    if (!isPortal || typeof window === 'undefined') return;
    if (!('IntersectionObserver' in window)) return;
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (sections.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5] }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [isPortal]);

  const toggleLocale = () => {
    const currentPath = window.location.pathname;
    const isSpanish = currentPath.startsWith('/es');
    const newPath = isSpanish
      ? currentPath.replace('/es', '/en')
      : currentPath.replace('/en', '/es');
    router.push(newPath || `/${isSpanish ? 'en' : 'es'}`);
  };

  // Smooth scroll to an in-page section; if not on the portal page, navigate to
  // the localized root with the hash so it lands on the section.
  const goToSection = useCallback(
    (id: string) => (e: React.MouseEvent) => {
      if (!isPortal) {
        router.push(`/${locale}#${id}`);
        return;
      }
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', `#${id}`);
        setActive(id);
      }
    },
    [isPortal, locale, router]
  );

  const sectionLinkStyle = (id: string): React.CSSProperties =>
    active === id
      ? { color: 'var(--gold-light, #f0c887)' }
      : {};

  return (
    <Navbar expand="lg" className="sticky-top" style={{ scrollBehavior: 'smooth' }}>
      <Container>
        <Navbar.Brand
          as={Link}
          href={`/${locale}`}
          className="d-inline-flex align-items-center gap-2"
        >
          <BrandLogo size={30} title={t('header.name')} />
          <span>{t('header.name')}</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} href={`/${locale}`}>
              {t('navbar.home')}
            </Nav.Link>
            {SECTION_IDS.map((id) => (
              <Nav.Link
                key={id}
                href={`#${id}`}
                onClick={goToSection(id)}
                aria-current={active === id ? 'true' : undefined}
                style={sectionLinkStyle(id)}
              >
                {id === 'servicios'
                  ? t('navbar.services')
                  : t(`navbar.${id}`)}
              </Nav.Link>
            ))}
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
