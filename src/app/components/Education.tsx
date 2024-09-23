// components/Education.js
import { Container } from 'react-bootstrap';

interface EducationItem {
  title: string;
  date: string;
  location: string;
}

const educationItems: EducationItem[] = [
  {
    title: 'Técnica en Desarrollo de Software - SENA',
    date: '2017',
    location: 'Colombia - Antioquia - Medellín',
  },
  {
    title: 'Curso de Desarrollo para HTC VR - SENA',
    date: '2017',
    location: 'Colombia - Antioquia - Medellín',
  },
  {
    title: 'Curso en Desarrollo de Videojuegos - CENSA',
    date: '2017',
    location: 'Colombia - Antioquia - Medellín',
  },
];

export default function Education() {
  return (
    <section className="mb-5">
      <Container>
        <h3 className="text-primary border-bottom pb-2 mb-4">Educación</h3>
        {educationItems.map((edu, index) => (
          <div key={index} className="mb-3">
            <h4 className="h5 mb-1">{edu.title}</h4>
            <p className="text-muted mb-0">
              <strong>{edu.date}</strong> | {edu.location}
            </p>
          </div>
        ))}
      </Container>
    </section>
  );
}
