'use client';
import Image from 'next/image';
import ContactInfo from './ContactInfo';
import { Container, Row, Col } from 'react-bootstrap';

export default function Header() {
  return (
    <header>
      <Container>
        <Row className="align-items-center">
          <Col xs={12} md={4}>
            <Image
              src="/profile.jpg"
              alt="Steven Vallejo"
              width={150}
              height={150}
              className="rounded-circle"
            />
          </Col>
          <Col xs={12} md={8}>
            <h1>Steven Vallejo Ortiz</h1>
            <h2>Desarrollador de Software</h2>
            <ContactInfo />
          </Col>
        </Row>
      </Container>
    </header>
  );
}
