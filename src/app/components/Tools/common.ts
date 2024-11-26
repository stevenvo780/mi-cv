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
    category: 'tools.backendDevelopment',
    items: [
      { name: 'tools.item.nodejs', icon: faNodeJs, level: 95 },
      { name: 'tools.item.typescript', icon: faCode, level: 95 },
      { name: 'tools.item.nestjs', icon: faCode, level: 90 },
      { name: 'tools.item.hapi', icon: faCode, level: 85 },
      { name: 'tools.item.python', icon: faPython, level: 80 },
      { name: 'tools.item.express', icon: faCode, level: 75 },
      { name: 'tools.item.php', icon: faPhp, level: 75 },
      { name: 'tools.item.laravel', icon: faLaravel, level: 70 },
      { name: 'tools.item.symfony', icon: faPhp, level: 70 },
      { name: 'tools.item.slim', icon: faPhp, level: 60 },
      { name: 'tools.item.bash', icon: faCode, level: 65 },
      { name: 'tools.item.dotnet', icon: faCode, level: 45 },
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
    category: 'tools.frontendDevelopment',
    items: [
      { name: 'tools.item.reactjs', icon: faReact, level: 95 },
      { name: 'tools.item.javascript', icon: faJsSquare, level: 90 },
      { name: 'tools.item.html', icon: faHtml5, level: 85 },
      { name: 'tools.item.css3', icon: faCss3Alt, level: 80 },
      { name: 'tools.item.nextjs', icon: faReact, level: 75 },
      { name: 'tools.item.reactNative', icon: faReact, level: 75 },
      { name: 'tools.item.laravelBlade', icon: faLaravel, level: 70 },
      { name: 'tools.item.vuejs', icon: faVuejs, level: 60 },
      { name: 'tools.item.angular', icon: faAngular, level: 40 },
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
    category: 'tools.devopsAndCloud',
    items: [
      { name: 'tools.item.git', icon: faGithub, level: 95 },
      { name: 'tools.item.linuxHosting', icon: faServer, level: 85 },
      { name: 'tools.item.googleCloud', icon: faCloud, level: 80 },
      { name: 'tools.item.vercel', icon: faCloud, level: 75 },
      { name: 'tools.item.cicd', icon: faCogs, level: 65 },
      { name: 'tools.item.aws', icon: faCloud, level: 60 },
      { name: 'tools.item.docker', icon: faDocker, level: 55 },
      { name: 'tools.item.rabbitmq', icon: faServer, level: 40 },
      { name: 'tools.item.azure', icon: faCloud, level: 25 },
    ].sort((a, b) => b.level - a.level),
    links: [],
  },
  {
    category: 'tools.databases',
    items: [
      { name: 'tools.item.relationalDB', icon: faDatabase, level: 85 },
      { name: 'tools.item.nosql', icon: faDatabase, level: 85 },
      { name: 'tools.item.graphDB', icon: faDatabase, level: 80 },
      { name: 'tools.item.inMemory', icon: faDatabase, level: 55 },
      { name: 'tools.item.dynamodb', icon: faDatabase, level: 30 },
    ].sort((a, b) => b.level - a.level),
    links: [],
  },
  {
    category: 'tools.aiAndMachineLearning',
    items: [
      { name: 'tools.item.numpy', icon: faBrain, level: 75 },
      { name: 'tools.item.tensorflow', icon: faBrain, level: 60 },
      { name: 'tools.item.huggingface', icon: faNetworkWired, level: 65 },
      { name: 'tools.item.stableDiffusion', icon: faImage, level: 60 },
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
    category: 'tools.aiTools',
    items: [
      { name: 'tools.item.chatgpt', icon: faBrain, level: 90 },
      { name: 'tools.item.githubCopilot', icon: faGithub, level: 85 },
      { name: 'tools.item.googleCloudAI', icon: faCloud, level: 70 },
    ].sort((a, b) => b.level - a.level),
    links: [],
  },
  {
    category: 'tools.gameDevelopment',
    items: [
      { name: 'tools.item.unity', icon: faUnity, level: 80 },
      { name: 'tools.item.vrAndAR', icon: faGamepad, level: 70 },
      { name: 'tools.item.roblox', icon: faGamepad, level: 65 },
      { name: 'tools.item.decentraland', icon: faGamepad, level: 60 },
    ].sort((a, b) => b.level - a.level),
    links: [],
  },
  {
    category: 'tools.projectManagement',
    items: [
      { name: 'tools.item.scrum', icon: faPencilRuler, level: 85 },
      { name: 'tools.item.trello', icon: faProjectDiagram, level: 70 },
      { name: 'tools.item.tdd', icon: faPencilRuler, level: 70 },
    ].sort((a, b) => b.level - a.level),
    links: [],
  },
];
