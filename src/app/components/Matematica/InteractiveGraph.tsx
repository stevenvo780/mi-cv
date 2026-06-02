'use client';
import React, { useRef, useEffect } from 'react';
import { DataSet, Network } from 'vis-network/standalone';
import { useTranslate } from '@/utils/translate';

export default function InteractiveGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const t = useTranslate();

  useEffect(() => {
    const nodes = new DataSet<{ id: number; label: string }>([]);
    const edges = new DataSet<{ id: number; from: number; to: number }>([]);

    const data = {
      nodes: nodes,
      edges: edges,
    };

    const options = {
      manipulation: {
        enabled: true,
      },
      physics: false,
    };

    const network = new Network(containerRef.current!, data, options);
    networkRef.current = network;

    return () => {
      network.destroy();
    };
  }, []);

  return (
    <div>
      <h3>{t('interactiveGraph.title')}</h3>
      <p>{t('interactiveGraph.description')}</p>
      <div
        ref={containerRef}
        style={{ height: '400px', border: '1px solid rgba(244,236,224,0.10)', backgroundColor: '#0b1417', borderRadius: '10px' }}
      />
    </div>
  );
}
