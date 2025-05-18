import { useState, useCallback } from 'react';
import { MapState } from '../types';

const MAX_HISTORY_LENGTH = 50;

const useMapHistory = (initialState: MapState) => {
  const [history, setHistory] = useState<MapState[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const currentState = history[currentIndex];
  
  const saveState = useCallback((newState: MapState) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newState);
    
    // Limit history length to prevent memory issues
    if (newHistory.length > MAX_HISTORY_LENGTH) {
      newHistory.shift();
      setCurrentIndex(prev => prev - 1);
    }
    
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
    canRedo,
    historyLength: history.length,
    currentIndex
  };
};

export default useMapHistory;