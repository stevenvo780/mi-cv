import {
  faPhp,
  faNodeJs,
  faPython,
  faHtml5,
  faCss3Alt,
  faJsSquare,
  faReact,
  faAngular,
  faVuejs,
  faLaravel,
  faDocker,
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
  faNetworkWired,
  faImage,
  faCloud,
} from '@fortawesome/free-solid-svg-icons';
import { ToolCategory } from './types';

export const tools: ToolCategory[] = [
  {
    category: 'Desarrollo Back-End',
    items: [
      { name: 'Node.js', icon: faNodeJs, level: 95 },
      { name: 'TypeScript', icon: faCode, level: 95 },
      { name: 'NestJS', icon: faCode, level: 90 },
      { name: 'Hapi', icon: faCode, level: 85 },
      { name: 'Python', icon: faPython, level: 80 },
      { name: 'Express', icon: faCode, level: 75 },
      { name: 'PHP', icon: faPhp, level: 75 },
      { name: 'Laravel', icon: faLaravel, level: 70 },
      { name: 'Symfony', icon: faPhp, level: 70 },
      { name: 'SLIM Framework', icon: faPhp, level: 60 },
      { name: 'Bash', icon: faCode, level: 65 },
      { name: '.NET', icon: faCode, level: 45 },
    ].sort((a, b) => b.level - a.level),
    links: [
      {
        url: 'https://github.com/stevenvo780/tertulialiteraria-api',
        icon: faNodeJs,
      },
      {
        url: 'https://github.com/stevenvo780/api-node-mongodb',
        icon: faNodeJs,
      },
    ],
  },
  {
    category: 'Desarrollo Front-End',
    items: [
      { name: 'ReactJS (Redux, sagas, ReactContext)', icon: faReact, level: 95 },
      { name: 'JavaScript', icon: faJsSquare, level: 90 },
      { name: 'HTML', icon: faHtml5, level: 85 },
      { name: 'CSS3 (Bootstrap, MaterialUI, Bulma)', icon: faCss3Alt, level: 80 },
      { name: 'Next.js', icon: faReact, level: 75 },
      { name: 'React Native', icon: faReact, level: 75 },
      { name: 'Laravel (Blade), Symfony (Twig)', icon: faLaravel, level: 70 },
      { name: 'Vue (Vuex)', icon: faVuejs, level: 60 },
      { name: 'Angular', icon: faAngular, level: 40 },
    ].sort((a, b) => b.level - a.level),
    links: [
      {
        url: 'https://github.com/stevenvo780/tertulialiteraria-frond',
        icon: faReact,
      },
      {
        url: 'https://github.com/stevenvo780/TemplateReactBigAPP',
        icon: faReact,
      },
    ],
  },
  {
    category: 'DevOps y Cloud',
    items: [
      { name: 'Git, GitHub, BitBucket, GitLab', icon: faGithub, level: 95 },
      { name: 'Hosting con Linux', icon: faServer, level: 85 },
      { name: 'Google Cloud', icon: faCloud, level: 80 },
      { name: 'Vercel', icon: faCloud, level: 75 },
      { name: 'CI/CD Pipelines, GitHub Actions', icon: faCogs, level: 65 },
      { name: 'AWS', icon: faCloud, level: 60 },
      { name: 'Docker', icon: faDocker, level: 55 },
      { name: 'RabbitMQ, Apache Kafka', icon: faServer, level: 40 },
      { name: 'Azure', icon: faCloud, level: 25 },
    ].sort((a, b) => b.level - a.level),
    links: [],
  },
  {
    category: 'Bases de Datos',
    items: [
      { name: 'Relacionales (MariaDB, SQL Server, PostgreSQL)', icon: faDatabase, level: 85 },
      { name: 'NoSQL (MongoDB, Firebase)', icon: faDatabase, level: 85 },
      { name: 'Grafos (Neo4j)', icon: faDatabase, level: 80 },
      { name: 'In-Memory (Redis)', icon: faDatabase, level: 55 },
      { name: 'DynamoDB', icon: faDatabase, level: 30 },
    ].sort((a, b) => b.level - a.level),
    links: [],
  },
  {
    category: 'Inteligencia Artificial y Machine Learning',
    items: [
      { name: 'Numpy, Wolfram Alpha, PNL', icon: faBrain, level: 75 },
      { name: 'TensorFlow, PyTorch', icon: faBrain, level: 60 },
      { name: 'Hugging Face (LLAMA, GPT-2 y GPT-3)', icon: faNetworkWired, level: 65 },
      { name: 'Stable Diffusion avanzado', icon: faImage, level: 60 },
    ].sort((a, b) => b.level - a.level),
    links: [
      {
        url: 'https://github.com/stevenvo780/emergentismo-tesis',
        icon: faPython,
      },
      {
        url: 'https://github.com/stevenvo780/emergencia-juego-de-conwey',
        icon: faPython,
      },
    ],
  },
  {
    category: 'Herramientas de IA',
    items: [
      { name: 'ChatGPT', icon: faBrain, level: 90 },
      { name: 'GitHub Copilot, TabNine', icon: faGithub, level: 85 },
      { name: 'Google Cloud AI', icon: faCloud, level: 70 },
    ].sort((a, b) => b.level - a.level),
    links: [],
  },
  {
    category: 'Desarrollo de Videojuegos',
    items: [
      { name: 'C# Unity 3D', icon: faUnity, level: 80 },
      {
        name: 'Realidad virtual (Oculus, HTC VIVE) y aumentada (Vuforia)',
        icon: faGamepad,
        level: 70,
      },
      { name: 'Roblox', icon: faGamepad, level: 65 },
      { name: 'Decentraland', icon: faGamepad, level: 60 },
    ].sort((a, b) => b.level - a.level),
    links: [],
  },
  {
    category: 'Planeación y Gestión de Proyectos',
    items: [
      { name: 'SCRUM, KANBAN, LEAN', icon: faPencilRuler, level: 85 },
      { name: 'Trello, JIRA, ClickUp', icon: faProjectDiagram, level: 70 },
      { name: 'TDD, UML', icon: faPencilRuler, level: 70 },
    ].sort((a, b) => b.level - a.level),
    links: [],
  },
];
