export interface Dot {
  id: string;
  x: number;
  y: number;
  direction: number; // in degrees (0-359)
  selected: boolean;
  label?: string; // Optional label for dots
  color?: string; // Custom color for dots
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string; // Optional label for connections
  style?: 'solid' | 'dashed' | 'dotted'; // Line style
  color?: string; // Custom color for connections
}

export type AppMode = 'place' | 'connect' | 'adjust';

export interface MapState {
  dots: Dot[];
  connections: Connection[];
}

export interface CanvasSize {
  width: number;
  height: number;
}