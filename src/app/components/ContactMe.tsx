'use client';
import React, { useRef, useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import ParticleFlow from '@/app/components/Matematica/ParticleFlow';
import emailjs from 'emailjs-com';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

export default function ContactMe() {
  const form = useRef<HTMLFormElement>(null);
  const [messageSent, setMessageSent] = useState(false);

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();

    emailjs
      .sendForm(
        'service_ulydmx7',
        'template_v2xdyl9',
        form.current!,
        'h9HkvywXkLY_wSIJw'
      )
      .then(
        (result) => {
          console.log(result.text);
          setMessageSent(true);
        },
        (error) => {
          console.log(error.text);
        }
      );
  };

  return (
    <section className="mb-5">
      <Container>
        <h3 className="border-bottom pb-2 mb-4">Contáctame</h3>
        <Row>
          <Col md={6}>
            <ParticleFlow />
          </Col>
          <Col md={6}>
            <h5>Envíame un mensaje</h5>
            {messageSent ? (
              <p className="text-success">¡Mensaje enviado con éxito!</p>
            ) : (
              <Form ref={form} onSubmit={sendEmail}>
                <Form.Group className="mb-3" controlId="user_name">
                  <Form.Label>Tu nombre</Form.Label>
                  <Form.Control type="text" name="user_name" placeholder="Ingresa tu nombre" required />
                </Form.Group>
                <Form.Group className="mb-3" controlId="user_email">
                  <Form.Label>Tu correo</Form.Label>
                  <Form.Control type="email" name="user_email" placeholder="Ingresa tu correo electrónico" required />
                </Form.Group>
                <Form.Group className="mb-3" controlId="message">
                  <Form.Label>Mensaje</Form.Label>
                  <Form.Control as="textarea" name="message" rows={3} placeholder="Escribe tu mensaje aquí" required />
                </Form.Group>
                <Button variant="primary" type="submit">
                  <FontAwesomeIcon icon={faPaperPlane} /> Enviar mensaje
                </Button>
              </Form>
            )}

            <div className="mt-4 d-flex justify-content-around">
              <a
                href="mailto:stevenvallejo780@gmail.com?subject=Contacto&body=Hola Steven, me gustaría ponerme en contacto contigo"
                style={{ fontSize: '48px', color: '#000' }} // Estilo del icono de correo
              >
                <FontAwesomeIcon icon={faEnvelope} />
              </a>
              <a
                href="https://wa.me/1234567890" // Sustituir por tu número de WhatsApp
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '48px', color: '#25D366' }} // Estilo del icono de WhatsApp
              >
                <FontAwesomeIcon icon={faWhatsapp} />
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}
