'use client';
import React, { useRef, useEffect } from 'react';

export default function MandelbrotSet() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let zoom = 1;
    let offsetX = 0;
    let offsetY = 0;

    const setCanvasSize = () => {
      const scale = window.devicePixelRatio || 1;
      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.scale(scale, scale);
    };

    setCanvasSize();

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          const m = mandelbrot(
            (x - width / 2) / (200 * zoom) + offsetX,
            (y - height / 2) / (200 * zoom) + offsetY
          );
          ctx.fillStyle = m === 0 ? '#000' : `hsl(0, 100%, ${m}%)`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    };

    const mandelbrot = (x: number, y: number) => {
      let real = x;
      let imag = y;
      const maxIter = 100;
      for (let i = 0; i < maxIter; i++) {
        const tempReal = real * real - imag * imag + x;
        const tempImag = 2 * real * imag + y;
        real = tempReal;
        imag = tempImag;
        if (real * imag > 5) {
          return (i / maxIter) * 100;
        }
      }
      return 0;
    };

    draw();

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const mouseX = e.offsetX;
      const mouseY = e.offsetY;
      const zoomAmount = e.deltaY * -0.001;
      zoom += zoomAmount;
      offsetX += (mouseX - width / 2) / (200 * zoom) * zoomAmount;
      offsetY += (mouseY - height / 2) / (200 * zoom) * zoomAmount;
      draw();
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      setCanvasSize();
      draw();
    };

    canvas.addEventListener('wheel', handleWheel);
    window.addEventListener('resize', handleResize);

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
  );
}
