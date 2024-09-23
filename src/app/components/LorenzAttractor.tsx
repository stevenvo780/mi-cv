'use client';
import React, { useRef, useEffect, useState } from 'react';

export default function LorenzAttractorInteractive() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [params, setParams] = useState({ sigma: 10, rho: 28, beta: 8 / 3 });
  const [animationId, setAnimationId] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const width = canvas.width;
    const height = canvas.height;

    let x = 0.1;
    let y = 0;
    let z = 0;
    const dt = 0.01;
    const points: { x: number; y: number; z: number }[] = [];

    let minZ = Infinity;
    let maxZ = -Infinity;

    ctx.clearRect(0, 0, width, height);

    // Escala y centrado dinámico
    const maxRange = 40;
    const scale = Math.min(width, height) / (maxRange * 2);
    const centerX = width / 2;

    const animate = () => {
      for (let i = 0; i < 5; i++) {
        const dx = params.sigma * (y - x) * dt;
        const dy = (x * (params.rho - z) - y) * dt;
        const dz = (x * y - params.beta * z) * dt;
        x += dx;
        y += dy;
        z += dz;
        points.push({ x, y, z });

        // Actualizamos los valores de z mínimo y máximo
        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;
      }

      if (points.length > 1) {
        const p1 = points[points.length - 2];
        const p2 = points[points.length - 1];
        const centerY = height / 2 - ((maxZ + minZ) / 2) * scale; // Centramos en el eje vertical

        ctx.strokeStyle = `hsl(${(points.length / 5000) * 360}, 100%, 50%)`;
        ctx.beginPath();
        ctx.moveTo(centerX + p1.x * scale, centerY + p1.z * scale);
        ctx.lineTo(centerX + p2.x * scale, centerY + p2.z * scale);
        ctx.stroke();
      }

      if (points.length < 10000) {
        const id = requestAnimationFrame(animate);
        setAnimationId(id);
      } else {
        resetAnimation(); // Reinicia la animación
      }
    };

    const resetAnimation = () => {
      setParams({
        sigma: Math.random() * 20 + 5,
        rho: Math.random() * 35 + 15,
        beta: Math.random() * 3 + 2,
      });
    };

    animate();

    const handleClick = () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }

      resetAnimation();
    };

    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('click', handleClick);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [params]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={400}
      style={{ border: '1px solid #dee2e6', backgroundColor: '#f8f9fa' }}
    />
  );
}
