# AGENTS.md — Screenshot Annotator

Guidelines for AI agents working in this repository.

## Overview
Modern Chrome Extension (Manifest V3) for full-page, visible area, and selected area screenshots, visual annotation, sensitive data blurring, and export.

## Tech Stack & Architecture
- **Framework**: TypeScript, Vite, Tailwind CSS, HTML5 Canvas / Fabric / SVG annotation layers.
- **Pages**: `popup.html` (quick capture actions) & `editor.html` (interactive canvas editing suite).
- **Testing**: Vitest (`tests/annotations.test.ts`).

## Key Commands
```bash
npm install
npm run build      # Build extension bundle into dist/
npm test           # Run annotation unit tests
```

## Guidelines
- Coordinate between background script (`chrome.tabs.captureVisibleTab`) and content scripts for viewport stitching.
- Maintain high rendering performance when applying blur or annotation strokes over large canvas dimensions.

