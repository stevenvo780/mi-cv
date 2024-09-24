'use client';
import React, { useRef, useEffect, useState } from 'react';

export default function LorenzAttractor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [params, setParams] = useState({ sigma: 10, rho: 28, beta: 8 / 3 });
  const [animationId, setAnimationId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const setCanvasSize = () => {
      const scale = window.devicePixelRatio || 1;
      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.scale(scale, scale);
    };

    setCanvasSize();

    let x = 0.1;
    let y = 0;
    let z = 0;
    const dt = 0.01;
    const points: { x: number; y: number; z: number }[] = [];

    let minZ = Infinity;
    let maxZ = -Infinity;

    ctx.clearRect(0, 0, width, height);

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

        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;
      }

      if (points.length > 1) {
        const p1 = points[points.length - 2];
        const p2 = points[points.length - 1];
        const centerY = height / 2 - ((maxZ + minZ) / 2) * scale;

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
        resetAnimation();
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

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      setCanvasSize();
      ctx.clearRect(0, 0, width, height);
      points.length = 0;
      x = 0.1;
      y = 0;
      z = 0;
      animate();
    };

    canvas.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);

    return () => {
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [params]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%', border: '1px solid #dee2e6', backgroundColor: '#f8f9fa' }}
    />
  );
}
