'use client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Row, Col, ListGroup } from 'react-bootstrap';
import { contacts } from './common';


export default function ContactInfo() {
  return (
    <Row className="mt-3">
      {contacts.map((contact, index) => (
        <Col key={index} xs={12} md={6} lg={4}>
          <ListGroup variant="flush">
            <ListGroup.Item className="d-flex align-items-center">
              <FontAwesomeIcon icon={contact.icon} className="me-2 " />
              <a
                href={contact.url}
                target={contact.type === 'linkedin' ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="text-decoration-none"
              >
                {contact.value}
              </a>
            </ListGroup.Item>
          </ListGroup>
        </Col>
      ))}
    </Row>
  );
}
