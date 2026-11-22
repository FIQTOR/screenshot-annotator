import React, { useEffect, useState } from 'react';
import { 
  Camera, 
  Crop, 
  ScrollText, 
  ExternalLink, 
  Trash2, 
  Clock, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Project } from '../../shared/types';
import { projectStorage } from '../../storage/indexed-db';

export const PopupApp: React.FC = () => {
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const list = await projectStorage.getAllProjects();
      setRecentProjects(list.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCaptureVisible = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await chrome.runtime.sendMessage({ type: 'CAPTURE_VISIBLE' });
      if (!res?.success) {
        setErrorMsg(res?.error || 'Failed to capture visible tab.');
      } else {
        window.close();
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Cannot capture on this page.');
    } finally {
      setLoading(false);
    }
  };

  const handleCaptureFullPage = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await chrome.runtime.sendMessage({ type: 'CAPTURE_FULL_PAGE' });
      if (!res?.success) {
        setErrorMsg(res?.error || 'Failed to capture full page.');
      } else {
        window.close();
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Cannot capture full page on this page.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSelection = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await chrome.runtime.sendMessage({ type: 'START_SELECTION_MODE' });
      if (!res?.success) {
        setErrorMsg(res?.error || 'Failed to start selection mode.');
      } else {
        window.close();
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Selection not allowed on this page.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProject = (id: string) => {
    const editorUrl = chrome.runtime.getURL(`editor.html?id=${id}`);
    chrome.tabs.create({ url: editorUrl });
    window.close();
  };

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await projectStorage.deleteProject(id);
    await loadProjects();
  };

  const handleOpenBlankEditor = () => {
    const editorUrl = chrome.runtime.getURL('editor.html');
    chrome.tabs.create({ url: editorUrl });
    window.close();
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 p-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Camera className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-sm leading-tight text-white flex items-center gap-1.5">
              Screenshot Annotator
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-mono">v1.0</span>
            </h1>
            <p className="text-[11px] text-slate-400">Capture, annotate & share visual feedback</p>
          </div>
        </div>
      </div>

      {/* Error alert if any */}
      {errorMsg && (
        <div className="mt-3 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start gap-2 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="flex-1">{errorMsg}</span>
        </div>
      )}

      {/* Main Capture Actions */}
      <div className="grid grid-cols-3 gap-2 my-4">
        <button
          onClick={handleCaptureVisible}
          disabled={loading}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-blue-500/50 transition-all group text-center cursor-pointer shadow-sm hover:shadow"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-105 group-hover:bg-blue-500 group-hover:text-white transition-all mb-2">
            <Camera className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-200">Visible Area</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Quick capture</span>
        </button>

        <button
          onClick={handleCaptureFullPage}
          disabled={loading}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-indigo-500/50 transition-all group text-center cursor-pointer shadow-sm hover:shadow"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-105 group-hover:bg-indigo-500 group-hover:text-white transition-all mb-2">
            <ScrollText className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-200">Full Page</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Scroll & stitch</span>
        </button>

        <button
          onClick={handleStartSelection}
          disabled={loading}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-cyan-500/50 transition-all group text-center cursor-pointer shadow-sm hover:shadow"
        >
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:bg-cyan-500 group-hover:text-white transition-all mb-2">
            <Crop className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-200">Selected Area</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Custom rect</span>
        </button>
      </div>

      {/* Recent Projects Section */}
      <div className="flex-1 flex flex-col min-h-0 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Recent Projects</span>
          </div>
          <button
            onClick={handleOpenBlankEditor}
            className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
          >
            Open Editor <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[170px]">
          {recentProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-28 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-lg p-3">
              <Sparkles className="w-5 h-5 mb-1.5 text-slate-600" />
              <span>No screenshots saved yet.</span>
              <span className="text-[11px] text-slate-600 mt-0.5">Capture any webpage to start!</span>
            </div>
          ) : (
            recentProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => handleOpenProject(p.id)}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-850 hover:bg-slate-800/90 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded bg-slate-900 border border-slate-700/60 overflow-hidden shrink-0 flex items-center justify-center">
                    {p.screenshotDataUrl ? (
                      <img src={p.screenshotDataUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate group-hover:text-blue-400 transition-colors">
                      {p.name}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {new Date(p.updatedAt).toLocaleDateString()} • {p.annotations.length} items
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleDeleteProject(e, p.id)}
                    className="p-1 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded cursor-pointer transition-colors"
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
