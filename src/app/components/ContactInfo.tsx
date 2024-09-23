'use client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { ListGroup } from 'react-bootstrap';

export default function ContactInfo() {
  return (
    <ListGroup variant="flush" className="mt-3">
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
