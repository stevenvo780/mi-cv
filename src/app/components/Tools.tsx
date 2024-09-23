// components/Tools.js
import { Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPhp,
  faNodeJs,
  faPython,
  faHtml5,
  faCss3Alt,
  faJsSquare,
  faReact,
  faLaravel,
  faDocker,
  faAws,
  faGithub,
  faUnity,
} from '@fortawesome/free-brands-svg-icons';
import {
  faDatabase,
  faCode,
  faServer,
  faCogs,
  faGamepad,
  faProjectDiagram,
  faPencilRuler,
  faBrain,
  faLightbulb,
  faNetworkWired,
  faImage,
} from '@fortawesome/free-solid-svg-icons';

interface ToolItem {
  name: string;
  icon?: any;
}

interface ToolCategory {
  category: string;
  items: ToolItem[];
}

const tools: ToolCategory[] = [
  {
    category: 'BackEnd',
    items: [
      {
        name: 'Arquitecturas REST, SOAP, GRAPHQL, GRAND-STACK, CQRS, Event-Driven, DDD y Event Sourcing, SQS',
        icon: faServer,
      },
      {
        name: 'PHP (SLIM, Laravel, Symfony; testing CodeCeption y PHPunit; documentación Swagger y nativa)',
        icon: faPhp,
      },
      {
        name: 'Node.js (TypeScript; Express, Strapi, Apollo, Apollo-neo4j, Hapi, NestJS; testing JEST; documentación Swagger)',
        icon: faNodeJs,
      },
      { name: 'Python', icon: faPython },
      { name: '.NET y Bash', icon: faCode },
    ],
  },
  {
    category: 'FrontEnd',
    items: [
      { name: 'HTML', icon: faHtml5 },
      { name: 'CSS3 (Bootstrap, MaterialUI, Bulma)', icon: faCss3Alt },
      { name: 'JavaScript y SASS', icon: faJsSquare },
      { name: 'ReactJS (Redux y sagas), Angular, Vue (Vuex)', icon: faReact },
      { name: 'React Native, Next.js', icon: faReact },
      { name: 'Laravel (Blade), Symfony (Twig)', icon: faLaravel },
    ],
  },
  {
    category: 'Bases de datos',
    items: [
      { name: 'MongoDB, MariaDB', icon: faDatabase },
      { name: 'SQL Server, Neo4j, PostgreSQL, Firebase', icon: faDatabase },
    ],
  },
  {
    category: 'Inteligencia Artificial',
    items: [
      { name: 'TensorFlow, PyTorch', icon: faBrain },
      { name: 'node-nlp, Numpy, Wolfram Alpha, PNL', icon: faCode },
    ],
  },
  {
    category: 'DevOps',
    items: [
      { name: 'Google Cloud avanzado, AWS Cloud', icon: faAws },
      { name: 'Hosting tradicional, Vercel', icon: faServer },
      { name: 'Git, GitHub, BitBucket, GitLab', icon: faGithub },
      { name: 'Docker', icon: faDocker },
      { name: 'Linux avanzado', icon: faCode },
      { name: 'CI/CD Pipelines, GitHub Actions', icon: faCogs },
      { name: 'RabbitMQ, Apache Kafka', icon: faServer },
    ],
  },
  {
    category: 'Videojuegos',
    items: [
      { name: 'C# Unity 3D', icon: faUnity },
      {
        name: 'Realidad virtual con Oculus HTC VIVE, realidad aumentada con Vuforia',
        icon: faGamepad,
      },
      { name: 'Metaversos como Decentraland', icon: faGamepad },
    ],
  },
  {
    category: 'Planeación',
    items: [
      { name: 'Trello, JIRA, ClickUp', icon: faProjectDiagram },
      { name: 'SCRUM, KANBAN, LEAN', icon: faPencilRuler },
      { name: 'TDD, UML', icon: faPencilRuler },
    ],
  },
  {
    category: 'Herramientas de IA',
    items: [
      { name: 'Stable Diffusion avanzado', icon: faImage },
      { name: 'ChatGPT', icon: faBrain },
      { name: 'GitHub Copilot, TabNine', icon: faGithub },
      {
        name: 'Hugging Face (Consumo de modelos como LLAMA, BlenderBot, GPT-2 y GPT-3, Sentiment)',
        icon: faNetworkWired,
      },
    ],
  },
  {
    category: 'Modelos Teóricos',
    items: [
      { name: 'Teoría de Juegos', icon: faLightbulb },
      { name: 'Teoría de la Decisión', icon: faLightbulb },
      { name: 'MASOES y Ruliat', icon: faLightbulb },
    ],
  },
];

export default function Tools() {
  return (
    <section className="mb-5">
      <Container>
        <h3 className="text-primary border-bottom pb-2 mb-4">Herramientas</h3>
        <Row>
          {tools.map((tool, index) => (
            <Col md={6} key={index} className="mb-4">
              <h4 className="h5">{tool.category}:</h4>
              <ul className="list-unstyled">
                {tool.items.map((item, i) => (
                  <li key={i} className="d-flex align-items-center mb-2">
                    {item.icon && (
                      <FontAwesomeIcon icon={item.icon} className="me-2 text-primary" />
                    )}
                    {item.name}
                  </li>
                ))}
              </ul>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}
