'use client';
import { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';

const gridRows = 25;
const gridCols = 130;

const generateRandomGrid = () => {
  return Array.from({ length: gridRows }, () =>
    Array.from({ length: gridCols }, () => (Math.random() > 0.7 ? 1 : 0))
  );
};

export default function GameOfLifeHeader() {
  const [grid, setGrid] = useState(generateRandomGrid());

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

  useEffect(() => {
    const intervalId = setInterval(() => {
      setGrid((g) => {
        return g.map((rows, i) =>
          rows.map((cell, j) => {
            let neighbors = 0;
            operations.forEach(([x, y]) => {
              const newI = i + x;
              const newJ = j + y;
              if (
                newI >= 0 &&
                newI < gridRows &&
                newJ >= 0 &&
                newJ < gridCols
              ) {
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
      });
    }, 300);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <section>
      <Container fluid>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridCols}, 15px)`,
            justifyContent: 'center',
            margin: '0 auto',
            overflow: 'hidden',
          }}
        >
          {grid.map((rows, i) =>
            rows.map((col, j) => (
              <div
                key={`${i}-${j}`}
                onClick={() => {
                  const newGrid = grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                      if (rowIndex === i && colIndex === j) {
                        return grid[i][j] ? 0 : 1;
                      }
                      return cell;
                    })
                  );
                  setGrid(newGrid);
                }}
                style={{
                  width: 13,
                  height: 13,
                  backgroundColor: grid[i][j] ? '#a51a41' : undefined,
                  border: 'solid 1px #dee2e6',
                }}
              />
            ))
          )}
        </div>
      </Container>
    </section>
  );
}
