import { 
  Annotation, 
  RectangleAnnotation, 
  CircleAnnotation, 
  ArrowAnnotation, 
  PenAnnotation, 
  HighlightAnnotation, 
  TextAnnotation, 
  BlurAnnotation, 
  MarkerAnnotation 
} from '../../shared/types';

export function renderAnnotation(ctx: CanvasRenderingContext2D, ann: Annotation, isSelected: boolean = false) {
  ctx.save();

  if (ann.opacity !== undefined) {
    ctx.globalAlpha = ann.opacity;
  }

  switch (ann.tool) {
    case 'rectangle': {
      const rect = ann as RectangleAnnotation;
      ctx.strokeStyle = rect.color;
      ctx.lineWidth = rect.strokeWidth;
      ctx.lineJoin = 'round';
      if (rect.fill) {
        ctx.fillStyle = rect.fill;
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
      }
      ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
      break;
    }

    case 'circle': {
      const circ = ann as CircleAnnotation;
      ctx.strokeStyle = circ.color;
      ctx.lineWidth = circ.strokeWidth;
      ctx.beginPath();
      ctx.ellipse(
        circ.x,
        circ.y,
        Math.abs(circ.radiusX),
        Math.abs(circ.radiusY),
        0,
        0,
        2 * Math.PI
      );
      if (circ.fill) {
        ctx.fillStyle = circ.fill;
        ctx.fill();
      }
      ctx.stroke();
      break;
    }

    case 'arrow': {
      const arrow = ann as ArrowAnnotation;
      drawArrow(ctx, arrow.x, arrow.y, arrow.endX, arrow.endY, arrow.color, arrow.strokeWidth);
      break;
    }

    case 'pen': {
      const pen = ann as PenAnnotation;
      if (pen.points && pen.points.length > 1) {
        ctx.strokeStyle = pen.color;
        ctx.lineWidth = pen.strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(pen.points[0].x, pen.points[0].y);
        for (let i = 1; i < pen.points.length; i++) {
          ctx.lineTo(pen.points[i].x, pen.points[i].y);
        }
        ctx.stroke();
      }
      break;
    }

    case 'highlight': {
      const hl = ann as HighlightAnnotation;
      if (hl.points && hl.points.length > 1) {
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = hl.color || '#facc15';
        ctx.lineWidth = Math.max(hl.strokeWidth, 20);
        ctx.lineCap = 'square';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(hl.points[0].x, hl.points[0].y);
        for (let i = 1; i < hl.points.length; i++) {
          ctx.lineTo(hl.points[i].x, hl.points[i].y);
        }
        ctx.stroke();
        ctx.restore();
      }
      break;
    }

    case 'text': {
      const textAnn = ann as TextAnnotation;
      ctx.fillStyle = textAnn.color;
      ctx.font = `${textAnn.fontSize || 18}px ${textAnn.fontFamily || 'Inter, sans-serif'}`;
      ctx.textBaseline = 'top';
      ctx.fillText(textAnn.text || '', textAnn.x, textAnn.y);
      break;
    }

    case 'marker': {
      const mark = ann as MarkerAnnotation;
      const radius = mark.radius || 16;
      ctx.save();
      // Outer shadow & circle
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = mark.color || '#ef4444';
      ctx.beginPath();
      ctx.arc(mark.x, mark.y, radius, 0, 2 * Math.PI);
      ctx.fill();

      // Border
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Number text
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${radius * 1.05}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(mark.number.toString(), mark.x, mark.y);
      ctx.restore();
      break;
    }

    case 'blur': {
      break;
    }
  }

  // Draw Selection highlight box / handles
  if (isSelected) {
    drawSelectionOutline(ctx, ann);
  }

  ctx.restore();
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
  strokeWidth: number
) {
  const headLen = Math.max(strokeWidth * 3.5, 12);
  const angle = Math.atan2(toY - fromY, toX - fromX);

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';

  // Shaft
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  // Head
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLen * Math.cos(angle - Math.PI / 6),
    toY - headLen * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    toX - headLen * Math.cos(angle + Math.PI / 6),
    toY - headLen * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
}

export function drawSelectionOutline(ctx: CanvasRenderingContext2D, ann: Annotation) {
  const bounds = getAnnotationBounds(ann);
  const padding = 6;
  const x = bounds.minX - padding;
  const y = bounds.minY - padding;
  const w = bounds.maxX - bounds.minX + padding * 2;
  const h = bounds.maxY - bounds.minY + padding * 2;

  ctx.save();
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(x, y, w, h);

  // Draw 4 corner handles
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#3b82f6';
  ctx.setLineDash([]);
  const handleSize = 6;
  const corners = [
    { cx: x, cy: y },
    { cx: x + w, cy: y },
    { cx: x, cy: y + h },
    { cx: x + w, cy: y + h }
  ];

  corners.forEach((c) => {
    ctx.fillRect(c.cx - handleSize / 2, c.cy - handleSize / 2, handleSize, handleSize);
    ctx.strokeRect(c.cx - handleSize / 2, c.cy - handleSize / 2, handleSize, handleSize);
  });

  ctx.restore();
}

