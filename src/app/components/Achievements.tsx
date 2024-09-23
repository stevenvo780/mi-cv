'use client';
import { Container, Row, Col, Card } from 'react-bootstrap';
import humanizarImg from '@/public/Humanizar.png';
import tertuliaImg from '@/public/Tertulia.jpg';
import totalPedidoImg from '@/public/TotalPedido.webp';
import meraVueltaImg from '@/public/MeraVuelta.png';
import emwImg from '@/public/EMW.webp';
import { StaticImageData } from 'next/image';

// Componente personalizado para el proyecto JARVIS
function CustomJarvisImage() {
  return (
    <div
      style={{
        width: '100%',
        height: '200px',
        backgroundColor: '#000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <h5 style={{ color: '#fff' }}>Proyecto JARVIS</h5>
    </div>
  );
}

interface AchievementItem {
  name: string;
  description: string;
  link: string;
  image?: StaticImageData | string;
  tier: 'gold' | 'platinum' | 'silver';
  isCustom?: boolean;
}

const achievements: AchievementItem[] = [
  {
    name: 'Humanizar',
    description: 'Plataforma de software para gestión de recursos humanos',
    link: 'https://www.humanizar.co/',
    image: humanizarImg,
    tier: 'gold',
  },
  {
    name: 'Tertulia Literaria Demo',
    description: 'Plataforma de eventos culturales en línea',
    link: 'https://www.tertulia-literaria.com/',
    image: tertuliaImg,
    tier: 'platinum',
  },
  {
    name: 'Total Pedido - Demo',
    description: 'Plataforma de pedidos online',
    link: 'https://total-pedidos-front.vercel.app/',
    image: totalPedidoImg,
    tier: 'silver',
  },
  {
    name: 'Mera Vuelta',
    description: 'Aplicación para servicios de transporte en Antioquia',
    link: 'https://www.meravuelta.com/',
    image: meraVueltaImg,
    tier: 'silver',
  },
  {
    name: 'EMW',
    description: 'Solución empresarial para monitoreo de rendimiento',
    link: 'https://emw.humanizar.cloud/',
    image: emwImg,
    tier: 'silver',
  },
  {
    name: 'Proyecto JARVIS',
    description: 'Asistente virtual basado en IA',
    link: 'https://github.com/stevenvo780/jarvisIA',
    tier: 'silver',
    isCustom: true,
  },
];

const tierColors: { [key in AchievementItem['tier']]: string } = {
  gold: '#FFD700',
  platinum: '#E5E4E2',
  silver: '#C0C0C0',
};

export default function Achievements() {
  return (
    <section className="mb-5">
      <Container>
        <h3 className="text-primary border-bottom pb-2 mb-4">Proyectos Destacados</h3>
        <Row>
          {achievements.map((item, index) => (
            <Col key={index} md={4} className="mb-4">
              <Card style={{ borderColor: tierColors[item.tier], borderWidth: '2px', height: '100%' }}>
                {item.isCustom ? (
                  <CustomJarvisImage />
                ) : (
                  <Card.Img
                    variant="top"
                    src={typeof item.image === 'string' ? item.image : item.image?.src}
                    alt={item.name}
                    style={{ height: '200px', objectFit: 'cover', width: '100%' }} // Estandarizar tamaño de imagen
                  />
                )}
                <Card.Body style={{ minHeight: '150px' }}> {/* Estandarizar la altura del contenido */}
                  <Card.Title>{item.name}</Card.Title>
                  <Card.Text>{item.description}</Card.Text>
                  <a href={item.link} target="_blank" rel="noreferrer" className="btn btn-outline-primary">
                    Ver más
                  </a>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}
