'use client';
import React from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import ContactInfo from './ContactInfo';
import { Container, Row, Col } from 'react-bootstrap';
import profileImage from '@/public/images/profile.jpeg';
import { useTranslate } from '@/utils/translate';

const GameOfLife = dynamic(() => import('./Matematica/GameOfLife'), {
  ssr: false,
});

export default function Header() {
  const t = useTranslate();

  return (
    <header className="mb-5 pb-3" style={{ overflow: 'hidden', position: 'relative', marginTop: '0.95vh' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          zIndex: -1,
        }}
      >
        <GameOfLife />
      </div>
      <br />
      <Container>
        <Row className="align-items-center">
          <Col xs={12} md={3} className="text-center mb-3 mb-md-0">
            <Image
              src={profileImage}
              alt={t('header.profileImageAlt')}
              width={250}
              height={250}
              className="rounded-circle border border-4"
            />
          </Col>
          <Col xs={12} md={9}>
            <div className="text-center text-md-start bg-white rounded p-3">
              <h1 className="display-5 mb-0">{t('header.name')}</h1>
              <h2 className="h4 text-secondary">{t('header.title')}</h2>
            </div>
            <ContactInfo />
          </Col>
        </Row>
      </Container>
    </header>
  );
}
