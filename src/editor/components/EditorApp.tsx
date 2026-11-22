import React, { useState, useEffect, useCallback } from 'react';
import { Project, Annotation, ToolType } from '../../shared/types';
import { projectStorage } from '../../storage/indexed-db';
import { TopNavbar } from './TopNavbar';
import { LeftToolbar } from './LeftToolbar';
import { WorkspaceCanvas } from './WorkspaceCanvas';
import { PropertiesPanel } from './PropertiesPanel';
import { applyPixelateBlur, renderAnnotation } from '../canvas/renderers';

export const EditorApp: React.FC = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [history, setHistory] = useState<Annotation[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Active Tool & Style State
  const [currentTool, setCurrentTool] = useState<ToolType>('arrow');
  const [currentColor, setCurrentColor] = useState<string>('#ef4444');
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState<number>(4);
  const [scale, setScale] = useState<number>(0.85);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [nextMarkerNumber, setNextMarkerNumber] = useState<number>(1);

  // Initialize Project from URL query ?id=xxx
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');

    if (projectId) {
      projectStorage.getProject(projectId).then((p) => {
        if (p) {
          if ((p.metadata as any)?.fullPageChunks) {
            stitchFullPageChunks(p);
          } else {
            setProject(p);
            setAnnotations(p.annotations || []);
            setHistory([p.annotations || []]);
            setHistoryIndex(0);
          }
        }
      });
    } else {
      const blank: Project = {
        id: 'proj_' + Date.now(),
        name: 'Untitled Project',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        screenshotDataUrl: '',
        originalWidth: 1280,
        originalHeight: 800,
        annotations: [],
        metadata: {
          url: '',
          title: 'Blank Canvas',
          timestamp: Date.now(),
          viewportWidth: 1280,
          viewportHeight: 800
        }
      };
      setProject(blank);
      setHistory([[]]);
      setHistoryIndex(0);
    }
  }, []);

  const stitchFullPageChunks = async (p: Project) => {
    const chunks: { y: number; dataUrl: string }[] = (p.metadata as any)?.fullPageChunks || [];
    if (chunks.length === 0) {
      setProject(p);
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = p.originalWidth;
    canvas.height = p.originalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    for (const chunk of chunks) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.src = chunk.dataUrl;
        img.onload = () => {
          ctx.drawImage(img, 0, chunk.y);
          resolve();
        };
      });
    }

    const fullDataUrl = canvas.toDataURL('image/png');
    const updatedProject: Project = {
      ...p,
      screenshotDataUrl: fullDataUrl
    };

    setProject(updatedProject);
    setAnnotations(updatedProject.annotations || []);
    setHistory([updatedProject.annotations || []]);
    setHistoryIndex(0);

    await projectStorage.saveProject(updatedProject);
  };

  const pushHistory = useCallback((newAnnotations: Annotation[]) => {
    setHistory((prev) => {
      const updated = prev.slice(0, historyIndex + 1);
      return [...updated, newAnnotations];
    });
    setHistoryIndex((prev) => prev + 1);
    setAnnotations(newAnnotations);
    triggerAutoSave(newAnnotations);
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      const state = history[newIdx];
      setAnnotations(state);
      triggerAutoSave(state);
      setSelectedId(null);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      const state = history[newIdx];
      setAnnotations(state);
      triggerAutoSave(state);
      setSelectedId(null);
    }
  }, [historyIndex, history]);

  const triggerAutoSave = useCallback(async (currentAnns: Annotation[], newName?: string) => {
    if (!project) return;
    setIsSaving(true);
    const updated: Project = {
      ...project,
      name: newName ?? project.name,
      annotations: currentAnns,
      updatedAt: Date.now()
    };
    await projectStorage.saveProject(updated);
    setProject(updated);
    setTimeout(() => setIsSaving(false), 300);
  }, [project]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        handleRedo();
        e.preventDefault();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) {
          handleDeleteAnnotation();
          e.preventDefault();
        }
      } else if (e.key.toLowerCase() === 'v') {
        setCurrentTool('select');
      } else if (e.key.toLowerCase() === 'a') {
        setCurrentTool('arrow');
      } else if (e.key.toLowerCase() === 'r') {
        setCurrentTool('rectangle');
      } else if (e.key.toLowerCase() === 'c') {
        setCurrentTool('circle');
      } else if (e.key.toLowerCase() === 'p') {
        setCurrentTool('pen');
      } else if (e.key.toLowerCase() === 't') {
        setCurrentTool('text');
      } else if (e.key.toLowerCase() === 'h') {
        setCurrentTool('highlight');
      } else if (e.key.toLowerCase() === 'b') {
        setCurrentTool('blur');
      } else if (e.key.toLowerCase() === 'm') {
        setCurrentTool('marker');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, selectedId]);

  const handleAddAnnotation = (ann: Annotation) => {
    const updated = [...annotations, ann];
    pushHistory(updated);
  };

  const handleUpdateAnnotation = (id: string, updatedProps: Partial<Annotation>) => {
    const updated = annotations.map((a) => (a.id === id ? ({ ...a, ...updatedProps } as Annotation) : a));
    pushHistory(updated);
  };

  const handleDeleteAnnotation = () => {
    if (!selectedId) return;
    const updated = annotations.filter((a) => a.id !== selectedId);
    setSelectedId(null);
    pushHistory(updated);
  };

  const handleDuplicateAnnotation = () => {
    if (!selectedId) return;
    const target = annotations.find((a) => a.id === selectedId);
    if (!target) return;
    const dup: Annotation = {
      ...target,
      id: 'ann_' + Date.now(),
      x: target.x + 20,
      y: target.y + 20
    };
    const updated = [...annotations, dup];
    pushHistory(updated);
    setSelectedId(dup.id);
  };

  const generateExportCanvas = async (): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement('canvas');
    const w = project?.originalWidth || 1280;
    const h = project?.originalHeight || 800;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get canvas 2D context');

    if (project?.screenshotDataUrl) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = project.screenshotDataUrl;
        img.onload = () => {
          const crop = (project?.metadata as any)?.crop;
          if (crop) {
            const dpr = crop.dpr || 1;
            ctx.drawImage(img, crop.x * dpr, crop.y * dpr, crop.width * dpr, crop.height * dpr, 0, 0, w, h);
          } else {
            ctx.drawImage(img, 0, 0, w, h);
          }
          resolve();
        };
      });
    }

    const blurs = annotations.filter((a) => a.tool === 'blur');
    for (const b of blurs) {
      applyPixelateBlur(ctx, b.x, b.y, b.width || 0, b.height || 0, 10);
    }

    for (const ann of annotations) {
      if (ann.tool === 'blur') continue;
      renderAnnotation(ctx, ann, false);
    }

    return canvas;
  };

  const handleExport = async (format: 'png' | 'jpg' | 'json' | 'copy') => {
    if (!project) return;

    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `${project.name.replace(/\s+/g, '_')}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      return;
    }

    const exportCanvas = await generateExportCanvas();

    if (format === 'copy') {
      exportCanvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
        } catch (err) {
          console.error('Failed to copy to clipboard:', err);
        }
      }, 'image/png');
      return;
    }

    const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const ext = format === 'jpg' ? 'jpg' : 'png';
    const dataUrl = exportCanvas.toDataURL(mime, 0.95);

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${project.name.replace(/\s+/g, '_')}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const selectedAnnotation = annotations.find((a) => a.id === selectedId) || null;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      <TopNavbar
        projectName={project?.name || 'Screenshot Annotator'}
        onRenameProject={(newName: string) => {
          if (project) {
            setProject({ ...project, name: newName });
            triggerAutoSave(annotations, newName);
          }
        }}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        scale={scale}
        onZoomIn={() => setScale((s) => Math.min(s + 0.1, 2.5))}
        onZoomOut={() => setScale((s) => Math.max(s - 0.1, 0.2))}
        onFitScreen={() => setScale(0.85)}
        onExport={handleExport}
        isSaving={isSaving}
      />

      <div className="flex flex-1 min-h-0 relative">
        <LeftToolbar
          currentTool={currentTool}
          onSelectTool={setCurrentTool}
          nextMarkerNumber={nextMarkerNumber}
        />

        <WorkspaceCanvas
          project={project}
          annotations={annotations}
          selectedId={selectedId}
          currentTool={currentTool}
          currentColor={currentColor}
          currentStrokeWidth={currentStrokeWidth}
          scale={scale}
          onAddAnnotation={handleAddAnnotation}
          onUpdateAnnotation={handleUpdateAnnotation}
          onSelectAnnotation={setSelectedId}
          nextMarkerNumber={nextMarkerNumber}
          onIncrementMarker={() => setNextMarkerNumber((n) => n + 1)}
        />

        <PropertiesPanel
          selectedAnnotation={selectedAnnotation}
          onUpdateAnnotation={(props) => {
            if (selectedId) handleUpdateAnnotation(selectedId, props);
          }}
          onDeleteAnnotation={handleDeleteAnnotation}
          onDuplicateAnnotation={handleDuplicateAnnotation}
          currentColor={currentColor}
          onChangeCurrentColor={setCurrentColor}
          currentStrokeWidth={currentStrokeWidth}
          onChangeCurrentStrokeWidth={setCurrentStrokeWidth}
        />
      </div>
    </div>
  );
};
