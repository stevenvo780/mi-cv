import humanizarImg from '@/public/images/Humanizar.png';
import tertuliaImg from '@/public/images/Tertulia.jpg';
import totalPedidoImg from '@/public/images/TotalPedido.png';
import meraVueltaImg from '@/public/images/MeraVuelta.png';
import emwImg from '@/public/images/EMW.png';
import LogoIndie from '@/public/images/LogoIndie.svg';
import { AchievementItem } from './types';

export const achievements: AchievementItem[] = [
  {
    name: 'Indie Levels',
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
    description: 'achievements.description.humanizar',
    link: 'https://www.humanizar.co/',
    image: humanizarImg,
    imageWidth: 300,
    imageHeight: 200,
    backgroundColor: 'transparent',
    col: 4,
  },
  {
    name: 'Tertulia Literaria',
    description: 'achievements.description.tertuliaLiteraria',
    link: 'https://www.tertulia-literaria.com/',
    image: tertuliaImg,
    imageWidth: 300,
    imageHeight: 200,
    backgroundColor: 'transparent',
    col: 4,
  },
  {
    name: 'Total Pedido - Demo',
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
    description: 'achievements.description.jarvis',
    link: 'https://github.com/stevenvo780/jarvisIA',
    isCustom: true,
    backgroundColor: 'transparent',
    col: 4,
  },
];
