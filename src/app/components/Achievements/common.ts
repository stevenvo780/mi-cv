import humanizarImg from '@/public/images/Humanizar.png';
import cafeteriaDelCaosImg from '@/public/images/CafeteriaDelCaos.png';
import totalPedidoImg from '@/public/images/TotalPedido.png';
import meraVueltaImg from '@/public/images/MeraVuelta.png';
import emwImg from '@/public/images/EMW.png';
import LogoIndie from '@/public/images/LogoIndie.svg';
import { AchievementItem } from './types';

export const achievements: AchievementItem[] = [
  {
    name: 'Indie Levels',
    key: 'indieLevels',
    description: 'achievements.description.indieLevels',
    link: 'https://indielevelstudio.com',
    image: LogoIndie,
    imageWidth: 900,
    imageHeight: 300,
    backgroundColor: 'black',
    isCustom: false,
    col: 12,
  },
  {
    name: 'Humanizar',
    key: 'humanizar',
    description: 'achievements.description.humanizar',
    link: 'https://www.humanizar.co/',
    image: humanizarImg,
    imageWidth: 300,
    imageHeight: 200,
    backgroundColor: 'transparent',
    col: 4,
  },
  {
    name: 'Cafeteria del caos',
    key: 'cafeteriaDelCaos',
    description: 'achievements.description.cafeteriadelcaos',
    link: 'https://www.cafeteriadelcaos.com/',
    image: cafeteriaDelCaosImg,
    imageWidth: 300,
    imageHeight: 200,
    backgroundColor: 'transparent',
    col: 4,
  },
  {
    name: 'Total Pedido - Demo',
    key: 'totalPedido',
    description: 'achievements.description.totalPedido',
    link: 'https://total-pedidos-front.vercel.app/',
    image: totalPedidoImg,
    imageWidth: 300,
    imageHeight: 200,
    backgroundColor: 'transparent',
    col: 4,
  },
  {
    name: 'Mera Vuelta',
    key: 'meraVuelta',
    description: 'achievements.description.meraVuelta',
    link: 'https://www.meravuelta.com/',
    image: meraVueltaImg,
    imageWidth: 300,
    imageHeight: 200,
    backgroundColor: 'transparent',
    col: 4,
  },
  {
    name: 'EMW',
    key: 'emw',
    description: 'achievements.description.emw',
    link: 'https://emw.humanizar.cloud/',
    image: emwImg,
    imageWidth: 300,
    imageHeight: 200,
    backgroundColor: 'transparent',
    col: 4,
  },
  {
    name: 'Proyecto JARVIS',
    key: 'jarvis',
    description: 'achievements.description.jarvis',
    link: 'https://jarvis-web-seven.vercel.app/',
    isCustom: true,
    backgroundColor: 'transparent',
    col: 4,
  },
];
