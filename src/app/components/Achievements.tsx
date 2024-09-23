// components/Achievements.js
import { Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase } from '@fortawesome/free-solid-svg-icons';

interface AchievementItem {
  name: string;
  link: string;
}

const achievements: AchievementItem[] = [
  { name: 'Humanizar', link: 'https://www.humanizar.co/' },
  { name: 'Mera Vuelta', link: 'https://www.meravuelta.com/' },
  { name: 'EMW', link: 'https://emw.humanizar.cloud/' },
  { name: 'Total Pedido - Demo', link: 'https://total-pedidos-front.vercel.app/' },
  { name: 'Proyecto JARVIS', link: 'https://github.com/stevenvo780/jarvisIA' },
  { name: 'Tertulia Literaria Demo', link: 'https://www.tertulia-literaria.com/' },
];

export default function Achievements() {
  return (
    <section className="mb-5">
      <Container>
        <h3 className="text-primary border-bottom pb-2 mb-4">Emprendimientos</h3>
        <ul className="list-inline">
          {achievements.map((item, index) => (
            <li key={index} className="list-inline-item me-3 mb-2">
              <FontAwesomeIcon icon={faBriefcase} className="me-1 text-primary" />
              <a href={item.link} target="_blank" rel="noreferrer" className="text-decoration-none">
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
