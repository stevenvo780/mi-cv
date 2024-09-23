import { Container } from 'react-bootstrap';

export default function Skills() {
  return (
    <section className="mb-5">
      <Container>
        <h3 className=" border-bottom pb-2 mb-4">Aptitudes y Habilidades</h3>
        <ul>
          <li>Desarrollo Full Stack: Node.js, React, TypeScript</li>
          <li>Infraestructura: AWS, Docker, CI/CD</li>
          <li>Inteligencia Artificial: TensorFlow, PyTorch</li>
          <li>Desarrollo de videojuegos: Unity 3D, VR/AR</li>
          <li>DevOps y Automatización: Linux avanzado, Git, Cloud</li>
        </ul>
      </Container>
    </section>
  );
}