export function getAnnotationBounds(ann: Annotation): { minX: number; minY: number; maxX: number; maxY: number } {
  switch (ann.tool) {
    case 'rectangle': {
      const rect = ann as RectangleAnnotation;
      const minX = Math.min(rect.x, rect.x + rect.width);
      const maxX = Math.max(rect.x, rect.x + rect.width);
      const minY = Math.min(rect.y, rect.y + rect.height);
      const maxY = Math.max(rect.y, rect.y + rect.height);
      return { minX, minY, maxX, maxY };
    }
    case 'circle': {
      const circ = ann as CircleAnnotation;
      const rx = Math.abs(circ.radiusX);
      const ry = Math.abs(circ.radiusY);
      return { minX: circ.x - rx, minY: circ.y - ry, maxX: circ.x + rx, maxY: circ.y + ry };
    }
    case 'arrow': {
      const arrow = ann as ArrowAnnotation;
      return {
        minX: Math.min(arrow.x, arrow.endX),
        minY: Math.min(arrow.y, arrow.endY),
        maxX: Math.max(arrow.x, arrow.endX),
        maxY: Math.max(arrow.y, arrow.endY)
      };
    }
    case 'pen':
    case 'highlight': {
      const p = (ann as PenAnnotation).points || [];
      if (p.length === 0) return { minX: ann.x, minY: ann.y, maxX: ann.x, maxY: ann.y };
      let minX = p[0].x, maxX = p[0].x, minY = p[0].y, maxY = p[0].y;
      for (const pt of p) {
        if (pt.x < minX) minX = pt.x;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y < minY) minY = pt.y;
        if (pt.y > maxY) maxY = pt.y;
      }
      return { minX, minY, maxX, maxY };
    }
    case 'text': {
      const t = ann as TextAnnotation;
      const approxWidth = (t.text?.length || 1) * (t.fontSize * 0.6);
      const approxHeight = t.fontSize * 1.2;
      return { minX: t.x, minY: t.y, maxX: t.x + approxWidth, maxY: t.y + approxHeight };
    }
    case 'marker': {
      const m = ann as MarkerAnnotation;
      const r = m.radius || 16;
      return { minX: m.x - r, minY: m.y - r, maxX: m.x + r, maxY: m.y + r };
    }
    case 'blur': {
      const b = ann as BlurAnnotation;
      const minX = Math.min(b.x, b.x + b.width);
      const maxX = Math.max(b.x, b.x + b.width);
      const minY = Math.min(b.y, b.y + b.height);
      const maxY = Math.max(b.y, b.y + b.height);
      return { minX, minY, maxX, maxY };
    }
    default:
      return { minX: (ann as any).x || 0, minY: (ann as any).y || 0, maxX: ((ann as any).x || 0) + 20, maxY: ((ann as any).y || 0) + 20 };
  }
}

export function isPointInsideAnnotation(x: number, y: number, ann: Annotation): boolean {
  const bounds = getAnnotationBounds(ann);
  const pad = 8;
  return x >= bounds.minX - pad && x <= bounds.maxX + pad && y >= bounds.minY - pad && y <= bounds.maxY + pad;
}

export function applyPixelateBlur(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  pixelSize: number = 8
) {
  const startX = Math.floor(Math.min(x, x + width));
  const startY = Math.floor(Math.min(y, y + height));
  const w = Math.floor(Math.abs(width));
  const h = Math.floor(Math.abs(height));

  if (w <= 0 || h <= 0) return;

  try {
    const imgData = ctx.getImageData(startX, startY, w, h);
    const data = imgData.data;

    for (let py = 0; py < h; py += pixelSize) {
      for (let px = 0; px < w; px += pixelSize) {
        let red = 0, green = 0, blue = 0, alpha = 0, count = 0;

        for (let dy = 0; dy < pixelSize && py + dy < h; dy++) {
          for (let dx = 0; dx < pixelSize && px + dx < w; dx++) {
            const index = ((py + dy) * w + (px + dx)) * 4;
            red += data[index];
            green += data[index + 1];
            blue += data[index + 2];
            alpha += data[index + 3];
            count++;
          }
        }

        red = Math.round(red / count);
        green = Math.round(green / count);
        blue = Math.round(blue / count);
        alpha = Math.round(alpha / count);

        for (let dy = 0; dy < pixelSize && py + dy < h; dy++) {
          for (let dx = 0; dx < pixelSize && px + dx < w; dx++) {
            const index = ((py + dy) * w + (px + dx)) * 4;
            data[index] = red;
            data[index + 1] = green;
            data[index + 2] = blue;
            data[index + 3] = alpha;
          }
        }
      }
    }

    ctx.putImageData(imgData, startX, startY);
  } catch (e) {
    console.error('Blur/pixelation failed:', e);
  }
}
