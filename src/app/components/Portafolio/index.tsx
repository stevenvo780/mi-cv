'use client';
import React from 'react';
import { Container, Card, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub';
import { faCloud, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { portfolioCategories } from './common';
import { useTranslate } from '@/utils/translate';
import dynamic from 'next/dynamic';
const LorenzAttractor = dynamic(() => import('../Matematica/LorenzAttractor'), { ssr: false });

export default function Portfolio() {
  const t = useTranslate();

  return (
    <section className="mb-5">
      <Container>
        <h3 className="border-bottom pb-2 mb-4">{t('portfolio.title')}</h3>
        <Row className="mb-5">
          <Col md={6}>
            <p className="mb-4">{t('portfolio.intro')}</p>
            <p className="mb-4" style={{ textAlign: 'justify' }}>
              <strong>{t('portfolio.opensource')}</strong>
            </p>
            <Row className="mb-5">
              <Col md={6}>
                <a
                  href="https://github.com/stevenvo780"
                  target="_blank"
                  rel="noreferrer"
                  className="text-decoration-none"
                >
                  <Card className="h-100 text-center shadow-sm">
                    <Card.Body>
                      <FontAwesomeIcon icon={faGithub} size="3x" className="mb-3 text-dark" />
                      <Card.Title>{t('portfolio.github')}</Card.Title>
                    </Card.Body>
                    <Card.Footer className="d-flex justify-content-end">
                      <FontAwesomeIcon icon={faArrowRight} />
                    </Card.Footer>
                  </Card>
                </a>
              </Col>
              <Col md={6}>
                <a
                  href="https://mega.nz/folder/dLZwHCAL#A4xL0DJDmbkOej5uDP96xg"
                  target="_blank"
                  rel="noreferrer"
                  className="text-decoration-none"
                >
                  <Card className="h-100 text-center shadow-sm">
                    <Card.Body>
                      <FontAwesomeIcon icon={faCloud} size="3x" className="mb-3 text-dark" />
                      <Card.Title>{t('portfolio.mega')}</Card.Title>
                    </Card.Body>
                    <Card.Footer className="d-flex justify-content-end">
                      <FontAwesomeIcon icon={faArrowRight} />
                    </Card.Footer>
                  </Card>
                </a>
              </Col>
            </Row>
          </Col>
          <Col md={6}>
            <LorenzAttractor />
          </Col>
        </Row>

        {portfolioCategories.map((category, index) => (
          <div
            key={index}
            className="mb-5"
            style={{ border: '2px solid #e9ecef', borderRadius: '10px', padding: '20px' }}
          >
            <h4 className="mb-4">{t(category.name)}</h4>
            <Row>
              {category.projects
                .filter((project) => project.important)
                .map((project, idx) => (
                  <Col md={6} lg={4} key={idx} className="mb-4">
                    <a href={project.link} target="_blank" rel="noreferrer" className="text-decoration-none">
                      <Card className="h-100 shadow-sm" style={{ minHeight: '120px', padding: '10px' }}>
                        <Card.Body className="d-flex align-items-center">
                          {project.icon && (
                            <FontAwesomeIcon icon={project.icon} size="2x" className="me-3" />
                          )}
                          <div>
                            <Card.Title className="mb-1">{t(project.name)}</Card.Title>
                            <Card.Text className="text-muted small mb-0">{t(project.description)}</Card.Text>
                          </div>
                        </Card.Body>
                      </Card>
                    </a>
                  </Col>
                ))}
            </Row>
            {category.projects.some((project) => !project.important) && (
              <>
                <h5 className="mt-4">{t('portfolio.otherProjects')}</h5>
                <Row>
                  {category.projects
                    .filter((project) => !project.important)
                    .map((project, idx) => (
                      <Col md={6} lg={4} key={idx} className="mb-4">
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-decoration-none"
                        >
                          <Card
                            className="h-100 shadow-sm"
                            style={{ minHeight: '100px', borderRadius: '10px', padding: '0px' }}
                          >
                            <Card.Body className="d-flex align-items-center">
                              <FontAwesomeIcon icon={faGithub} className="me-3" />
                              <div>
                                <Card.Title className="mb-1">{t(project.name)}</Card.Title>
                                {project.description && (
                                  <Card.Text className="text-muted small mb-0">
                                    {t(project.description)}
                                  </Card.Text>
                                )}
                              </div>
                            </Card.Body>
                          </Card>
                        </a>
                      </Col>
                    ))}
                </Row>
              </>
            )}
          </div>
        ))}
      </Container>
    </section>
  );
}
