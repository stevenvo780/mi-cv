// components/Experience.js
'use client';
import { Container, Card } from 'react-bootstrap';

interface ExperienceItem {
  title: string;
  company: string;
  date: string;
  location: string;
  description: string;
  phone?: string;
}

const experiences: ExperienceItem[] = [
  {
    title: 'CTO',
    company: 'Finca Directa S.A.S',
    date: 'Nov 2021 - Actualidad',
    location: 'Colombia - Antioquia - Medellín',
    description: 'Jefe de sistemas',
    phone: '+57 313 7898941',
  },
  {
    title: 'Desarrollador backend - Senior',
    company: 'Indie Levels Studio S.A.S',
    date: 'Ago 2021 - Actualidad',
    location: 'Colombia - Antioquia - Medellín',
    description: 'Desarrollo de software orientado a las aplicaciones web',
    phone: '+57 311 3848433',
  },
  {
    title: 'Desarrollador de software Full Stack SEMI-SENIOR',
    company: 'ZENIT S.A.S',
    date: 'Oct 2020 - Ago 2021',
    location: 'Colombia - Antioquia - Medellín',
    description: 'Desarrollo de software RPA',
    phone: '+61 405 868 376',
  },
  {
    title: 'Desarrollador de software Full Stack Junior',
    company: 'INS S.A.S',
    date: 'Feb 2019 - Oct 2020',
    location: 'Colombia - Antioquia - Medellín',
    description: 'Desarrollo de software para aplicaciones web',
    phone: '+57 301 6001317',
  },
  {
    title: 'Desarrollador de software Full Stack Junior',
    company: 'Kambban S.A.S',
    date: 'Feb 2020 - May 2020',
    location: 'Colombia - Antioquia - Medellín',
    description: 'Desarrollo de software para aplicaciones web',
    phone: '+57 301 4735995',
  },
  {
    title: 'Practicante en el semillero SIPAEM',
    company: 'Sena',
    date: 'Mar 2018 - Oct 2018',
    location: 'Colombia - Antioquia - Medellín',
    description: 'Cursos y asesorías de desarrollo de videojuegos.',
    phone: '+57 301 6001317',
  },
  {
    title: 'Gerente - Developer',
    company: 'IQpixels S.A.S',
    date: 'Jul 2016 - Ene 2017',
    location: 'Colombia - Antioquia - Medellín',
    description: 'Infraestructura de sistemas informáticos',
    phone: '+57 304 6374368',
  },
  {
    title: 'Independiente - freelance: Infraestructura de sistemas informáticos',
    company: '',
    date: 'Feb 2014 - Actualidad',
    location: 'Colombia - Antioquia - Medellín',
    description:
      'Ensamble, reparación y mantenimiento de hardware; gestión de redes informática.',
  },
  {
    title: 'Independiente - freelance: Desarrollo de videojuegos',
    company: '',
    date: 'Feb 2015 - Actualidad',
    location: 'Colombia - Antioquia - Medellín',
    description: '',
  },
  {
    title: 'Independiente - freelance: Desarrollo de aplicaciones web',
    company: '',
    date: '2018 - Actualidad',
    location: 'Colombia - Antioquia - Medellín',
    description: '',
  },
];

export default function Experience() {
  return (
    <section className="mb-5">
      <Container>
        <h3 className="text-primary border-bottom pb-2 mb-4">Experiencia</h3>
        {experiences.map((exp, index) => (
          <Card key={index} className="mb-3">
            <Card.Body>
              <Card.Title>
                {exp.title} {exp.company && `- ${exp.company}`}
              </Card.Title>
              <Card.Subtitle className="mb-2 text-muted">
                <strong>{exp.date}</strong> | {exp.location}
              </Card.Subtitle>
              {exp.description && <Card.Text>{exp.description}</Card.Text>}
              {exp.phone && <Card.Text>Número: {exp.phone}</Card.Text>}
            </Card.Body>
          </Card>
        ))}
      </Container>
    </section>
  );
}
