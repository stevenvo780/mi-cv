'use client';
import { useState } from 'react';
import { Container, Row, Col, Button, Modal, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { tools } from './common';
import { ToolItem } from './types';
import { useTranslate } from '@/utils/translate';

type Tier = 'advanced' | 'intermediate' | 'familiar';

const TIER_ORDER: Tier[] = ['advanced', 'intermediate', 'familiar'];

function getTier(level: number): Tier {
  if (level >= 80) return 'advanced';
  if (level >= 55) return 'intermediate';
  return 'familiar';
}

const TIER_VARIANT: Record<Tier, string> = {
  advanced: 'success',
  intermediate: 'info',
  familiar: 'secondary',
};

function getYearsOfExperience(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diff = now.getFullYear() - start.getFullYear();
  if (
    now.getMonth() < start.getMonth() ||
    (now.getMonth() === start.getMonth() && now.getDate() < start.getDate())
  ) {
    return diff - 1;
  }
  return diff;
}

function groupByTier(items: ToolItem[]): Record<Tier, ToolItem[]> {
  const groups: Record<Tier, ToolItem[]> = {
    advanced: [],
    intermediate: [],
    familiar: [],
  };
  items.forEach((item) => {
    groups[getTier(item.level)].push(item);
  });
  return groups;
}

export default function Tools() {
  const t = useTranslate();
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<null | typeof tools[0]>(null);

  const handleOpenModal = (category: typeof tools[0]) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
  };

  const renderItem = (item: ToolItem, i: number) => {
    const years = getYearsOfExperience(item.startedAt);
    return (
      <li key={i} className="mb-2 d-flex align-items-center">
        {item.icon && <FontAwesomeIcon icon={item.icon} className="me-2" />}
        <span>
          {t(`tools.item.${item.name}`)}
          {years > 0 && (
            <span className="text-muted">
              {' '}
              ({years} {t('tools.years')})
            </span>
          )}
        </span>
      </li>
    );
  };

  const renderTiers = (items: ToolItem[]) => {
    const groups = groupByTier(items);
    return TIER_ORDER.map((tier) =>
      groups[tier].length === 0 ? null : (
        <div key={tier} className="mb-3">
          <Badge bg={TIER_VARIANT[tier]} className="mb-2">
            {t(`tools.level.${tier}`)}
          </Badge>
          <ul className="list-unstyled mb-0">{groups[tier].map(renderItem)}</ul>
        </div>
      ),
    );
  };

  return (
    <section className="mb-5">
      <Container>
        <h3 className="border-bottom pb-2 mb-4">{t('tools.title')}</h3>
        <p className="mb-4">{t('tools.tooltip.info')}</p>
        <Row>
          {tools.map((tool, index) => (
            <Col md={4} key={index} className="mb-4">
              <h4 className="h5">{t(tool.category)}:</h4>
              {renderTiers(tool.items.slice(0, 6))}
              <div className="mb-3">
                {tool.items.length > 6 && (
                  <Button variant="outline-primary" onClick={() => handleOpenModal(tool)}>
                    {t('tools.showMore')}
                  </Button>
                )}
              </div>
              {tool.links &&
                tool.links.map((link, linkIndex) => (
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
            </Col>
          ))}
        </Row>
      </Container>

      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedCategory && t(selectedCategory.category)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{selectedCategory && renderTiers(selectedCategory.items)}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            {t('tools.close') || 'Cerrar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
}
