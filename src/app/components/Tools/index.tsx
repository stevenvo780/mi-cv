import { Container, Row, Col, ProgressBar, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { tools } from './common';
import { faCoins } from '@fortawesome/free-solid-svg-icons';

const getProgressBarVariant = (level: number) => {
  if (level > 85) return 'success';
  if (level > 70) return 'info';
  if (level > 50) return 'warning';
  return 'danger';
};

export default function Tools() {
  return (
    <section className="mb-5">
      <Container>
        <h3 className=" border-bottom pb-2 mb-4">Herramientas</h3>
        <Row>
          {tools.map((tool, index) => (
            <Col md={4} key={index} className="mb-4">
              <h4 className="h5">{tool.category}:</h4>
              <ul className="list-unstyled">
                {tool.items.map((item, i) => (
                  <li key={i} className="mb-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        {item.icon && (
                          <FontAwesomeIcon icon={item.icon} className="me-2 " />
                        )}
                        <span>{item.name}</span>
                      </div>
                      {item.level > 85 && (
                        <FontAwesomeIcon icon={faCoins} className="text-warning me-2" />
                      )}
                    </div>
                    <ProgressBar 
                      now={item.level} 
                      label={`${item.level}%`} 
                      variant={getProgressBarVariant(item.level)} 
                    />
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                {tool.links && tool.links.map((link, linkIndex) => (
                  <Button
                    key={linkIndex}
                    href={link.url}
                    variant="outline-primary"
                    className="me-2 mb-2 rounded-circle"
                    style={{ width: '40px', height: '40px' }}
                  >
                    <FontAwesomeIcon icon={link.icon} />
                  </Button>
                ))}
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}
