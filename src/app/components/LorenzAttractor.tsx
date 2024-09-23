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

    ctx.clearRect(0, 0, width, height);

    // Amplitud del atractor (rango aproximado de los valores x, y, z)
    const maxRange = 40;
    
    // Ajustamos la escala dinámica y el centrado
    const scale = Math.min(width, height) / (maxRange * 2); // Multiplicamos para ajustarlo mejor al tamaño del canvas
    const centerX = width / 2;
    const centerY = height / 2;

    const animate = () => {
      for (let i = 0; i < 5; i++) {
        const dx = params.sigma * (y - x) * dt;
        const dy = (x * (params.rho - z) - y) * dt;
        const dz = (x * y - params.beta * z) * dt;
        x += dx;
        y += dy;
        z += dz;
        points.push({ x, y, z });
      }

      if (points.length > 1) {
        const p1 = points[points.length - 2];
        const p2 = points[points.length - 1];
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
        cancelAnimationFrame(animationId!);
      }
    };

    animate();

    const handleClick = () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }

      const newSigma = Math.random() * 20 + 5;
      const newRho = Math.random() * 35 + 15;
      const newBeta = Math.random() * 3 + 2;

      setParams({ sigma: newSigma, rho: newRho, beta: newBeta });
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
    <div>
      <p>
        σ = {params.sigma.toFixed(2)}, ρ = {params.rho.toFixed(2)}, β = {params.beta.toFixed(2)}
      </p>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        style={{ border: '1px solid #dee2e6', backgroundColor: '#f8f9fa' }}
      />
    </div>
  );
}
