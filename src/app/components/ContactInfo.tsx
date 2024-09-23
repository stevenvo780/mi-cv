// components/ContactInfo.js
'use client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapMarkerAlt,
  faPhoneAlt,
  faEnvelope,
  faBirthdayCake,
  faIdCard,
} from '@fortawesome/free-solid-svg-icons';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { ListGroup } from 'react-bootstrap';

export default function ContactInfo() {
  return (
    <ListGroup variant="flush" className="mt-3">
      <ListGroup.Item className="d-flex align-items-center">
        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-primary" />
        Rionegro, Antioquia, Colombia
      </ListGroup.Item>
      <ListGroup.Item className="d-flex align-items-center">
        <FontAwesomeIcon icon={faBirthdayCake} className="me-2 text-primary" />
        Nacimiento: 07/08/2000
      </ListGroup.Item>
      <ListGroup.Item className="d-flex align-items-center">
        <FontAwesomeIcon icon={faIdCard} className="me-2 text-primary" />
        CC/NIT: 1.000.306.867
      </ListGroup.Item>
      <ListGroup.Item className="d-flex align-items-center">
        <FontAwesomeIcon icon={faPhoneAlt} className="me-2 text-primary" />
        Celular: +57 304 6374368
      </ListGroup.Item>
      <ListGroup.Item className="d-flex align-items-center">
        <FontAwesomeIcon icon={faEnvelope} className="me-2 text-primary" />
        <a href="mailto:stevenvallejo780@gmail.com" className="text-decoration-none">
          stevenvallejo780@gmail.com
        </a>
      </ListGroup.Item>
      <ListGroup.Item className="d-flex align-items-center">
        <FontAwesomeIcon icon={faLinkedin} className="me-2 text-primary" />
        <a
          href="https://www.linkedin.com/in/steven-vallejo/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-decoration-none"
        >
          LinkedIn
        </a>
      </ListGroup.Item>
    </ListGroup>
  );
}
