import { Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, IconDefinition } from '@fortawesome/free-brands-svg-icons';
import { faGamepad, faLink } from '@fortawesome/free-solid-svg-icons';

interface PortfolioItem {
  name: string;
  link: string;
  icon: IconDefinition;
}

const portfolioItems: PortfolioItem[] = [
  { name: 'GitHub', link: 'https://github.com/stevenvo780', icon: faGithub },
  { name: 'CodeRank', link: 'https://profile.codersrank.io/user/stevenvo780', icon: faLink },
  { name: 'Videojuegos', link: 'https://mega.nz/folder/dLZwHCAL#A4xL0DJDmbkOej5uDP96xg', icon: faGamepad },
];

export default function Portfolio() {
  return (
    <section className="mb-5">
      <Container>
        <h3 className="text-primary border-bottom pb-2 mb-4">Portafolio</h3>
        <ul className="list-inline">
          {portfolioItems.map((item, index) => (
            <li key={index} className="list-inline-item me-3 mb-2">
              <FontAwesomeIcon icon={item.icon} className="me-1 text-primary" />
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
