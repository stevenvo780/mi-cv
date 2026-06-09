'use client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Row, Col, ListGroup } from 'react-bootstrap';
import { contacts } from './common';


export default function ContactInfo() {
  return (
    <Row className="mt-3">
      {contacts.map((contact, index) => (
        <Col key={index} xs={12} md={6} lg={4} className="mt-3 mt-md-0">
          <ListGroup variant="flush">
            <ListGroup.Item
              className="d-flex align-items-center"
              style={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-strong)',
                borderRadius: '10px',
                padding: '0.75rem',
                backgroundColor: 'var(--panel-solid)',
                color: 'var(--text-soft)',
              }}
            >
              <FontAwesomeIcon icon={contact.icon} className="me-2" />
              <a
                href={contact.url}
                target={
                  contact.type === 'linkedin' || contact.type === 'codersrank'
                    ? '_blank'
                    : undefined
                }
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
