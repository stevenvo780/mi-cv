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
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Navbar expand="lg" className="bg-light">
      <Container>
        <Navbar.Brand href="#inicio" onClick={scrollToSection('inicio')}>
          {t('header.name')}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#inicio" onClick={scrollToSection('inicio')}>
              {t('navbar.inicio')}
            </Nav.Link>
            <Nav.Link href="#experiencia" onClick={scrollToSection('experiencia')}>
              {t('navbar.experiencia')}
            </Nav.Link>
            <Nav.Link href="#educacion" onClick={scrollToSection('educacion')}>
              {t('navbar.educacion')}
            </Nav.Link>
            <Nav.Link href="#tools" onClick={scrollToSection('tools')}>
              {t('navbar.tools')}
            </Nav.Link>
            <Nav.Link href="#skills" onClick={scrollToSection('skills')}>
              {t('navbar.habilidades')}
            </Nav.Link>
            <Nav.Link href="#contacto" onClick={scrollToSection('contacto')}>
              {t('navbar.contacto')}
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
