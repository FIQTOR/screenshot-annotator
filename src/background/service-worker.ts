import { Project, PageMetadata } from '../shared/types';
import { projectStorage } from '../storage/indexed-db';

// Listen to messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'CAPTURE_VISIBLE') {
    handleCaptureVisible().then(sendResponse).catch((err) => {
      console.error('Capture visible error:', err);
      sendResponse({ success: false, error: err.message });
    });
    return true; // Keep message channel open for async response
  }

  if (message.type === 'START_SELECTION_MODE') {
    handleStartSelectionMode().then(sendResponse).catch((err) => {
      console.error('Start selection error:', err);
      sendResponse({ success: false, error: err.message });
    });
    return true;
  }

  if (message.type === 'SELECTION_AREA_CAPTURED') {
    handleAreaCrop(message.data).then(sendResponse).catch((err) => {
      console.error('Area crop error:', err);
      sendResponse({ success: false, error: err.message });
    });
    return true;
  }

  if (message.type === 'CAPTURE_FULL_PAGE') {
    handleFullPageCapture().then(sendResponse).catch((err) => {
      console.error('Full page capture error:', err);
      sendResponse({ success: false, error: err.message });
    });
    return true;
  }
});

async function getActiveTab(): Promise<chrome.tabs.Tab> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    throw new Error('No active tab found.');
  }
  return tab;
}

// 1. Capture Visible Area
async function handleCaptureVisible() {
  const tab = await getActiveTab();
  
  // Capture visible viewport
  const dataUrl = await chrome.tabs.captureVisibleTab({ format: 'png' });
  
  const metadata: PageMetadata = {
    url: tab.url || '',
    title: tab.title || 'Screenshot',
    timestamp: Date.now(),
    viewportWidth: tab.width || 1280,
    viewportHeight: tab.height || 800
  };

  const project: Project = {
    id: 'proj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: (tab.title ? tab.title.slice(0, 30) : 'Screenshot') + ' - ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    screenshotDataUrl: dataUrl,
    originalWidth: tab.width || 1280,
    originalHeight: tab.height || 800,
    annotations: [],
    metadata
  };

  await projectStorage.saveProject(project);

  // Open editor tab
  const editorUrl = chrome.runtime.getURL(`editor.html?id=${project.id}`);
  await chrome.tabs.create({ url: editorUrl });

  return { success: true, projectId: project.id };
}

// 2. Start Selected Area Mode
async function handleStartSelectionMode() {
  const tab = await getActiveTab();
  if (!tab.id) throw new Error('Tab ID not found');

  // Inject selection overlay
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });

  return { success: true };
}

// Handle cropped area screenshot
async function handleAreaCrop(data: {
  startX: number;
  startY: number;
  width: number;
  height: number;
  devicePixelRatio: number;
  viewportWidth: number;
  viewportHeight: number;
  url: string;
  title: string;
}) {
  const dataUrl = await chrome.tabs.captureVisibleTab({ format: 'png' });

  // Store metadata
  const metadata: PageMetadata = {
    url: data.url,
    title: data.title || 'Selected Area Screenshot',
    timestamp: Date.now(),
    viewportWidth: data.viewportWidth,
    viewportHeight: data.viewportHeight
  };

  const project: Project = {
    id: 'proj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: (data.title ? data.title.slice(0, 30) : 'Selection') + ' - ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    screenshotDataUrl: dataUrl, // We will also pass crop coordinates to the editor or crop directly
    originalWidth: data.width,
    originalHeight: data.height,
    annotations: [],
    metadata: {
      ...metadata,
      crop: {
        x: data.startX,
        y: data.startY,
        width: data.width,
        height: data.height,
        dpr: data.devicePixelRatio
      }
    } as any
  };

  await projectStorage.saveProject(project);

  // Open editor
  const editorUrl = chrome.runtime.getURL(`editor.html?id=${project.id}&crop=1`);
  await chrome.tabs.create({ url: editorUrl });

  return { success: true, projectId: project.id };
}

// 3. Full Page Capture handler
async function handleFullPageCapture() {
  const tab = await getActiveTab();
  if (!tab.id) throw new Error('Tab ID not found');

  // Inject script to get dimensions and scroll points
  const [result] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
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
      return {
        scrollHeight,
        scrollWidth,
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
        devicePixelRatio: window.devicePixelRatio || 1,
        title: document.title,
        url: window.location.href,
        originalY: window.scrollY
      };
    }
  });

  const pageInfo = result.result;
  if (!pageInfo) throw new Error('Failed to inspect page dimensions.');

  const { scrollHeight, scrollWidth, viewportHeight, viewportWidth, devicePixelRatio, title, url, originalY } = pageInfo;
  const captures: { y: number; dataUrl: string }[] = [];

  let currentY = 0;
  while (currentY < scrollHeight) {
    // Scroll tab to currentY
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (y: number) => { window.scrollTo(0, y); },
      args: [currentY]
    });

    // Wait 150ms for scroll rendering
    await new Promise((res) => setTimeout(res, 150));

    // Capture visible portion
    const chunkUrl = await chrome.tabs.captureVisibleTab({ format: 'png' });
    captures.push({ y: currentY, dataUrl: chunkUrl });

    if (currentY + viewportHeight >= scrollHeight) {
      break;
    }
    currentY += viewportHeight;
  }

  // Restore scroll
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (origY: number) => { window.scrollTo(0, origY); },
    args: [originalY]
  });

  // Save project with stitched chunks info
  const project: Project = {
    id: 'proj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: (title ? title.slice(0, 30) : 'Full Page') + ' - ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    screenshotDataUrl: captures[0]?.dataUrl || '', // Initial chunk, editor will stitch full chunks
    originalWidth: scrollWidth,
    originalHeight: scrollHeight,
    annotations: [],
    metadata: {
      url,
      title,
      timestamp: Date.now(),
      viewportWidth,
      viewportHeight,
      fullPageChunks: captures,
      devicePixelRatio
    } as any
  };

  await projectStorage.saveProject(project);

  const editorUrl = chrome.runtime.getURL(`editor.html?id=${project.id}&fullPage=1`);
  await chrome.tabs.create({ url: editorUrl });

  return { success: true, projectId: project.id };
}

