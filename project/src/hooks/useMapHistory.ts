import { useState, useCallback } from 'react';
import { Dot, Connection } from '../types';

interface MapState {
  dots: Dot[];
  connections: Connection[];
}

const useMapHistory = (initialState: MapState) => {
  const [history, setHistory] = useState<MapState[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const currentState = history[currentIndex];
  
  const saveState = useCallback((newState: MapState) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  }, [history, currentIndex]);
  
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);
  
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, history.length]);
  
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;
  
  return {
    state: currentState,
    saveState,
    undo,
    redo,
    canUndo,
    canRedo
  };
};

export default useMapHistory;