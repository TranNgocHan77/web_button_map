import React from 'react';
import { Dot } from '../types';
import { RotateCw } from 'lucide-react';

interface DirectionControlProps {
  selectedDot: Dot | null;
  onDirectionChange: (id: string, direction: number) => void;
}

const DirectionControl: React.FC<DirectionControlProps> = ({
  selectedDot,
  onDirectionChange,
}) => {
  if (!selectedDot) return null;

  const handleDirectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDirection = Number(e.target.value);
    onDirectionChange(selectedDot.id, newDirection);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
        <RotateCw size={16} className="mr-2" />
        Direction
      </h3>
      
      <div className="flex items-center gap-3">
        <input
          type="range"
          min="0"
          max="359"
          step="1"
          value={selectedDot.direction}
          onChange={handleDirectionChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-sm font-medium w-10 text-right">
          {selectedDot.direction}°
        </span>
      </div>

      <div className="mt-2 grid grid-cols-4 gap-1">
        {[0, 90, 180, 270].map(angle => (
          <button
            key={angle}
            onClick={() => onDirectionChange(selectedDot.id, angle)}
            className={`text-xs py-1 px-2 rounded ${
              selectedDot.direction === angle 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {angle}°
          </button>
        ))}
      </div>
    </div>
  );
};

export default DirectionControl;