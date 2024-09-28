'use client';
import { useState, useEffect, useRef } from 'react';

const gridRows = 25;
const gridCols = 130;
const cellSize = 13; // Tamaño de cada celda en el canvas

// Genera un patrón inicial amplio
const generateWidePattern = (): number[][] => {
  const pattern = Array.from({ length: gridRows }, () =>
    Array.from({ length: gridCols }, () => 0)
  );

  for (let i = 5; i < 20; i++) {
    for (let j = 40; j < 90; j++) {
      if ((i + j) % 4 === 0 || (i - j) % 5 === 0) {
        pattern[i][j] = 1;
      }
    }
  }
  return pattern;
};

// Genera una cuadrícula aleatoria
const generateRandomGrid = (): number[][] => {
  return Array.from({ length: gridRows }, () =>
    Array.from({ length: gridCols }, () => (Math.random() > 0.7 ? 1 : 0))
  );
};

export default function GameOfLifeHeader() {
  const [grid, setGrid] = useState<number[][]>(generateWidePattern());
  const [loading, setLoading] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false); // Indica si el componente ha sido montado
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const operations = [
    [0, 1],
    [0, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
    [-1, -1],
    [1, 0],
    [-1, 0],
  ];

  // Función para actualizar la cuadrícula y aplicar las reglas del juego
  const updateGrid = (g: number[][]): number[][] => {
    return g.map((rows, i) =>
      rows.map((cell, j) => {
        let neighbors = 0;
        operations.forEach(([x, y]) => {
          const newI = i + x;
          const newJ = j + y;
          if (newI >= 0 && newI < gridRows && newJ >= 0 && newJ < gridCols) {
            neighbors += g[newI][newJ];
          }
        });

        if (cell === 1 && (neighbors < 2 || neighbors > 3)) {
          return 0;
        } else if (cell === 0 && neighbors === 3) {
          return 1;
        } else {
          return cell;
        }
      })
    );
  };

  // Dibuja la cuadrícula en el canvas
  const drawGrid = (grid: number[][], ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height); // Limpiar el canvas
    for (let i = 0; i < gridRows; i++) {
      for (let j = 0; j < gridCols; j++) {
        ctx.fillStyle = grid[i][j] ? '#a51a41' : '#ffffff'; // Celdas activas y desactivadas
        ctx.fillRect(j * cellSize, i * cellSize, cellSize - 1, cellSize - 1);
      }
    }
  };

  // Efecto para montar el componente (solo en cliente)
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const timeoutId = setTimeout(() => {
        setGrid(generateRandomGrid());
        setLoading(false);
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [mounted]);

  // Efecto para actualizar la cuadrícula y redibujarla en intervalos
  useEffect(() => {
    if (!loading && mounted) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const updateAndDraw = () => {
        setGrid((g) => {
          const newGrid = updateGrid(g);
          drawGrid(newGrid, ctx);
          return newGrid;
        });
      };

      const intervalId = setInterval(updateAndDraw, 500); // Actualización cada 500ms
      return () => clearInterval(intervalId);
    }
  }, [loading, mounted]);

  // Evitar renderizado en SSR hasta que el componente esté montado
  if (!mounted) {
    return null;
  }

  // Renderiza el grid de carga mientras está cargando
  if (loading) {
    return (
      <section>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridCols}, ${cellSize}px)`,
            justifyContent: 'center',
            margin: '0 auto',
          }}
        >
          {grid.map((rows, i) =>
            rows.map((col, j) => (
              <div
                key={`${i}-${j}`}
                style={{
                  width: `${cellSize - 1}px`,
                  height: `${cellSize - 1}px`,
                  backgroundColor: grid[i][j] ? '#a51a41' : '#ffffff',
                  border: 'solid 1px #dee2e6',
                }}
              />
            ))
          )}
        </div>
      </section>
    );
  }

  // Renderiza el canvas una vez que el loading ha terminado
  return (
    <section>
      <canvas
        ref={canvasRef}
        width={gridCols * cellSize}
        height={gridRows * cellSize}
        style={{
          display: 'block',
          margin: '0 auto',
          border: '1px solid #dee2e6',
        }}
      />
    </section>
  );
}
