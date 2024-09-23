import humanizarImg from '@/public/Humanizar.png';
import tertuliaImg from '@/public/Tertulia.jpg';
import totalPedidoImg from '@/public/TotalPedido.png';
import meraVueltaImg from '@/public/MeraVuelta.png';
import emwImg from '@/public/EMW.png';
import { AchievementItem } from './types';

export const achievements: AchievementItem[] = [
  {
    name: 'Humanizar',
    description: 'Plataforma de software para gestión de recursos humanos',
    link: 'https://www.humanizar.co/',
    image: humanizarImg,
    tier: 'gold',
    imageWidth: 300,
    imageHeight: 200,
    backgroundColor: 'transparent',
  },
  {
    name: 'Tertulia Literaria Demo',
    description: 'Plataforma de eventos culturales en línea',
    link: 'https://www.tertulia-literaria.com/',
    image: tertuliaImg,
    tier: 'platinum',
    imageWidth: 300,
    imageHeight: 200,
    backgroundColor: 'transparent',
  },
  {
    name: 'Total Pedido - Demo',
    description: 'Plataforma de pedidos online',
    link: 'https://total-pedidos-front.vercel.app/',
    image: totalPedidoImg,
    tier: 'silver',
    imageWidth: 300,
    imageHeight: 200,
    backgroundColor: 'transparent',
  },
  {
    name: 'Mera Vuelta',
    description: 'Aplicación para servicios de transporte en Antioquia',
    link: 'https://www.meravuelta.com/',
    image: meraVueltaImg,
    tier: 'silver',
    imageWidth: 300,
    imageHeight: 200,
    backgroundColor: 'transparent',
  },
  {
    name: 'EMW',
    description: 'Solución empresarial para monitoreo de rendimiento',
    link: 'https://emw.humanizar.cloud/',
    image: emwImg,
    tier: 'silver',
    imageWidth: 300,
    imageHeight: 200,
    backgroundColor: 'transparent',
  },
  {
    name: 'Proyecto JARVIS',
    description: 'Asistente virtual basado en IA',
    link: 'https://github.com/stevenvo780/jarvisIA',
    tier: 'silver',
    isCustom: true,
    backgroundColor: 'transparent',
  },
];

export const tierColors: { [key in AchievementItem['tier']]: string } = {
  gold: '#FFD700',
  platinum: '#a51a41',
  silver: '#C0C0C0',
};