'use client';
import { Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase } from '@fortawesome/free-solid-svg-icons';

interface AchievementItem {
  name: string;
  description: string;
  link: string;
}

const achievements: AchievementItem[] = [
  { name: 'Humanizar', description: 'Plataforma de software para gestión de recursos humanos', link: 'https://www.humanizar.co/' },
  { name: 'Mera Vuelta', description: 'Aplicación para servicios de transporte en Antioquia', link: 'https://www.meravuelta.com/' },
  { name: 'EMW', description: 'Solución empresarial para monitoreo de rendimiento', link: 'https://emw.humanizar.cloud/' },
  { name: 'Total Pedido - Demo', description: 'Plataforma de pedidos online', link: 'https://total-pedidos-front.vercel.app/' },
  { name: 'Proyecto JARVIS', description: 'Asistente virtual basado en IA', link: 'https://github.com/stevenvo780/jarvisIA' },
  { name: 'Tertulia Literaria Demo', description: 'Plataforma de eventos culturales en línea', link: 'https://www.tertulia-literaria.com/' },
];

export default function Achievements() {
  return (
    <section className="mb-5">
      <Container>
        <h3 className="text-primary border-bottom pb-2 mb-4">Proyectos Destacados</h3>
        <ul className="list-unstyled">
          {achievements.map((item, index) => (
            <li key={index} className="mb-3">
              <FontAwesomeIcon icon={faBriefcase} className="me-2 text-primary" />
              <strong>{item.name}</strong>: {item.description}{' '}
              <a href={item.link} target="_blank" rel="noreferrer" className="text-decoration-none">
                Ver más
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
