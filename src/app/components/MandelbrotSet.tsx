'use client';
import React, { useRef, useEffect } from 'react';

export default function MandelbrotSet() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const width = canvas.width;
    const height = canvas.height;

    let zoom = 1;
    let offsetX = 0;
    let offsetY = 0;

    const draw = () => {
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

    // Manejo de zoom con el mouse
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

    canvas.addEventListener('wheel', handleWheel);
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div>
      <h3>Conjunto de Mandelbrot Interactivo</h3>
      <canvas ref={canvasRef} width={600} height={400} />
    </div>
  );
}
