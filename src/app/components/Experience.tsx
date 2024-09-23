'use client';
import { Container, Row, Col, Card } from 'react-bootstrap';

interface ExperienceItem {
  title: string;
  date: string;
  location: string;
  description: string;
  phone: string;
}

const experiences: ExperienceItem[] = [
  {
    title: "CTO - Finca Directa S.A.S",
    date: "Nov 2021 - Actualidad",
    location: "Medellín, Antioquia, Colombia",
    description: "Jefe de sistemas",
    phone: "+57 313 7898941",
  },
  {
    title: "Desarrollador Backend - Senior - Indie Levels Studio S.A.S",
    date: "Ago 2021 - Actualidad",
    location: "Medellín, Antioquia, Colombia",
    description: "Desarrollo de software orientado a las aplicaciones web",
    phone: "+57 311 3848433",
  },
];

export default function Experience() {
  return (
    <Container>
      <h3>Experiencia</h3>
      <Row>
        {experiences.map((exp, index) => (
          <Col key={index} xs={12} md={6}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>{exp.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {exp.date} | {exp.location}
                </Card.Subtitle>
                <Card.Text>{exp.description}</Card.Text>
                <Card.Text>Teléfono: {exp.phone}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
