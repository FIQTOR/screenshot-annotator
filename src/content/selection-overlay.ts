// Overlay script for area selection
(() => {
  if (document.getElementById('screenshot-annotator-overlay')) {
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = 'screenshot-annotator-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.zIndex = '2147483647';
  overlay.style.cursor = 'crosshair';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
  overlay.style.userSelect = 'none';

  const box = document.createElement('div');
  box.style.position = 'absolute';
  box.style.border = '2px dashed #3b82f6';
  box.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
  box.style.display = 'none';
  box.style.pointerEvents = 'none';

  const badge = document.createElement('div');
  badge.style.position = 'absolute';
  badge.style.bottom = '-28px';
  badge.style.right = '0';
  badge.style.backgroundColor = '#1e293b';
  badge.style.color = '#ffffff';
  badge.style.fontSize = '12px';
  badge.style.fontFamily = 'monospace';
  badge.style.padding = '2px 8px';
  badge.style.borderRadius = '4px';
  badge.style.whiteSpace = 'nowrap';
  badge.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
  box.appendChild(badge);

  const guideText = document.createElement('div');
  guideText.style.position = 'fixed';
  guideText.style.top = '20px';
  guideText.style.left = '50%';
  guideText.style.transform = 'translateX(-50%)';
  guideText.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
  guideText.style.color = '#fff';
  guideText.style.padding = '8px 16px';
  guideText.style.borderRadius = '8px';
  guideText.style.fontSize = '14px';
  guideText.style.fontFamily = 'sans-serif';
  guideText.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  guideText.innerText = 'Drag mouse to select area • Press ESC or click Cancel to exit';

  overlay.appendChild(box);
  overlay.appendChild(guideText);
  document.body.appendChild(overlay);

  let isDrawing = false;
  let startX = 0;
  let startY = 0;

  function cleanup() {
    window.removeEventListener('keydown', onKeyDown);
    if (overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      cleanup();
    }
  }

  window.addEventListener('keydown', onKeyDown);

  overlay.addEventListener('mousedown', (e) => {
    isDrawing = true;
    startX = e.clientX;
    startY = e.clientY;
    box.style.left = `${startX}px`;
    box.style.top = `${startY}px`;
    box.style.width = '0px';
    box.style.height = '0px';
    box.style.display = 'block';
  });

  overlay.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const currentX = e.clientX;
    const currentY = e.clientY;

    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    box.style.left = `${left}px`;
    box.style.top = `${top}px`;
    box.style.width = `${width}px`;
    box.style.height = `${height}px`;

    badge.innerText = `${Math.round(width)} × ${Math.round(height)} px`;
  });

  overlay.addEventListener('mouseup', (e) => {
    if (!isDrawing) return;
    isDrawing = false;

    const currentX = e.clientX;
    const currentY = e.clientY;

    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    cleanup();

    if (width > 10 && height > 10) {
      // Send crop coordinates to background
      chrome.runtime.sendMessage({
        type: 'SELECTION_AREA_CAPTURED',
        data: {
          startX: left,
          startY: top,
          width: width,
          height: height,
          devicePixelRatio: window.devicePixelRatio || 1,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          url: window.location.href,
          title: document.title
        }
      });
    }
  });
})();

