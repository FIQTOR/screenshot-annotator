import { describe, it, expect } from 'vitest';
import { 
  getAnnotationBounds, 
  isPointInsideAnnotation 
} from '../src/editor/canvas/renderers';
import { Annotation } from '../src/shared/types';

describe('Annotation Canvas Utilities', () => {
  it('correctly calculates rectangle bounds', () => {
    const rect: Annotation = {
      id: 'rect_1',
      tool: 'rectangle',
      x: 100,
      y: 150,
      width: 200,
      height: 100,
      color: '#ef4444',
      strokeWidth: 2
    };

    const bounds = getAnnotationBounds(rect);
    expect(bounds).toEqual({
      minX: 100,
      minY: 150,
      maxX: 300,
      maxY: 250
    });
  });

  it('detects point inside an annotation', () => {
    const rect: Annotation = {
      id: 'rect_2',
      tool: 'rectangle',
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      color: '#3b82f6',
      strokeWidth: 2
    };

    expect(isPointInsideAnnotation(75, 75, rect)).toBe(true);
    expect(isPointInsideAnnotation(250, 250, rect)).toBe(false);
  });

  it('correctly calculates arrow bounds', () => {
    const arrow: Annotation = {
      id: 'arrow_1',
      tool: 'arrow',
      x: 10,
      y: 20,
      endX: 80,
      endY: 90,
      color: '#22c55e',
      strokeWidth: 4
    } as any;

    const bounds = getAnnotationBounds(arrow);
    expect(bounds).toEqual({
      minX: 10,
      minY: 20,
      maxX: 80,
      maxY: 90
    });
  });
});

