import humanizarImg from '@/public/images/Humanizar.png';
import cafeteriaDelCaosImg from '@/public/images/CafeteriaDelCaos.png';
import agoraImg from '@/public/images/Agora.svg';
import meraVueltaImg from '@/public/images/MeraVuelta.png';
import emwImg from '@/public/images/EMW.png';
import LogoIndie from '@/public/images/LogoIndie.svg';
import CritertecImg from '@/public/images/Critertec.svg';
import SoyDigitalImg from '@/public/images/SoyDigital.svg';
import { AchievementItem } from './types';

export const achievements: AchievementItem[] = [
  {
    name: 'Critertec',
    key: 'critertec',
    description: 'achievements.description.critertec',
    link: 'https://critertec.com/',
    image: CritertecImg,
    imageWidth: 300,
    imageHeight: 200,
    backgroundColor: '#ffffff',
    isCustom: false,
    col: 6,
  },
  {
    name: 'Soy Digital',
    key: 'soyDigital',
    description: 'achievements.description.soyDigital',
    link: 'https://www.soydigital.gob.do/',
    image: SoyDigitalImg,
    imageWidth: 300,
    imageHeight: 200,
    backgroundColor: '#ffffff',
    isCustom: false,
    col: 6,
  },
  {
    name: 'Indie Levels',
    key: 'indieLevels',
    description: 'achievements.description.indieLevels',
    link: 'https://indielevelstudio.com',
    image: LogoIndie,
    imageWidth: 300,
    imageHeight: 200,
    backgroundColor: 'black',
    isCustom: false,
    col: 4,
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
    name: 'Agora Workspace',
    key: 'agora',
    description: 'achievements.description.agora',
    link: 'https://agora.elenxos.com',
    image: agoraImg,
    imageWidth: 150,
    imageHeight: 150,
    backgroundColor: 'transparent',
    col: 4,
  },
  {
    name: 'Cafeteria del caos',
    key: 'cafeteriadelcaos',
    description: 'achievements.description.cafeteriadelcaos',
    link: 'https://www.cafeteriadelcaos.com/',
    image: cafeteriaDelCaosImg,
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
];
