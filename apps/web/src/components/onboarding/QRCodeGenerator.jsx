import React, { useEffect, useRef, useCallback } from "react";

export default function QRCodeGenerator({ url }) {
  const canvasRef = useRef(null);

  const generateQR = useCallback(() => {
    if (!url || !canvasRef.current) return;

    // Simple QR-like pattern generator for demo
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = 200;
    const cellSize = size / 20;
    
    canvas.width = size;
    canvas.height = size;
    
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    // Generate pattern based on URL
    ctx.fillStyle = '#000000';
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        const hash = url.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        
        if ((hash + i * j) % 3 === 0) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }
    
    // Corner markers
    const corners = [[0, 0], [0, 13], [13, 0]];
    corners.forEach(([x, y]) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x * cellSize, y * cellSize, cellSize * 7, cellSize * 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, cellSize * 5, cellSize * 5);
      ctx.fillStyle = '#000000';
      ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, cellSize * 3, cellSize * 3);
    });
  }, [url]);

  useEffect(() => {
    generateQR();
  }, [generateQR]);

  return (
    <div className="inline-block bg-white brutalist-border brutalist-shadow p-4">
      <canvas
        ref={canvasRef}
        className="w-48 h-48 brutalist-border"
      />
    </div>
  );
}
