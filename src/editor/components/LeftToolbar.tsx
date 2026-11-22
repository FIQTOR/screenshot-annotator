import React from 'react';
import {
  MousePointer,
  ArrowRight,
  Square,
  Circle,
  PenTool,
  Type,
  Highlighter,
  EyeOff,
  ListOrdered
} from 'lucide-react';
import { ToolType } from '../../shared/types';

interface LeftToolbarProps {
  currentTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  nextMarkerNumber: number;
}

interface ToolItem {
  id: ToolType;
  label: string;
  icon: React.ReactNode;
  shortcut: string;
  badge?: string | number;
}

export const LeftToolbar: React.FC<LeftToolbarProps> = ({
  currentTool,
  onSelectTool,
  nextMarkerNumber
}) => {
  const tools: ToolItem[] = [
    { id: 'select', label: 'Select / Move', icon: <MousePointer className="w-4 h-4" />, shortcut: 'V' },
    { id: 'arrow', label: 'Arrow Tool', icon: <ArrowRight className="w-4 h-4" />, shortcut: 'A' },
    { id: 'rectangle', label: 'Rectangle', icon: <Square className="w-4 h-4" />, shortcut: 'R' },
    { id: 'circle', label: 'Circle', icon: <Circle className="w-4 h-4" />, shortcut: 'C' },
    { id: 'pen', label: 'Pen / Freehand', icon: <PenTool className="w-4 h-4" />, shortcut: 'P' },
    { id: 'text', label: 'Text', icon: <Type className="w-4 h-4" />, shortcut: 'T' },
    { id: 'highlight', label: 'Highlight', icon: <Highlighter className="w-4 h-4" />, shortcut: 'H' },
    { id: 'blur', label: 'Privacy Blur', icon: <EyeOff className="w-4 h-4" />, shortcut: 'B' },
    { id: 'marker', label: 'Numbered Marker', icon: <ListOrdered className="w-4 h-4" />, shortcut: 'M', badge: nextMarkerNumber }
  ];

  return (
    <aside className="w-14 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-3 select-none z-20">
      <div className="flex flex-col gap-1.5 w-full px-2">
        {tools.map((item) => {
          const isActive = currentTool === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTool(item.id)}
              title={`${item.label} (${item.shortcut})`}
              className={`relative flex items-center justify-center w-10 h-10 rounded-lg transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              {item.icon}
              {item.badge !== undefined && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-slate-900">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};

