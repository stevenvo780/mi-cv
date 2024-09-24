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
    description: 'Estudio de videojuegos ubicado en Medellín - Colombia, con un equipo de profesionales dedicados al desarrollo de videojuegos de alta calidad para empresas de todo el mundo.',
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
    description: 'Proyecto para mejorar la capacidad productiva de las empresas y con esto mejorar la calidad de vida de los trabajadores y la sociedad en general',
    link: 'https://www.humanizar.co/',
    image: humanizarImg,
    imageWidth: 300,
    imageHeight: 200,
    backgroundColor: 'transparent',
    col: 4,
  },
  {
    name: 'Tertulia Literaria',
    description: 'La mas grande comunidad de Literatura, filosofía, ciencia y artes de Discord',
    link: 'https://www.tertulia-literaria.com/',
    image: tertuliaImg,
    imageWidth: 300,
    imageHeight: 200,
    backgroundColor: 'transparent',
    col: 4,
  },
  {
    name: 'Total Pedido - Demo',
    description: 'Plataforma de Ecommerce robusta y escalable',
    link: 'https://total-pedidos-front.vercel.app/',
    image: totalPedidoImg,
    imageWidth: 300,
    imageHeight: 200,
    backgroundColor: 'transparent',
    col: 4,
  },
  {
    name: 'Mera Vuelta',
    description: 'Aplicación para servicios de transporte en Antioquia',
    link: 'https://www.meravuelta.com/',
    image: meraVueltaImg,
    imageWidth: 300,
    imageHeight: 200,
    backgroundColor: 'transparent',
    col: 4,
  },
  {
    name: 'EMW',
    description: 'Solución empresarial para monitoreo de rendimiento',
    link: 'https://emw.humanizar.cloud/',
    image: emwImg,
    imageWidth: 300,
    imageHeight: 200,
    backgroundColor: 'transparent',
    col: 4,
  },
  {
    name: 'Proyecto JARVIS',
    description: 'Asistente virtual basado en IA',
    link: 'https://github.com/stevenvo780/jarvisIA',
    isCustom: true,
    backgroundColor: 'transparent',
    col: 4,
  },
];