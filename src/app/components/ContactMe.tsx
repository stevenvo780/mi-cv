'use client';
import React, { useRef, useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import ParticleFlow from './ParticleFlow'; // Asumo que el componente ParticleFlow está en la misma carpeta
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

            {/* Correo preescrito y botón de WhatsApp */}
            <div className="mt-4">
              <h6>Otras formas de contactarme:</h6>
              <ul>
                <li>
                  <a href="mailto:stevenvallejo780@gmail.com?subject=Contacto&body=Hola Steven, me gustaría ponerme en contacto contigo">
                    <FontAwesomeIcon icon={faEnvelope} /> Enviar correo preescrito
                  </a>
                </li>
                <li className="mt-2">
                  <a
                    href="https://wa.me/1234567890" // Sustituir por tu número de WhatsApp
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-success"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} /> Enviar mensaje por WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}
