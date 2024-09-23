'use client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhone, faEnvelope, faBirthdayCake, faIdCard } from '@fortawesome/free-solid-svg-icons';
import { ListGroup } from 'react-bootstrap';

export default function ContactInfo() {
  return (
    <ListGroup variant="flush">
      <ListGroup.Item><FontAwesomeIcon icon={faMapMarkerAlt} /> Rionegro, Antioquia, Colombia</ListGroup.Item>
      <ListGroup.Item><FontAwesomeIcon icon={faBirthdayCake} /> 07/08/2000</ListGroup.Item>
      <ListGroup.Item><FontAwesomeIcon icon={faIdCard} /> CC/NIT: 1.000.306.867</ListGroup.Item>
      <ListGroup.Item><FontAwesomeIcon icon={faPhone} /> +57 304 6374368</ListGroup.Item>
      <ListGroup.Item><FontAwesomeIcon icon={faEnvelope} /> <a href="mailto:stevenvallejo780@gmail.com">stevenvallejo780@gmail.com</a></ListGroup.Item>
    </ListGroup>
  );
}
