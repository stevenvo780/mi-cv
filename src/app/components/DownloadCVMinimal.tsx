'use client';
import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';

export default function DownloadCVMinimal() {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const path = window.location.pathname;
    setLang(path.startsWith('/es') ? 'es' : 'en');
  }, []);

  const href = lang === 'es' ? '/pdf/CV_tech_es.pdf' : '/pdf/CV_tech_en.pdf';

  return (
    <div style={{ marginTop: '0' }}>
      <a href={href} download>
        <Button
          variant="primary"
          style={{
            width: '50px',
            height: '30px',
            borderRadius: '10px',
            padding: '0',
            fontSize: '12px',
            textAlign: 'center',
          }}
        >
          CV
        </Button>
      </a>
    </div>
  );
}
