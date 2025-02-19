'use client';
import { Container, Row, Col } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import { useTranslate } from '@/utils/translate';

const MandelbrotSet = dynamic(() => import('./Matematica/MandelbrotSet'), {
  ssr: false,
});

export default function Skills() {
  const t = useTranslate();

  return (
    <section className="mb-5">
      <Container>
        <h3 className="border-bottom pb-2 mb-4">{t('skills.title')}</h3>
        <Row>
          <Col md={6}>
            <p>{t('skills.education')}</p>
            <p>{t('skills.passion')}</p>
            <p>{t('skills.mind')}</p>
            <p>{t('skills.ethics')}</p>
            <p>{t('skills.study')}</p>
          </Col>
          <Col md={6}>
            <MandelbrotSet />
          </Col>
        </Row>
      </Container>
    </section>
  );
}
