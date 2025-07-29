import React from 'react';
import { HexColorPicker } from 'react-colorful';
import Tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import {
  CursorArrowRaysIcon,
  PencilSquareIcon,
  ViewfinderCircleIcon,
  ArrowsPointingOutIcon,
  SwatchIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const EditorToolbar = ({ 
  mode, 
  setMode, 
  selectedSpace, 
  onUpdateSpace, 
  onDeleteSpace,
  spaceColor,
  setSpaceColor 
}) => {
  const tools = [
    { id: 'select', icon: CursorArrowRaysIcon, label: 'Select (V)', mode: 'edit' },
    { id: 'draw', icon: PencilSquareIcon, label: 'Draw Space (D)', mode: 'draw' },
    { id: 'pan', icon: ViewfinderCircleIcon, label: 'Pan (H)', mode: 'view' },
  ];

  // Initialize tooltips
  React.useEffect(() => {
    tools.forEach(tool => {
      Tippy(`[data-tooltip="${tool.id}"]`, {
        content: tool.label,
        placement: 'right',
      });
    });
  }, []);

  const updateSpaceDimensions = (width, height) => {
    if (selectedSpace) {
      onUpdateSpace({
        ...selectedSpace,
        width: parseInt(width) || selectedSpace.width,
        height: parseInt(height) || selectedSpace.height,
      });
    }
  };

  return (
    <div className="toolbar dark">
      {/* Main Tools */}
      <div className="tools-group">
        {tools.map((tool) => (
          <button
            key={tool.id}
            data-tooltip={tool.id}
            onClick={() => setMode(tool.mode)}
            className={`toolButton ${mode === tool.mode ? 'active' : ''}`}
          >
            <tool.icon className="w-6 h-6" />
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-2" />

      {/* Space Properties - Only shown when a space is selected */}
      {selectedSpace && mode === 'edit' && (
        <div className="d-flex flex-column gap-2">
          {/* Size Controls */}
          <div className="d-flex flex-column gap-1">
            <input
              type="number"
              value={selectedSpace.width}
              onChange={(e) => updateSpaceDimensions(e.target.value, selectedSpace.height)}
              className="form-control form-control-sm"
              min="50"
              step="10"
              placeholder="Width"
            />
            <input
              type="number"
              value={selectedSpace.height}
              onChange={(e) => updateSpaceDimensions(selectedSpace.width, e.target.value)}
              className="form-control form-control-sm"
              min="50"
              step="10"
              placeholder="Height"
            />
          </div>

          {/* Color Picker */}
          <Tippy
            content={
              <HexColorPicker
                color={spaceColor}
                onChange={setSpaceColor}
              />
            }
            interactive={true}
            trigger="click"
          >
            <button className="btn btn-light p-2">
              <SwatchIcon className="w-100 h-100" />
            </button>
          </Tippy>

          {/* Delete Space */}
          <button
            onClick={() => onDeleteSpace(selectedSpace.id)}
            className="btn btn-danger p-2"
          >
            <TrashIcon className="w-100 h-100" />
          </button>
        </div>
      )}
    </div>
  );
};

export default EditorToolbar;
