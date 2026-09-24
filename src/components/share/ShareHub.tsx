'use client';

import { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { type Locale } from '@/lib/site';
import { getShareDestinations, SHARE_COPY, type ShareDestination } from '@/lib/shareLinks';

const GROUPS = ['main', 'fronts', 'catalogs', 'contact'] as const;

function ScanCode({ destination, size, alt }: { destination: ShareDestination; size: number; alt: string }) {
  return (
    <div className="share-code" role="img" aria-label={`${alt} ${destination.label}`}>
      <QRCodeSVG
        value={destination.url}
        size={size}
        level="M"
        marginSize={4}
        fgColor="#101719"
        bgColor="#ffffff"
        aria-hidden="true"
      />
    </div>
  );
}

export default function ShareHub({ locale }: { locale: Locale }) {
  const copy = SHARE_COPY[locale];
  const destinations = getShareDestinations(locale);
  const [selectedId, setSelectedId] = useState<ShareDestination['id']>('cv');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const copyRequestRef = useRef(0);
  const focusRequestRef = useRef(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const modalTriggerRef = useRef<HTMLButtonElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const previewColumnRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLElement>(null);
  const selected = destinations.find((destination) => destination.id === selectedId) ?? destinations[0];
  const groupedDestinations = GROUPS.map((group) => ({
    group,
    destinations: destinations.filter((destination) => destination.group === group),
  }));

  function openPresentation(event: React.MouseEvent<HTMLButtonElement>) {
    modalTriggerRef.current = event.currentTarget;
    dialogRef.current?.showModal();
  }

  function selectDestination(id: ShareDestination['id']) {
    copyRequestRef.current += 1;
    const focusRequest = ++focusRequestRef.current;
    const focusSource = document.activeElement;
    setSelectedId(id);
    setCopyState('idle');
    if (!window.matchMedia('(max-width: 900px)').matches) return;

    // En una sola columna, el QR queda más abajo que las opciones. Saltamos al panel
    // solo si el usuario no movió el foco antes del siguiente fotograma.
    requestAnimationFrame(() => {
      if (focusRequestRef.current !== focusRequest || document.activeElement !== focusSource) return;
      previewRef.current?.focus({ preventScroll: true });
      previewColumnRef.current?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
    });
  }

  function chooseAnotherDestination() {
    const selectedOption = optionsRef.current?.querySelector<HTMLButtonElement>('.share-option[aria-pressed="true"]');
    selectedOption?.focus({ preventScroll: true });
    selectedOption?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'center',
    });
  }

  async function copyLink() {
    const request = ++copyRequestRef.current;
    const url = selected.url;
    try {
      await navigator.clipboard.writeText(url);
      if (copyRequestRef.current === request) setCopyState('copied');
    } catch {
      if (copyRequestRef.current === request) setCopyState('failed');
    }
  }

  return (
    <>
      <section className="share-hub" aria-label={copy.listTitle}>
        <div className="share-list-column">
          <div className="share-section-heading">
            <span className="share-section-number" aria-hidden="true">01 / 02</span>
            <div>
              <h2>{copy.listTitle}</h2>
              <p>{copy.listHint}</p>
            </div>
          </div>
          <div className="share-options" id="share-options" ref={optionsRef}>
            {groupedDestinations.map(({ group, destinations: groupDestinations }) => groupDestinations.length > 0 && (
              <section className="share-option-group" key={group} aria-labelledby={`share-group-${group}`}>
                <div className="share-option-group-heading">
                  <h3 id={`share-group-${group}`}>{copy.groups[group]}</h3>
                  <span className="share-option-group-count" aria-hidden="true">{String(groupDestinations.length).padStart(2, '0')}</span>
                </div>
                <div className="share-option-group-list">
                  {groupDestinations.map((destination) => (
                    <button
                      type="button"
                      key={destination.id}
                      className="share-option"
                      data-tone={destination.tone}
                      aria-pressed={selected.id === destination.id}
                      aria-controls="share-qr-preview"
                      onClick={() => selectDestination(destination.id)}
                    >
                      <span className="share-option-index" aria-hidden="true">{String(destinations.indexOf(destination) + 1).padStart(2, '0')}</span>
                      <span className="share-option-copy">
                        <span className="share-option-category">{destination.category}</span>
                        <span className="share-option-title">{destination.label}</span>
                        <span className="share-option-description">{destination.description}</span>
                      </span>
                      <span className="share-option-arrow" aria-hidden="true">↗</span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="share-preview-column" ref={previewColumnRef}>
          <div className="share-section-heading share-section-heading-preview">
            <span className="share-section-number" aria-hidden="true">02 / 02</span>
            <div>
              <h2>{copy.qrEyebrow}</h2>
              <p>{copy.scan}</p>
            </div>
          </div>
          <button type="button" className="share-choose-another" aria-controls="share-options" onClick={chooseAnotherDestination}>
            <span aria-hidden="true">←</span> {copy.chooseAnother}
          </button>
          <article
            className="share-preview"
            id="share-qr-preview"
            data-tone={selected.tone}
            aria-label={`${copy.qrEyebrow}: ${selected.label}`}
            tabIndex={-1}
            ref={previewRef}
          >
            <div className="share-preview-topline">
              <span>Mouseîon / QR</span>
              <span aria-hidden="true">✦</span>
            </div>
            <div className="share-preview-body">
              <div className="share-preview-orbit" aria-hidden="true" />
              <button type="button" className="share-code-trigger" aria-label={`${copy.present}: ${selected.label}`} onClick={openPresentation}>
                <span className="share-code-frame"><ScanCode destination={selected} size={320} alt={copy.qrAlt} /></span>
                <span className="share-code-trigger-hint" aria-hidden="true"><span>⛶</span> {copy.present}</span>
              </button>
              <p className="share-preview-label" aria-live="polite">{selected.label}</p>
              <p className="share-preview-url" title={selected.url}>{selected.url}</p>
            </div>
            <div className="share-preview-actions">
              <button type="button" className="share-action share-action-primary" onClick={openPresentation}>
                <span aria-hidden="true">⛶</span> {copy.present}
              </button>
              <div className="share-secondary-actions">
                <button type="button" className="share-action" onClick={copyLink}>{copy.copy}</button>
                <a className="share-action" href={selected.url} target="_blank" rel="noopener noreferrer">{copy.open} <span aria-hidden="true">↗</span></a>
              </div>
              <span className="share-copy-status" role="status" aria-live="polite">
                {copyState === 'copied' ? copy.copied : copyState === 'failed' ? copy.copyFailed : ''}
              </span>
            </div>
          </article>
        </div>
      </section>

      <dialog
        className="share-presentation"
        ref={dialogRef}
        aria-labelledby="share-presentation-title"
        onClose={() => modalTriggerRef.current?.focus()}
      >
        <div className="share-presentation-inner">
          <div className="share-presentation-header">
            <span>Mouseîon / QR</span>
            <button type="button" className="share-presentation-close" onClick={() => dialogRef.current?.close()}>
              {copy.close} <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="share-presentation-main">
            <p className="share-presentation-eyebrow">{copy.scan}</p>
            <h2 id="share-presentation-title">{selected.label}</h2>
            <div className="share-presentation-code">
              <ScanCode destination={selected} size={700} alt={copy.qrAlt} />
            </div>
            <p className="share-presentation-hint">{copy.presentationHint}</p>
            <p className="share-presentation-url">{selected.url}</p>
          </div>
        </div>
      </dialog>
    </>
  );
}
