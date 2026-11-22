import React from 'react';
import { 
  Trash2, 
  Copy, 
  Layers, 
  Type, 
  Sliders 
} from 'lucide-react';
import { Annotation } from '../../shared/types';

interface PropertiesPanelProps {
  selectedAnnotation: Annotation | null;
  onUpdateAnnotation: (updated: Partial<Annotation>) => void;
  onDeleteAnnotation: () => void;
  onDuplicateAnnotation: () => void;
  currentColor: string;
  onChangeCurrentColor: (c: string) => void;
  currentStrokeWidth: number;
  onChangeCurrentStrokeWidth: (w: number) => void;
}

const PRESET_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#facc15', // Yellow
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#ffffff', // White
  '#000000', // Black
];

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  onDuplicateAnnotation,
  currentColor,
  onChangeCurrentColor,
  currentStrokeWidth,
  onChangeCurrentStrokeWidth
}) => {
  const activeColor = selectedAnnotation ? selectedAnnotation.color : currentColor;
  const activeStroke = selectedAnnotation ? selectedAnnotation.strokeWidth : currentStrokeWidth;

  const handleColorChange = (c: string) => {
    onChangeCurrentColor(c);
    if (selectedAnnotation) {
      onUpdateAnnotation({ color: c });
    }
  };

  const handleStrokeChange = (w: number) => {
    onChangeCurrentStrokeWidth(w);
    if (selectedAnnotation) {
      onUpdateAnnotation({ strokeWidth: w });
    }
  };

  return (
    <aside className="w-64 bg-slate-900 border-l border-slate-800 p-4 flex flex-col select-none overflow-y-auto z-20">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Sliders className="w-3.5 h-3.5" />
          <span>Properties</span>
        </div>
        {selectedAnnotation && (
          <div className="flex items-center gap-1">
            <button
              onClick={onDuplicateAnnotation}
              title="Duplicate (Ctrl+D)"
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded cursor-pointer transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDeleteAnnotation}
              title="Delete (Del / Backspace)"
              className="p-1 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded cursor-pointer transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Color Palette */}
      <div className="mb-5">
        <label className="text-xs font-medium text-slate-300 block mb-2">Color Palette</label>
        <div className="grid grid-cols-5 gap-2">
          {PRESET_COLORS.map((color) => {
            const isSelected = activeColor.toLowerCase() === color.toLowerCase();
            return (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                  isSelected ? 'scale-110 border-white shadow-md' : 'border-slate-700 hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
              />
            );
          })}
        </div>
        {/* Custom Hex input */}
        <div className="flex items-center gap-2 mt-3 bg-slate-800/80 px-2 py-1.5 rounded border border-slate-700/60">
          <div
            className="w-5 h-5 rounded border border-slate-600 shrink-0"
            style={{ backgroundColor: activeColor }}
          />
          <input
            type="text"
            value={activeColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="bg-transparent text-xs font-mono text-slate-200 outline-none w-full"
            placeholder="#HEX"
          />
        </div>
      </div>

      {/* Stroke Width Slider */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-medium text-slate-300">Stroke / Size</label>
          <span className="text-xs font-mono text-slate-400">{activeStroke}px</span>
        </div>
        <input
          type="range"
          min={1}
          max={24}
          value={activeStroke}
          onChange={(e) => handleStrokeChange(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>1px</span>
          <span>12px</span>
          <span>24px</span>
        </div>
      </div>

      {/* Selected Element Specific Properties */}
      {selectedAnnotation ? (
        <div className="pt-3 border-t border-slate-800 space-y-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Selected Object: <span className="text-blue-400 capitalize">{selectedAnnotation.tool}</span></span>
            </div>

            {/* If Text Annotation */}
            {selectedAnnotation.tool === 'text' && (
              <div className="space-y-3 mt-3 bg-slate-850 p-2.5 rounded-lg border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-1">
                  <Type className="w-3.5 h-3.5" />
                  <span>Text Content</span>
                </div>
                <textarea
                  value={(selectedAnnotation as any).text || ''}
                  onChange={(e) => onUpdateAnnotation({ text: e.target.value } as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-white p-2 rounded outline-none focus:border-blue-500 resize-none h-16"
                  placeholder="Enter text..."
                />
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Font Size</span>
                    <span className="font-mono">{(selectedAnnotation as any).fontSize || 18}px</span>
                  </div>
                  <input
                    type="range"
                    min={12}
                    max={64}
                    value={(selectedAnnotation as any).fontSize || 18}
                    onChange={(e) => onUpdateAnnotation({ fontSize: Number(e.target.value) } as any)}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Opacity slider for all objects */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-slate-300">Opacity</label>
                <span className="text-xs font-mono text-slate-400">
                  {Math.round(((selectedAnnotation.opacity ?? 1) * 100))}%
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={selectedAnnotation.opacity ?? 1}
                onChange={(e) => onUpdateAnnotation({ opacity: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-3 border-t border-slate-800 text-center py-6 text-slate-500 text-xs">
          Select an annotation object on canvas to edit its specific properties.
        </div>
      )}
    </aside>
  );
};

