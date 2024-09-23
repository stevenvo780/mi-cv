'use client';
import { Container, Row, Col, Card } from 'react-bootstrap';
import humanizarImg from '@/public/Humanizar.png';
import tertuliaImg from '@/public/Tertulia.jpg';
import totalPedidoImg from '@/public/TotalPedido.png';
import meraVueltaImg from '@/public/MeraVuelta.png';
import emwImg from '@/public/EMW.png';
import { StaticImageData } from 'next/image';
import Jarvis from './Jarvis';

interface AchievementItem {
  name: string;
  description: string;
  link: string;
  image?: StaticImageData | string;
  tier: 'gold' | 'platinum' | 'silver';
  isCustom?: boolean;
  imageWidth?: number;
  imageHeight?: number;
  backgroundColor?: string;
}

const achievements: AchievementItem[] = [
  {
    name: 'Humanizar',
    description: 'Plataforma de software para gestión de recursos humanos',
    link: 'https://www.humanizar.co/',
    image: humanizarImg,
    tier: 'gold',
    imageWidth: 300,
    imageHeight: 200,
    backgroundColor: 'transparent', // Fondo transparente
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

const tierColors: { [key in AchievementItem['tier']]: string } = {
  gold: '#FFD700',
  platinum: '#a51a41',
  silver: '#C0C0C0',
};

export default function Achievements() {
  return (
    <section className="mb-5">
      <Container>
        <h3 className="border-bottom pb-2 mb-4">Proyectos</h3>
        <Row>
          {achievements.map((item, index) => (
            <Col key={index} md={4} className="mb-4">
              <a href={item.link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <Card
                  style={{
                    borderColor: tierColors[item.tier],
                    borderWidth: '2px',
                    height: '100%',
                    backgroundColor: 'transparent',
                  }}
                >
                  {item.isCustom ? (
                    <Jarvis />
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: item.backgroundColor || 'transparent',
                        height: item.imageHeight || '200px',
                        width: '100%',
                      }}
                    >
                      <Card.Img
                        variant="top"
                        src={typeof item.image === 'string' ? item.image : item.image?.src}
                        alt={item.name}
                        style={{
                          objectFit: 'contain',
                          maxWidth: item.imageWidth || '100%',
                          maxHeight: item.imageHeight || '200px',
                        }}
                      />
                    </div>
                  )}
                  <Card.Body style={{ minHeight: '150px', position: 'relative' }}>
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>{item.description}</Card.Text>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline-primary"
                      style={{ position: 'absolute', bottom: '10px', left: '10px' }}
                    >
                      Ver más
                    </a>
                  </Card.Body>
                </Card>
              </a>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}
