'use client';
import React from 'react';
import { Container, Card, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { portfolioCategories } from './common';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub';
import { faCloud } from '@fortawesome/free-solid-svg-icons';
import LorenzAttractor from '../LorenzAttractor';

export default function Portfolio() {
  return (
    <section className="mb-5">
      <Container>
        <h3 className="text-primary border-bottom pb-2 mb-4">Portafolio</h3>
        <Row className="mb-5">
          <Col md={6}>
            <p className="mb-4">
              Te muestro mis proyectos a lo largo de mi vida. Soy polifacético y me gustan mucho más las ciencias, la filosofía y la tecnología, así que he realizado proyectos de todo tipo. Espero que te puedan servir o al menos que puedas conocerme a través de ellos.
            </p>
            Puedes ver la galería de todos mis proyectos aquí
            <div className="d-flex">
              <a
                href="https://github.com/tu-usuario"
                target="_blank"
                rel="noreferrer"
                className="me-3"
              >
                <FontAwesomeIcon
                  icon={faGithub}
                  size="2x"
                  className="text-dark"
                />
              </a>
              <a
                href="https://mega.nz/tu-galeria"
                target="_blank"
                rel="noreferrer"
              >
                <FontAwesomeIcon icon={faCloud} size="2x" className="text-dark" />
              </a>
            </div>
          </Col>
          <Col md={6}>
            <LorenzAttractor />
          </Col>
        </Row>
        {portfolioCategories.map((category, index) => (
          <div key={index} className="mb-5">
            <h4 className="mb-4">
              <FontAwesomeIcon
                icon={category.icon as IconProp}
                className="me-2 text-primary"
              />
              {category.name}
            </h4>
            <Row>
              {category.projects
                .filter((project) => project.important)
                .map((project, idx) => (
                  <Col md={6} lg={4} key={idx} className="mb-4">
                    <Card className="h-100 shadow-sm">
                      <Card.Body>
                        {project.icon && (
                          <FontAwesomeIcon
                            icon={project.icon}
                            size="2x"
                            className="mb-3 text-primary"
                          />
                        )}
                        <Card.Title>{project.name}</Card.Title>
                        <Card.Text>{project.description}</Card.Text>
                      </Card.Body>
                      <Card.Footer>
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-decoration-none"
                        >
                          Ver proyecto
                        </a>
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
            </Row>
            {category.projects.some((project) => !project.important) && (
              <>
                <h5 className="mt-4">Otros proyectos</h5>
                <ul className="list-unstyled">
                  {category.projects
                    .filter((project) => !project.important)
                    .map((project, idx) => (
                      <li key={idx} className="mb-2">
                        <FontAwesomeIcon
                          icon={faGithub}
                          className="me-2 text-secondary"
                        />
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-decoration-none"
                        >
                          {project.name}
                        </a>
                        {project.description && (
                          <p className="mb-0 text-muted small">
                            {project.description}
                          </p>
                        )}
                      </li>
                    ))}
                </ul>
              </>
            )}
          </div>
        ))}
      </Container>
    </section>
  );
}
