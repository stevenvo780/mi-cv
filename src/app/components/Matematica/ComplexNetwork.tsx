'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network/standalone';

export default function ComplexNetwork() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [networkType, setNetworkType] = useState('random');

  useEffect(() => {
    const nodes = [];
    const edges = [];
    const nodeCount = 30;

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({ id: i, label: `Nodo ${i}` });
    }

    if (networkType === 'random') {
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          if (Math.random() > 0.9) {
            edges.push({ from: i, to: j });
          }
        }
      }
    } else if (networkType === 'grid') {
      const size = Math.sqrt(nodeCount);
      for (let i = 0; i < nodeCount; i++) {
        if (i % size !== size - 1) {
          edges.push({ from: i, to: i + 1 });
        }
        if (i + size < nodeCount) {
          edges.push({ from: i, to: i + size });
        }
      }
    }

    const data = {
      nodes: nodes,
      edges: edges,
    };

    const options = {
      physics: {
        stabilization: false,
      },
    };

    const network = new Network(containerRef.current!, data, options);

    return () => {
      network.destroy();
    };
  }, [networkType]);

  return (
    <div>
      <h3>Simulación de Redes Complejas</h3>
      <div className="mb-3">
        <label className="me-2">Tipo de Red:</label>
        <select
          value={networkType}
          onChange={(e) => setNetworkType(e.target.value)}
        >
          <option value="random">Aleatoria</option>
          <option value="grid">Cuadrícula</option>
        </select>
      </div>
      <div
        ref={containerRef}
        style={{ height: '400px', border: '1px solid #dee2e6' }}
      />
    </div>
  );
}
