import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'https://cdn.skypack.dev/uuid';
import MapCanvas from './MapCanvas';
import DirectionControl from './DirectionControl';
import Toolbar from './Toolbar';
import { Dot, Connection, AppMode } from '../types';
import useMapHistory from '../hooks/useMapHistory';
import useResizeObserver from '../hooks/useResizeObserver';

const DotMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerSize = useResizeObserver(containerRef);
  
  const {
    state,
    saveState,
    undo,
    redo,
    canUndo,
    canRedo
  } = useMapHistory({
    dots: [],
    connections: []
  });
  
  const { dots, connections } = state;
  const [mode, setMode] = useState<AppMode>('place');
  const [selectedDotId, setSelectedDotId] = useState<string | null>(null);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  
  const selectedDot = dots.find(dot => dot.id === selectedDotId) || null;
  const hasSelected = selectedDotId !== null;

  // Reset selection when mode changes
  useEffect(() => {
    setSelectedDotId(null);
    setConnectionStart(null);
  }, [mode]);

  // Handle canvas click based on current mode
  const handleCanvasClick = (x: number, y: number) => {
    if (mode === 'place') {
      // Create a new dot
      const newDot: Dot = {
        id: uuidv4(),
        x,
        y,
        direction: 0,
        selected: false
      };
      
      const newDots = [...dots.map(d => ({ ...d, selected: false })), newDot];
      saveState({
        dots: newDots,
        connections
      });
      setSelectedDotId(newDot.id);
    }
  };

  // Handle dot selection based on current mode
  const handleDotSelect = (id: string) => {
    if (mode === 'adjust') {
      // Select dot for adjustment
      const newDots = dots.map(dot => ({
        ...dot,
        selected: dot.id === id
      }));
      
      saveState({
        dots: newDots,
        connections
      });
      setSelectedDotId(id);
    } else if (mode === 'connect') {
      // Start or complete a connection
      if (connectionStart === null) {
        // Start connection
        setConnectionStart(id);
        const newDots = dots.map(dot => ({
          ...dot,
          selected: dot.id === id
        }));
        
        saveState({
          dots: newDots,
          connections
        });
      } else if (connectionStart !== id) {
        // Complete connection if not connecting to self
        const newConnection: Connection = {
          id: uuidv4(),
          sourceId: connectionStart,
          targetId: id
        };
        
        // Check if connection already exists
        const connectionExists = connections.some(
          conn => (conn.sourceId === connectionStart && conn.targetId === id) ||
                 (conn.sourceId === id && conn.targetId === connectionStart)
        );
        
        if (!connectionExists) {
          const newConnections = [...connections, newConnection];
          const newDots = dots.map(dot => ({
            ...dot,
            selected: false
          }));
          
          saveState({
            dots: newDots,
            connections: newConnections
          });
        }
        
        setConnectionStart(null);
      }
    }
  };

  // Update dot direction
  const handleDirectionChange = (id: string, direction: number) => {
    const newDots = dots.map(dot => 
      dot.id === id ? { ...dot, direction } : dot
    );
    
    saveState({
      dots: newDots,
      connections
    });
  };

  // Delete selected dot and its connections
  const handleDeleteSelected = () => {
    if (!selectedDotId) return;
    
    const newDots = dots.filter(dot => dot.id !== selectedDotId);
    const newConnections = connections.filter(
      conn => conn.sourceId !== selectedDotId && conn.targetId !== selectedDotId
    );
    
    saveState({
      dots: newDots,
      connections: newConnections
    });
    
    setSelectedDotId(null);
  };

  // Clear all dots and connections
  const handleClear = () => {
    saveState({
      dots: [],
      connections: []
    });
    setSelectedDotId(null);
    setConnectionStart(null);
  };

  // Calculate canvas size based on container
  const canvasSize = {
    width: Math.max(containerSize.width - 32, 300),
    height: 500
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-4 w-full h-full p-4">
      <Toolbar
        mode={mode}
        onModeChange={setMode}
        onClear={handleClear}
        onUndo={undo}
        onRedo={redo}
        onDeleteSelected={handleDeleteSelected}
        hasSelected={hasSelected}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <MapCanvas
            dots={dots}
            connections={connections}
            onCanvasClick={handleCanvasClick}
            onDotSelect={handleDotSelect}
            onDirectionChange={handleDirectionChange}
            canvasSize={canvasSize}
          />
        </div>
        
        <div className="w-full md:w-64 flex flex-col gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Instructions</h3>
            <div className="space-y-2 text-sm text-gray-600">
              {mode === 'place' && (
                <p>Click anywhere on the map to place a new dot.</p>
              )}
              {mode === 'connect' && (
                <p>Click on a dot to start a connection, then click on another dot to connect them.</p>
              )}
              {mode === 'adjust' && (
                <p>Click and drag from a dot to adjust its direction, or use the controls below.</p>
              )}
            </div>
          </div>
          
          {selectedDot && (
            <DirectionControl
              selectedDot={selectedDot}
              onDirectionChange={handleDirectionChange}
            />
          )}
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Statistics</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">Dots:</div>
              <div className="font-medium">{dots.length}</div>
              <div className="text-gray-600">Connections:</div>
              <div className="font-medium">{connections.length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DotMap;