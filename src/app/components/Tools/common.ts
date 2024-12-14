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
    category: 'tools.category.backendDevelopment',
    items: [
      { name: 'nodejs', icon: faNodeJs, level: 95 },
      { name: 'typescript', icon: faCode, level: 95 },
      { name: 'nestjs', icon: faCode, level: 90 },
      { name: 'hapi', icon: faCode, level: 85 },
      { name: 'python', icon: faPython, level: 80 },
      { name: 'express', icon: faCode, level: 75 },
      { name: 'php', icon: faPhp, level: 75 },
      { name: 'laravel', icon: faLaravel, level: 70 },
      { name: 'symfony', icon: faPhp, level: 70 },
      { name: 'slim', icon: faPhp, level: 60 },
      { name: 'bash', icon: faCode, level: 65 },
      { name: 'dotnet', icon: faCode, level: 45 },
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
    category: 'tools.category.frontendDevelopment',
    items: [
      { name: 'reactjs', icon: faReact, level: 95 },
      { name: 'javascript', icon: faJsSquare, level: 90 },
      { name: 'html', icon: faHtml5, level: 85 },
      { name: 'css3', icon: faCss3Alt, level: 80 },
      { name: 'nextjs', icon: faReact, level: 75 },
      { name: 'reactNative', icon: faReact, level: 75 },
      { name: 'laravelBlade', icon: faLaravel, level: 70 },
      { name: 'vuejs', icon: faVuejs, level: 60 },
      { name: 'angular', icon: faAngular, level: 40 },
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
    category: 'tools.category.devopsAndCloud',
    items: [
      { name: 'git', icon: faGithub, level: 95 },
      { name: 'linuxHosting', icon: faServer, level: 85 },
      { name: 'googleCloud', icon: faCloud, level: 80 },
      { name: 'vercel', icon: faCloud, level: 75 },
      { name: 'cicd', icon: faCogs, level: 65 },
      { name: 'aws', icon: faCloud, level: 60 },
      { name: 'docker', icon: faDocker, level: 55 },
      { name: 'rabbitmq', icon: faServer, level: 40 },
      { name: 'azure', icon: faCloud, level: 25 },
    ].sort((a, b) => b.level - a.level),
    links: [],
  },
  {
    category: 'tools.category.databases',
    items: [
      { name: 'relationalDB', icon: faDatabase, level: 85 },
      { name: 'nosql', icon: faDatabase, level: 85 },
      { name: 'graphDB', icon: faDatabase, level: 80 },
      { name: 'inMemory', icon: faDatabase, level: 55 },
      { name: 'dynamodb', icon: faDatabase, level: 30 },
    ].sort((a, b) => b.level - a.level),
    links: [],
  },
  {
    category: 'tools.category.aiAndMachineLearning',
    items: [
      { name: 'numpy', icon: faBrain, level: 75 },
      { name: 'tensorflow', icon: faBrain, level: 60 },
      { name: 'huggingface', icon: faNetworkWired, level: 65 },
      { name: 'stableDiffusion', icon: faImage, level: 60 },
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
    category: 'tools.category.aiTools',
    items: [
      { name: 'chatgpt', icon: faBrain, level: 90 },
      { name: 'githubCopilot', icon: faGithub, level: 85 },
      { name: 'googleCloudAI', icon: faCloud, level: 70 },
    ].sort((a, b) => b.level - a.level),
    links: [],
  },
  {
    category: 'tools.category.gameDevelopment',
    items: [
      { name: 'unity', icon: faUnity, level: 80 },
      { name: 'vrAndAR', icon: faGamepad, level: 70 },
      { name: 'roblox', icon: faGamepad, level: 65 },
      { name: 'decentraland', icon: faGamepad, level: 60 },
    ].sort((a, b) => b.level - a.level),
    links: [],
  },
  {
    category: 'tools.category.projectManagement',
    items: [
      { name: 'scrum', icon: faPencilRuler, level: 85 },
      { name: 'trello', icon: faProjectDiagram, level: 70 },
      { name: 'tdd', icon: faPencilRuler, level: 70 },
    ].sort((a, b) => b.level - a.level),
    links: [],
  },
];
