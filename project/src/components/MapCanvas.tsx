import React, { useRef, useEffect, useState } from 'react';
import { Dot, Connection } from '../types';

interface MapCanvasProps {
  dots: Dot[];
  connections: Connection[];
  onCanvasClick: (x: number, y: number) => void;
  onDotSelect: (id: string) => void;
  onDirectionChange: (id: string, direction: number) => void;
  canvasSize: { width: number; height: number };
}

const MapCanvas: React.FC<MapCanvasProps> = ({
  dots,
  connections,
  onCanvasClick,
  onDotSelect,
  onDirectionChange,
  canvasSize,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [activeDot, setActiveDot] = useState<Dot | null>(null);

  // Draw the canvas and all elements
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    // Draw grid (subtle background)
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    const gridSize = 20;
    
    for (let x = 0; x < canvasSize.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasSize.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < canvasSize.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasSize.width, y);
      ctx.stroke();
    }

    // Draw connections
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    
    connections.forEach(connection => {
      const source = dots.find(dot => dot.id === connection.sourceId);
      const target = dots.find(dot => dot.id === connection.targetId);
      
      if (source && target) {
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      }
    });

    // Draw dots and direction indicators
    dots.forEach(dot => {
      // Draw direction line
      const directionLength = isDragging && dot.selected ? 30 : 20;
      const endX = dot.x + Math.cos(dot.direction * Math.PI / 180) * directionLength;
      const endY = dot.y + Math.sin(dot.direction * Math.PI / 180) * directionLength;
      
      ctx.strokeStyle = '#14B8A6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(dot.x, dot.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      // Draw arrowhead
      const headLength = isDragging && dot.selected ? 12 : 10;
      const angle = Math.atan2(endY - dot.y, endX - dot.x);
      
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - headLength * Math.cos(angle - Math.PI / 6),
        endY - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        endX - headLength * Math.cos(angle + Math.PI / 6),
        endY - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = '#14B8A6';
      ctx.fill();
      
      // Draw dot
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.selected ? 8 : 6, 0, Math.PI * 2);
      ctx.fillStyle = dot.selected ? '#F97316' : '#3B82F6';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [dots, connections, canvasSize, isDragging]);

  const getMousePosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const findDotUnderCursor = (pos: { x: number; y: number }) => {
    return dots.find(dot => {
      const distance = Math.sqrt(Math.pow(dot.x - pos.x, 2) + Math.pow(dot.y - pos.y, 2));
      return distance <= 10;
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePosition(e);
    const dot = findDotUnderCursor(pos);
    
    if (dot) {
      setIsDragging(true);
      setDragStartPos(pos);
      setActiveDot(dot);
      onDotSelect(dot.id);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !activeDot || !dragStartPos) return;

    const pos = getMousePosition(e);
    const angle = Math.atan2(
      pos.y - activeDot.y,
      pos.x - activeDot.x
    ) * 180 / Math.PI;

    // Normalize angle to 0-359 range
    const normalizedAngle = ((angle % 360) + 360) % 360;
    onDirectionChange(activeDot.id, Math.round(normalizedAngle));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStartPos(null);
    setActiveDot(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) return;
    
    const pos = getMousePosition(e);
    const dot = findDotUnderCursor(pos);
    
    if (dot) {
      onDotSelect(dot.id);
    } else {
      onCanvasClick(pos.x, pos.y);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize.width}
      height={canvasSize.height}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="border border-gray-200 bg-white rounded-lg shadow-sm cursor-crosshair"
    />
  );
};

export default MapCanvas;