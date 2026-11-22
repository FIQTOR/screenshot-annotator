// Full page capture injection script
// Scrolls down the page step-by-step, captures each viewport chunk, and notifies background

export interface FullPageCaptureResult {
  fullWidth: number;
  fullHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
  url: string;
  title: string;
  chunks: { y: number; dataUrl: string }[];
}

export async function captureFullPage(): Promise<void> {
  const scrollHeight = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.body.clientHeight,
    document.documentElement.clientHeight
  );

  const scrollWidth = Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.body.clientWidth,
    document.documentElement.clientWidth
  );

  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  const originalScrollY = window.scrollY;
  const originalScrollX = window.scrollX;

  // Hide sticky/fixed elements temporarily or scroll smoothly
  let currentY = 0;
  const capturePoints: number[] = [];

  while (currentY < scrollHeight) {
    capturePoints.push(currentY);
    if (currentY + viewportHeight >= scrollHeight) {
      break;
    }
    currentY += viewportHeight;
  }

  // Notify background we are starting full page capture with capture points
  chrome.runtime.sendMessage({
    type: 'START_FULL_PAGE_CAPTURE',
    data: {
      points: capturePoints,
      totalHeight: scrollHeight,
      totalWidth: scrollWidth,
      viewportHeight,
      viewportWidth,
      devicePixelRatio: window.devicePixelRatio || 1,
      url: window.location.href,
      title: document.title,
      originalScrollX,
      originalScrollY
    }
  });
}

