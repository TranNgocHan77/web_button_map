import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Dot, Connection, CanvasSize } from '../types';

interface MapCanvasProps {
  dots: Dot[];
  connections: Connection[];
  onCanvasClick: (x: number, y: number) => void;
  onDotSelect: (id: string) => void;
  onDirectionChange: (id: string, direction: number) => void;
  canvasSize: CanvasSize;
}

const DOT_RADIUS = 6;
const SELECTED_DOT_RADIUS = 8;
const DIRECTION_LENGTH = 20;
const SELECTED_DIRECTION_LENGTH = 30;
const ARROW_HEAD_LENGTH = 10;
const SELECTED_ARROW_HEAD_LENGTH = 12;

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
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      setContext(ctx);
    }
  }, []);

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
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
  }, [canvasSize]);

  const drawConnections = useCallback((ctx: CanvasRenderingContext2D) => {
    connections.forEach(connection => {
      const source = dots.find(dot => dot.id === connection.sourceId);
      const target = dots.find(dot => dot.id === connection.targetId);
      
      if (source && target) {
        ctx.strokeStyle = connection.color || '#3B82F6';
        ctx.lineWidth = 2;
        
        if (connection.style === 'dashed') {
          ctx.setLineDash([5, 5]);
        } else if (connection.style === 'dotted') {
          ctx.setLineDash([2, 2]);
        } else {
          ctx.setLineDash([]);
        }
        
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
        
        // Reset line dash
        ctx.setLineDash([]);
        
        // Draw label if exists
        if (connection.label) {
          const midX = (source.x + target.x) / 2;
          const midY = (source.y + target.y) / 2;
          ctx.font = '12px Arial';
          ctx.fillStyle = '#4B5563';
          ctx.textAlign = 'center';
          ctx.fillText(connection.label, midX, midY - 5);
        }
      }
    });
  }, [dots, connections]);

  const drawDots = useCallback((ctx: CanvasRenderingContext2D) => {
    dots.forEach(dot => {
      const radius = dot.selected ? SELECTED_DOT_RADIUS : DOT_RADIUS;
      const directionLength = dot.selected ? SELECTED_DIRECTION_LENGTH : DIRECTION_LENGTH;
      const headLength = dot.selected ? SELECTED_ARROW_HEAD_LENGTH : ARROW_HEAD_LENGTH;
      
      // Draw direction line
      const endX = dot.x + Math.cos(dot.direction * Math.PI / 180) * directionLength;
      const endY = dot.y + Math.sin(dot.direction * Math.PI / 180) * directionLength;
      
      ctx.strokeStyle = '#14B8A6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(dot.x, dot.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      // Draw arrowhead
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
      ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = dot.color || (dot.selected ? '#F97316' : '#3B82F6');
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw label if exists
      if (dot.label) {
        ctx.font = '12px Arial';
        ctx.fillStyle = '#4B5563';
        ctx.textAlign = 'center';
        ctx.fillText(dot.label, dot.x, dot.y - radius - 5);
      }
    });
  }, [dots]);

  // Draw the canvas and all elements
  useEffect(() => {
    if (!context) return;

    // Clear canvas
    context.clearRect(0, 0, canvasSize.width, canvasSize.height);

    // Draw elements
    drawGrid(context);
    drawConnections(context);
    drawDots(context);
  }, [dots, connections, canvasSize, isDragging, context, drawGrid, drawConnections, drawDots]);

  const getMousePosition = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  const findDotUnderCursor = useCallback((pos: { x: number; y: number }) => {
    return dots.find(dot => {
      const distance = Math.sqrt(Math.pow(dot.x - pos.x, 2) + Math.pow(dot.y - pos.y, 2));
      return distance <= SELECTED_DOT_RADIUS;
    });
  }, [dots]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePosition(e);
    const dot = findDotUnderCursor(pos);
    
    if (dot) {
      setIsDragging(true);
      setDragStartPos(pos);
      setActiveDot(dot);
      onDotSelect(dot.id);
    }
  }, [getMousePosition, findDotUnderCursor, onDotSelect]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !activeDot || !dragStartPos) return;

    const pos = getMousePosition(e);
    const angle = Math.atan2(
      pos.y - activeDot.y,
      pos.x - activeDot.x
    ) * 180 / Math.PI;

    const normalizedAngle = ((angle % 360) + 360) % 360;
    onDirectionChange(activeDot.id, Math.round(normalizedAngle));
  }, [isDragging, activeDot, dragStartPos, getMousePosition, onDirectionChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStartPos(null);
    setActiveDot(null);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) return;
    
    const pos = getMousePosition(e);
    const dot = findDotUnderCursor(pos);
    
    if (dot) {
      onDotSelect(dot.id);
    } else {
      onCanvasClick(pos.x, pos.y);
    }
  }, [isDragging, getMousePosition, findDotUnderCursor, onDotSelect, onCanvasClick]);

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
      role="img"
      aria-label="Interactive dot map canvas"
    />
  );
};

export default React.memo(MapCanvas);