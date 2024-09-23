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
  faNetworkWired,
  faImage,
  faCloud,
  faBook,
  faLightbulb, // Íconos adicionales para proyectos
} from '@fortawesome/free-solid-svg-icons';
import { ToolCategory } from './types';

export const tools: ToolCategory[] = [
  {
    category: 'FrontEnd',
    items: [
      { name: 'HTML', icon: faHtml5, level: 95 },
      { name: 'ReactJS (Redux y sagas), Angular, Vue (Vuex)', icon: faReact, level: 88 },
      { name: 'JavaScript y SASS', icon: faJsSquare, level: 85 },
      { name: 'React Native, Next.js', icon: faReact, level: 85 },
      { name: 'CSS3 (Bootstrap, MaterialUI, Bulma)', icon: faCss3Alt, level: 80 },
      { name: 'Laravel (Blade), Symfony (Twig)', icon: faLaravel, level: 70 },
    ].sort((a, b) => b.level - a.level),
    links: [
      { url: 'https://proyecto-frontend.com', icon: faLightbulb },
      { url: 'https://frontend-docs.com', icon: faBook },
    ],
  },
  {
    category: 'DevOps',
    items: [
      { name: 'Git, GitHub, BitBucket, GitLab', icon: faGithub, level: 95 },
      { name: 'Google Cloud avanzado, AWS Cloud', icon: faAws, level: 90 },
      { name: 'Docker', icon: faDocker, level: 85 },
      { name: 'CI/CD Pipelines, GitHub Actions', icon: faCogs, level: 85 },
      { name: 'Hosting tradicional, Vercel', icon: faServer, level: 75 },
      { name: 'RabbitMQ, Apache Kafka', icon: faServer, level: 65 },
    ].sort((a, b) => b.level - a.level),
    links: [
      { url: 'https://proyecto-devops.com', icon: faCloud },
      { url: 'https://devops-tutorials.com', icon: faBook },
    ],
  },
  {
    category: 'BackEnd',
    items: [
      { name: 'Node.js (TypeScript, Express, Hapi, NestJS)', icon: faNodeJs, level: 90 },
      { name: 'PHP (SLIM, Laravel, Symfony)', icon: faPhp, level: 85 },
      { name: 'Python', icon: faPython, level: 75 },
      { name: '.NET y Bash', icon: faCode, level: 65 },
    ].sort((a, b) => b.level - a.level),
    links: [
      { url: 'https://proyecto-backend.com', icon: faLightbulb },
      { url: 'https://backend-docs.com', icon: faBook },
    ],
  },
  {
    category: 'Herramientas de IA',
    items: [
      { name: 'ChatGPT', icon: faBrain, level: 90 },
      { name: 'GitHub Copilot, TabNine', icon: faGithub, level: 85 },
      { name: 'Stable Diffusion avanzado', icon: faImage, level: 60 },
      { name: 'Hugging Face (LLAMA, GPT-2 y GPT-3)', icon: faNetworkWired, level: 65 },
    ].sort((a, b) => b.level - a.level),
    links: [
      { url: 'https://proyecto-ai.com', icon: faLightbulb },
      { url: 'https://ai-docs.com', icon: faBook },
    ],
  },
  {
    category: 'Planeación',
    items: [
      { name: 'Trello, JIRA, ClickUp', icon: faProjectDiagram, level: 90 },
      { name: 'SCRUM, KANBAN, LEAN', icon: faPencilRuler, level: 85 },
      { name: 'TDD, UML', icon: faPencilRuler, level: 70 },
    ].sort((a, b) => b.level - a.level),
    links: [
      { url: 'https://proyecto-plan.com', icon: faLightbulb },
      { url: 'https://plan-docs.com', icon: faBook },
    ],
  },
  {
    category: 'Bases de datos',
    items: [
      { name: 'MongoDB, MariaDB', icon: faDatabase, level: 85 },
      { name: 'SQL Server, Neo4j, PostgreSQL, Firebase', icon: faDatabase, level: 80 },
    ].sort((a, b) => b.level - a.level),
    links: [
      { url: 'https://proyecto-db.com', icon: faLightbulb },
      { url: 'https://db-docs.com', icon: faBook },
    ],
  },
  {
    category: 'Inteligencia Artificial',
    items: [
      { name: 'Numpy, Wolfram Alpha, PNL', icon: faCode, level: 75 },
      { name: 'TensorFlow, PyTorch', icon: faBrain, level: 60 },
    ].sort((a, b) => b.level - a.level),
    links: [
      { url: 'https://proyecto-ai-2.com', icon: faLightbulb },
      { url: 'https://ai2-docs.com', icon: faBook },
    ],
  },
  {
    category: 'Videojuegos',
    items: [
      { name: 'C# Unity 3D', icon: faUnity, level: 80 },
      { name: 'Realidad virtual con Oculus HTC VIVE, realidad aumentada con Vuforia', icon: faGamepad, level: 70 },
    ].sort((a, b) => b.level - a.level),
    links: [
      { url: 'https://proyecto-games.com', icon: faLightbulb },
      { url: 'https://games-docs.com', icon: faBook },
    ],
  },
];
