import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Annotation, ToolType, Project } from '../../shared/types';
import { 
  renderAnnotation, 
  isPointInsideAnnotation, 
  applyPixelateBlur 
} from '../canvas/renderers';

interface WorkspaceProps {
  project: Project | null;
  annotations: Annotation[];
  selectedId: string | null;
  currentTool: ToolType;
  currentColor: string;
  currentStrokeWidth: number;
  scale: number;
  onAddAnnotation: (ann: Annotation) => void;
  onUpdateAnnotation: (id: string, updated: Partial<Annotation>) => void;
  onSelectAnnotation: (id: string | null) => void;
  nextMarkerNumber: number;
  onIncrementMarker: () => void;
}

export const WorkspaceCanvas: React.FC<WorkspaceProps> = ({
  project,
  annotations,
  selectedId,
  currentTool,
  currentColor,
  currentStrokeWidth,
  scale,
  onAddAnnotation,
  onUpdateAnnotation,
  onSelectAnnotation,
  nextMarkerNumber,
  onIncrementMarker
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [currentDraft, setCurrentDraft] = useState<Annotation | null>(null);
  const [draggedAnnotationInitial, setDraggedAnnotationInitial] = useState<Annotation | null>(null);

  // Load and cache base screenshot
  useEffect(() => {
    if (!project?.screenshotDataUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = project.screenshotDataUrl;
    img.onload = () => {
      bgImageRef.current = img;
      redraw();
    };
  }, [project?.screenshotDataUrl]);

  // Convert mouse client coordinates to Canvas internal coordinates
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    return { x, y };
  };

  // Redraw Canvas
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw Background Screenshot
    if (bgImageRef.current) {
      // Check if cropped area metadata exists
      const crop = (project?.metadata as any)?.crop;
      if (crop) {
        const dpr = crop.dpr || 1;
        ctx.drawImage(
          bgImageRef.current,
          crop.x * dpr,
          crop.y * dpr,
          crop.width * dpr,
          crop.height * dpr,
          0,
          0,
          w,
          h
        );
      } else {
        ctx.drawImage(bgImageRef.current, 0, 0, w, h);
      }
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, w, h);
    }

    // 2. Apply Blur Annotations directly on the image layer
    const blurList = annotations.filter((a) => a.tool === 'blur');
    if (currentDraft && currentDraft.tool === 'blur') {
      blurList.push(currentDraft);
    }

    for (const b of blurList) {
      applyPixelateBlur(ctx, b.x, b.y, b.width || 0, b.height || 0, 10);
    }

    // 3. Render all other Annotations
    for (const ann of annotations) {
      if (ann.tool === 'blur') continue;
      renderAnnotation(ctx, ann, ann.id === selectedId);
    }

    // 4. Render currently drawing draft
    if (currentDraft && currentDraft.tool !== 'blur') {
      renderAnnotation(ctx, currentDraft, false);
    }
  }, [annotations, selectedId, currentDraft, project, scale]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    setIsDrawing(true);
    setDragStart({ x, y });

    // Mode: Select / Move
    if (currentTool === 'select') {
      // Check if clicked inside any annotation (top to bottom)
      const clicked = [...annotations].reverse().find((ann) => isPointInsideAnnotation(x, y, ann));
      if (clicked) {
        onSelectAnnotation(clicked.id);
        setDraggedAnnotationInitial({ ...clicked });
      } else {
        onSelectAnnotation(null);
        setDraggedAnnotationInitial(null);
      }
      return;
    }

    // Mode: Numbered Marker (single click placement)
    if (currentTool === 'marker') {
      const newMarker: Annotation = {
        id: 'mark_' + Date.now(),
        tool: 'marker',
        x,
        y,
        color: currentColor,
        strokeWidth: currentStrokeWidth,
        number: nextMarkerNumber,
        radius: 16
      } as any;
      onAddAnnotation(newMarker);
      onIncrementMarker();
      setIsDrawing(false);
      return;
    }

    // Mode: Text (place prompt/default text)
    if (currentTool === 'text') {
      const newText: Annotation = {
        id: 'txt_' + Date.now(),
        tool: 'text',
        x,
        y,
        text: 'Feedback text...',
        fontSize: 20,
        fontFamily: 'Inter, sans-serif',
        color: currentColor,
        strokeWidth: currentStrokeWidth
      } as any;
      onAddAnnotation(newText);
      onSelectAnnotation(newText.id);
      setIsDrawing(false);
      return;
    }

    // Initialize Draft for Arrow, Rectangle, Circle, Pen, Highlight, Blur
    const id = 'ann_' + Date.now();
    if (currentTool === 'rectangle') {
      setCurrentDraft({
        id,
        tool: 'rectangle',
        x,
        y,
        width: 0,
        height: 0,
        color: currentColor,
        strokeWidth: currentStrokeWidth
      } as any);
    } else if (currentTool === 'circle') {
      setCurrentDraft({
        id,
        tool: 'circle',
        x,
        y,
        radiusX: 0,
        radiusY: 0,
        color: currentColor,
        strokeWidth: currentStrokeWidth
      } as any);
    } else if (currentTool === 'arrow') {
      setCurrentDraft({
        id,
        tool: 'arrow',
        x,
        y,
        endX: x,
        endY: y,
        color: currentColor,
        strokeWidth: currentStrokeWidth
      } as any);
    } else if (currentTool === 'pen') {
      setCurrentDraft({
        id,
        tool: 'pen',
        x,
        y,
        points: [{ x, y }],
        color: currentColor,
        strokeWidth: currentStrokeWidth
      } as any);
    } else if (currentTool === 'highlight') {
      setCurrentDraft({
        id,
        tool: 'highlight',
        x,
        y,
        points: [{ x, y }],
        color: currentColor || '#facc15',
        strokeWidth: 24
      } as any);
    } else if (currentTool === 'blur') {
      setCurrentDraft({
        id,
        tool: 'blur',
        x,
        y,
        width: 0,
        height: 0,
        color: '#000000',
        strokeWidth: 1
      } as any);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const { x, y } = getCanvasCoords(e);

    // If moving selected object
    if (currentTool === 'select' && selectedId && dragStart && draggedAnnotationInitial) {
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;
      
      if (draggedAnnotationInitial.tool === 'arrow') {
        const arrow = draggedAnnotationInitial as any;
        onUpdateAnnotation(selectedId, {
          x: arrow.x + dx,
          y: arrow.y + dy,
          endX: arrow.endX + dx,
          endY: arrow.endY + dy
        } as any);
      } else if (draggedAnnotationInitial.tool === 'pen' || draggedAnnotationInitial.tool === 'highlight') {
        const pen = draggedAnnotationInitial as any;
        const newPoints = pen.points.map((pt: any) => ({ x: pt.x + dx, y: pt.y + dy }));
        onUpdateAnnotation(selectedId, {
          x: pen.x + dx,
          y: pen.y + dy,
          points: newPoints
        } as any);
      } else {
        onUpdateAnnotation(selectedId, {
          x: draggedAnnotationInitial.x + dx,
          y: draggedAnnotationInitial.y + dy
        });
      }
      return;
    }

    // If drawing draft
    if (!currentDraft || !dragStart) return;

    if (currentDraft.tool === 'rectangle' || currentDraft.tool === 'blur') {
      setCurrentDraft({
        ...currentDraft,
        width: x - dragStart.x,
        height: y - dragStart.y
      } as any);
    } else if (currentDraft.tool === 'circle') {
      setCurrentDraft({
        ...currentDraft,
        radiusX: Math.abs(x - dragStart.x),
        radiusY: Math.abs(y - dragStart.y)
      } as any);
    } else if (currentDraft.tool === 'arrow') {
      setCurrentDraft({
        ...currentDraft,
        endX: x,
        endY: y
      } as any);
    } else if (currentDraft.tool === 'pen' || currentDraft.tool === 'highlight') {
      const prevPoints = (currentDraft as any).points || [];
      setCurrentDraft({
        ...currentDraft,
        points: [...prevPoints, { x, y }]
      } as any);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentDraft) {
      onAddAnnotation(currentDraft);
      setCurrentDraft(null);
    }
    setDragStart(null);
    setDraggedAnnotationInitial(null);
  };

  // Canvas size
  const canvasWidth = project?.originalWidth || 1280;
  const canvasHeight = project?.originalHeight || 800;

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-slate-950 overflow-auto flex items-center justify-center p-8 relative"
      style={{
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 0)',
        backgroundSize: '24px 24px'
      }}
    >
      <div
        className="shadow-2xl shadow-black/80 rounded-sm border border-slate-800 bg-slate-900 transition-transform origin-center"
        style={{
          width: canvasWidth * scale,
          height: canvasHeight * scale
        }}
      >
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="w-full h-full cursor-crosshair block"
        />
      </div>
    </div>
  );
};

