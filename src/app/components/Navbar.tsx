"use client";
import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import { useTranslate } from '@/utils/translate';

export default function CustomNavbar() {
  const t = useTranslate();

  const scrollToSection = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Actualiza el hash en la URL
    window.history.pushState(null, '', `#${id}`);
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Navbar expand="lg" className="bg-light">
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
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
