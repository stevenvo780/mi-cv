"use client";
import { Container, Row, Col, Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { useTranslate } from '@/utils/translate';
import { experiences } from './common';

export default function Experience() {
  const t = useTranslate();

  return (
    <section className="mb-5">
      <Container>
        <h3 className="border-bottom pb-2 mb-4">
          {t('experience.title')}
        </h3>
        <Row>
          {experiences.map((item) => (
            <Col key={item.key} md={item.col} className="mb-3">
              <Card style={{ backgroundColor: 'transparent' }}>
                <Card.Body>
                  <Card.Title>{t(`experience.${item.key}`)}</Card.Title>
                  <Card.Text>
                    <div>{t(`experience.role.${item.key}`)}</div>
                    <div>
                      {t(`experience.dates.${item.key}`)}{' '}
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-description-${item.key}`}>
                            {t(`experience.location.${item.key}`)}
                          </Tooltip>
                        }
                      >
                        <span style={{ cursor: 'pointer' }}>
                          <FontAwesomeIcon icon={faInfoCircle} />
                        </span>
                      </OverlayTrigger>
                    </div>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}
