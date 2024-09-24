'use client';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { achievements } from './common';
import dynamic from 'next/dynamic';
const Jarvis = dynamic(() => import('@/app/components/Matematica/Jarvis'), {
  ssr: false,
});

export default function Achievements() {
  return (
    <section className="mb-5">
      <Container>
        <h3 className="border-bottom pb-2 mb-4">Proyectos</h3>
        <Row>
          {achievements.map((item, index) => (
            <Col key={index} md={item.col} className="mb-4">
              <a href={item.link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <Card
                  style={{
                    borderColor: '#9B8E7E',
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
                          padding: '15px',
                        }}
                      />
                    </div>
                  )}
                  <Card.Body style={{ minHeight: '150px', position: 'relative' }}>
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>{item.description}</Card.Text>
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        fontSize: '24px',
                        color: '#6c757d',
                      }}
                    >
                      <FontAwesomeIcon icon={faArrowRight} />
                    </div>
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
