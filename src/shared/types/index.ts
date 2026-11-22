export type ToolType = 
  | 'select'
  | 'arrow'
  | 'rectangle'
  | 'circle'
  | 'pen'
  | 'text'
  | 'highlight'
  | 'blur'
  | 'marker';

export interface BaseAnnotation {
  id: string;
  tool: ToolType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color: string;
  strokeWidth: number;
  opacity?: number;
}

export interface RectangleAnnotation extends BaseAnnotation {
  tool: 'rectangle';
  width: number;
  height: number;
  fill?: string;
}

export interface CircleAnnotation extends BaseAnnotation {
  tool: 'circle';
  radiusX: number;
  radiusY: number;
  fill?: string;
}

export interface ArrowAnnotation extends BaseAnnotation {
  tool: 'arrow';
  endX: number;
  endY: number;
}

export interface PenAnnotation extends BaseAnnotation {
  tool: 'pen';
  points: { x: number; y: number }[];
}

export interface HighlightAnnotation extends BaseAnnotation {
  tool: 'highlight';
  points: { x: number; y: number }[];
}

export interface TextAnnotation extends BaseAnnotation {
  tool: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
}

export interface BlurAnnotation extends BaseAnnotation {
  tool: 'blur';
  width: number;
  height: number;
  blurRadius?: number;
}

export interface MarkerAnnotation extends BaseAnnotation {
  tool: 'marker';
  number: number;
  radius: number;
}

export type Annotation =
  | RectangleAnnotation
  | CircleAnnotation
  | ArrowAnnotation
  | PenAnnotation
  | HighlightAnnotation
  | TextAnnotation
  | BlurAnnotation
  | MarkerAnnotation;

export interface PageMetadata {
  url: string;
  title: string;
  timestamp: number;
  viewportWidth: number;
  viewportHeight: number;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  screenshotDataUrl: string;
  originalWidth: number;
  originalHeight: number;
  annotations: Annotation[];
  metadata: PageMetadata;
}

export interface SelectionArea {
  startX: number;
  startY: number;
  width: number;
  height: number;
  devicePixelRatio: number;
}

