import React from 'react';
import {
  Camera,
  Undo2,
  Redo2,
  Download,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileJson
} from 'lucide-react';

interface TopNavbarProps {
  projectName: string;
  onRenameProject: (name: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitScreen: () => void;
  onExport: (format: 'png' | 'jpg' | 'json' | 'copy') => void;
  isSaving: boolean;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  projectName,
  onRenameProject,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  scale,
  onZoomIn,
  onZoomOut,
  onFitScreen,
  onExport,
  isSaving
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    onExport('copy');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between select-none z-30">
      {/* Brand & Project Name */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm">
          <Camera className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={projectName}
            onChange={(e) => onRenameProject(e.target.value)}
            className="bg-transparent text-sm font-medium text-slate-100 hover:bg-slate-800/80 focus:bg-slate-800 px-2 py-1 rounded border border-transparent focus:border-blue-500 outline-none w-48 sm:w-64 transition-all"
            title="Click to rename"
          />
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            {isSaving ? (
              <span className="text-amber-400 animate-pulse">Saving...</span>
            ) : (
              <span className="text-emerald-400">● Saved</span>
            )}
          </span>
        </div>
      </div>

      {/* Center Controls: Undo, Redo, Zoom */}
      <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="p-1.5 text-slate-300 hover:text-white disabled:text-slate-600 hover:bg-slate-700 rounded transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
          className="p-1.5 text-slate-300 hover:text-white disabled:text-slate-600 hover:bg-slate-700 rounded transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-slate-700 mx-1" />

        <button
          onClick={onZoomOut}
          title="Zoom Out"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-all cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono text-slate-300 min-w-12 text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={onZoomIn}
          title="Zoom In"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-all cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={onFitScreen}
          title="Fit to Screen"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-all cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Export & Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-slate-700 transition-all cursor-pointer"
          title="Copy Image to Clipboard"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>

        <button
          onClick={() => onExport('png')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-sm transition-all cursor-pointer"
          title="Export PNG"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export PNG</span>
        </button>

        <button
          onClick={() => onExport('jpg')}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-all cursor-pointer"
          title="Export JPG"
        >
          JPG
        </button>

        <button
          onClick={() => onExport('json')}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-all cursor-pointer"
          title="Export Project JSON"
        >
          <FileJson className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

