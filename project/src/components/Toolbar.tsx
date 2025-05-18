import React from 'react';
import { AppMode } from '../types';
import { MapPin, Link, Move, Trash2, RotateCw, RotateCcw } from 'lucide-react';

interface ToolbarProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onDeleteSelected: () => void;
  hasSelected: boolean;
  canUndo: boolean;
  canRedo: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  mode,
  onModeChange,
  onClear,
  onUndo,
  onRedo,
  onDeleteSelected,
  hasSelected,
  canUndo,
  canRedo,
}) => {
  return (
    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
      {/* Chế độ thao tác */}
      <div className="border-r pr-4 flex items-center gap-2">
        <span className="text-xs text-gray-400 mr-1">Chế độ:</span>
        <button
          onClick={() => onModeChange('place')}
          className={`p-2 rounded-md ${
            mode === 'place' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Place Dots"
        >
          <MapPin size={20} />
        </button>
        <button
          onClick={() => onModeChange('connect')}
          className={`p-2 rounded-md ${
            mode === 'connect' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Connect Dots"
        >
          <Link size={20} />
        </button>
        <button
          onClick={() => onModeChange('adjust')}
          className={`p-2 rounded-md ${
            mode === 'adjust' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Adjust Dot Direction"
        >
          <Move size={20} />
        </button>
      </div>

      {/* Undo/Redo */}
      <div className="border-r pr-4 flex items-center gap-2">
        <span className="text-xs text-gray-400 mr-1">Lịch sử:</span>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-2 rounded-md ${
            canUndo ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'
          }`}
          title="Undo"
        >
          <RotateCcw size={20} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-2 rounded-md ${
            canRedo ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'
          }`}
          title="Redo"
        >
          <RotateCw size={20} />
        </button>
      </div>

      {/* Xóa */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 mr-1">Xóa:</span>
        <button
          onClick={onDeleteSelected}
          disabled={!hasSelected}
          className={`p-2 rounded-md ${
            hasSelected ? 'hover:bg-red-100 text-red-600' : 'text-gray-300 cursor-not-allowed'
          }`}
          title="Delete Selected"
        >
          <Trash2 size={20} />
        </button>
        <button
          onClick={onClear}
          className="p-2 rounded-md bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
          title="Clear All"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;