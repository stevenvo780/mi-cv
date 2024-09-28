'use client';
import React, { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  directionX: number;
  directionY: number;
  size: number;
  color: string;
  draw: () => void;
  update: () => void;
}

export default function JarvisAnimation(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let animationFrameId: number;
    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;

    const setCanvasSize = () => {
      const scale = window.devicePixelRatio || 1;
      canvas.width = canvasWidth * scale;
      canvas.height = canvasHeight * scale;
      context.scale(scale, scale);
    };

    setCanvasSize();

    const particlesArray: Particle[] = [];
    const numberOfParticles = 100;

    class ParticleClass implements Particle {
      x: number;
      y: number;
      directionX: number;
      directionY: number;
      size: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.directionX = (Math.random() * 0.4) - 0.2;
        this.directionY = (Math.random() * 0.4) - 0.2;
        this.size = Math.random() * 10 + 1;
        this.color = '#0d6efd';
      }

      draw(): void {
        if (context) {
          context.beginPath();
          context.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
          context.fillStyle = this.color;
          context.fill();
        }
      }

      update(): void {
        if (this.x > canvasWidth || this.x < 0) {
          this.directionX = -this.directionX;
        }
        if (this.y > canvasHeight || this.y < 0) {
          this.directionY = -this.directionY;
        }
        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
      }
    }

    function init(): void {
      particlesArray.length = 0;
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new ParticleClass());
      }
    }

    function animate(): void {
      if (!context) return;
      context.clearRect(0, 0, canvasWidth, canvasHeight);

      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a + 1; b < particlesArray.length; b++) {
          const dx = particlesArray[a].x - particlesArray[b].x;
          const dy = particlesArray[a].y - particlesArray[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            context.beginPath();
            context.strokeStyle = '#0d6efd';
            context.lineWidth = 1.2;
            context.moveTo(particlesArray[a].x, particlesArray[a].y);
            context.lineTo(particlesArray[b].x, particlesArray[b].y);
            context.stroke();
            context.closePath();
          }
        }
      }

      particlesArray.forEach((particle) => particle.update());

      animationFrameId = requestAnimationFrame(animate);
    }

    init();
    animate();

    const handleResize = (): void => {
      canvasWidth = window.innerWidth;
      canvasHeight = window.innerHeight;
      setCanvasSize();
      init();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <style jsx>{`
        canvas {
          display: block;
          width: 100%;
          height: 100%;
          max-height: 70vh; /* Limita la altura máxima al 70% del viewport en móviles */
          max-width: 100%;
          border: 1px solid #ccc; /* Opcional para ver el borde del canvas */
        }

        @media (max-width: 768px) {
          canvas {
            height: auto;
            max-height: 30vh; /* Altura máxima en móviles pequeños */
          }
        }
      `}</style>
      <canvas ref={canvasRef}></canvas>
    </>
  );
}
