export interface Dot {
  id: string;
  x: number;
  y: number;
  direction: number; // in degrees (0-359)
  selected: boolean;
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
}

export type AppMode = 'place' | 'connect' | 'adjust';