'use client';
import React, { useRef, useEffect } from 'react';

export default function ParticleFlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let particlesArray: Particle[] = [];
    const numberOfParticles = 200;

    const setCanvasSize = () => {
      const scale = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * scale;
      canvas.height = window.innerHeight * scale;
      ctx.scale(scale, scale);
    };

    setCanvasSize();

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
    
      constructor() {
        this.x = Math.random() * canvas.width / (window.devicePixelRatio || 1);
        this.y = Math.random() * canvas.height / (window.devicePixelRatio || 1);
        this.size = 5;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
      }
    
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
    
        if (this.x < 0 || this.x > canvas.width / (window.devicePixelRatio || 1)) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height / (window.devicePixelRatio || 1)) this.speedY *= -1;
      }
    
      draw() {
        ctx.fillStyle = '#0d6efd';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    

    const init = () => {
      particlesArray = [];
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesArray.forEach((particle) => {
        particle.update();
        particle.draw();
      });
      requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleMouseMove = () => {
      particlesArray.push(new Particle());
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      setCanvasSize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
  );
}
