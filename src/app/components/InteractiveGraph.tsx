'use client';
import React, { useRef, useEffect } from 'react';
import { DataSet, Network } from 'vis-network/standalone';

export default function InteractiveGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);

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
      <h3>Teoría de Grafos Interactiva</h3>
      <p>Puedes añadir nodos y aristas utilizando las herramientas integradas.</p>
      <div
        ref={containerRef}
        style={{ height: '400px', border: '1px solid #dee2e6' }}
      />
    </div>
  );
}
