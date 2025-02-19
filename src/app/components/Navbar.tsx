"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import { useTranslate } from '@/utils/translate';
import DownloadCVMinimal from './DownloadCVMinimal';

export default function CustomNavbar() {
  const t = useTranslate();
  const router = useRouter();
  const [currentLocale, setCurrentLocale] = useState('En');

  useEffect(() => {
    const path = window.location.pathname;
    setCurrentLocale(path.startsWith('/es') ? 'Es' : 'En');
  }, []);

  const toggleLocale = () => {
    const currentPath = window.location.pathname;
    const isSpanish = currentPath.startsWith('/es');
    const newPath = isSpanish ? currentPath.replace('/es', '/en') : currentPath.replace('/en', '/es');
    router.push(newPath);
  };

  const scrollToSection = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.history.pushState(null, '', `#${id}`);
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Navbar expand="lg" className="bg-light sticky-top">
      <Container>
        <Navbar.Brand href="#home" onClick={scrollToSection('home')}>
          {t('header.name')}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#home" onClick={scrollToSection('home')}>
              {t('navbar.home')}
            </Nav.Link>
            <Nav.Link href="#projects" onClick={scrollToSection('projects')}>
              {t('navbar.projects')}
            </Nav.Link>
            <Nav.Link href="#portfolio" onClick={scrollToSection('portfolio')}>
              {t('navbar.portfolio')}
            </Nav.Link>
            <Nav.Link href="#tools" onClick={scrollToSection('tools')}>
              {t('navbar.tools')}
            </Nav.Link>
            <Nav.Link href="#skills" onClick={scrollToSection('skills')}>
              {t('navbar.skills')}
            </Nav.Link>
            <Nav.Link href="#experience" onClick={scrollToSection('experience')}>
              {t('navbar.experience')}
            </Nav.Link>
            <Nav.Link href="#contact" onClick={scrollToSection('contact')}>
              {t('navbar.contact')}
            </Nav.Link>
          </Nav>
          <DownloadCVMinimal />
          <button
            onClick={toggleLocale}
            className="btn btn-primary"
            style={{
              width: '50px',
              height: '30px',
              borderRadius: '10px',
              fontSize: '12px',
              padding: '0',
              marginLeft: '10px'
            }}
          >
            {currentLocale}
          </button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
