import { Container, Row, Col } from 'react-bootstrap';
import dynamic from 'next/dynamic';
const MandelbrotSet = dynamic(() => import('@/app/components/Matematica/MandelbrotSet'), {
  ssr: false,
});

export default function Skills() {
  return (
    <section className="mb-5">
      <Container>
        <h3 className="border-bottom pb-2 mb-4">Que habita mi mente</h3>
        <Row>
          <Col md={6}>
            <p>
              En cuanto a la <strong>mente</strong>, me inclino por una postura <strong>emergentista</strong>, donde las propiedades mentales surgen de la complejidad del cerebro y no pueden reducirse a las partes. Sobre el <strong>ser</strong>, sigo las ideas de <strong>Alain Badiou</strong>, viendo el ser como un proceso en constante cambio, siempre en relación con el evento.
            </p>
            <p>
              Éticamente, soy influenciado por <strong>Jean-Paul Sartre</strong>, adoptando una perspectiva existencialista en la que cada individuo es completamente responsable de sus acciones y debe encontrar significado en su libertad. Estéticamente, me alineo con <strong>Immanuel Kant</strong>, buscando la experiencia estética como algo universal pero profundamente personal.
            </p>
            <p>
              Dedico gran parte de mi tiempo a explorar y estudiar <strong>ontologías</strong> y el conocimiento científico. Creo firmemente que la filosofía y la ciencia no son opuestos, sino campos que se complementan para entender mejor la realidad.
            </p>
          </Col>
          <Col md={6}>
            <MandelbrotSet />
          </Col>
        </Row>
      </Container>
    </section>
  );
}
