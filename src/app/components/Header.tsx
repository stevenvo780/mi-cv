'use client';
import Image from 'next/image';
import ContactInfo from './ContactInfo';
import { Container, Row, Col } from 'react-bootstrap';
import profileImage from '@/public/profile.jpeg';
import GameOfLife from '../components/GameOfLife';


export default function Header() {
  return (
    <header className="mb-5 border-bottom pb-3">
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: -1 }}>
        <GameOfLife />
      </div>
      <br/>
      <Container>
        <Row className="align-items-center">
          <Col xs={12} md={3} className="text-center mb-3 mb-md-0">
            <Image
              src={profileImage}
              alt="Steven Vallejo"
              width={150}
              height={150}
              className="rounded-circle border border-4 border-primary"
            />
          </Col>
          <Col xs={12} md={9}>
            <h1 className="display-5  mb-0">Steven Vallejo Ortiz</h1>
            <h2 className="h4 text-secondary">Desarrollador de Software</h2>
            <ContactInfo />
          </Col>
        </Row>
      </Container>
    </header>
  );
}
