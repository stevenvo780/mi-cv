'use client';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { useTranslate } from '@/utils/translate';

const cvDownloads = [
  { key: 'about.cv.tech.es', href: '/pdf/CV_tech_es.pdf' },
  { key: 'about.cv.tech.en', href: '/pdf/CV_tech_en.pdf' },
  { key: 'about.cv.filo.es', href: '/pdf/CV_filo_es.pdf' },
  { key: 'about.cv.filo.en', href: '/pdf/CV_filo_en.pdf' },
];

export default function About() {
  const t = useTranslate();

  return (
    <section className="mb-5">
      <Container>
        <h3 className="border-bottom pb-2 mb-4">{t('about.title')}</h3>
        <Row>
          <Col lg={10} xl={9}>
            <p className="lead" style={{ color: 'var(--text)', fontSize: '1.2rem' }}>
              {t('about.lead')}
            </p>
            <p>{t('about.p1')}</p>
            <p>{t('about.p2')}</p>
            <p>{t('about.p3')}</p>
            <p>{t('about.p4')}</p>
            <p>{t('about.p5')}</p>
          </Col>
        </Row>
        <div className="mt-4">
          <h4 className="h5 mb-3">{t('about.cv.title')}</h4>
          <div className="d-flex flex-wrap gap-2">
            {cvDownloads.map((cv) => (
              <a key={cv.href} href={cv.href} download>
                <Button variant="outline-primary" className="d-inline-flex align-items-center">
                  <FontAwesomeIcon icon={faDownload} className="me-2" />
                  {t(cv.key)}
                </Button>
              </a>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
