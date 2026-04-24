import { createRoot } from 'react-dom/client';
import App from './App';

// Create a container for the extension
const container = document.createElement('div');
container.id = 'notepin-root';
container.style.position = 'fixed';
container.style.inset = '0';
container.style.zIndex = '2147483647';
container.style.pointerEvents = 'none';
document.documentElement.appendChild(container);

// Create Shadow DOM
const shadow = container.attachShadow({ mode: 'open' });

// Create a root for React inside the shadow DOM
const reactRoot = document.createElement('div');
reactRoot.id = 'notepin-app';
reactRoot.style.width = '100vw';
reactRoot.style.height = '100vh';
reactRoot.style.pointerEvents = 'none';
reactRoot.style.transformOrigin = '0 0';
reactRoot.style.willChange = 'transform';
shadow.appendChild(reactRoot);

const cssHref = typeof chrome !== 'undefined' && chrome.runtime?.getURL ? chrome.runtime.getURL('main.css') : '';
if (cssHref) {
  const cssLink = document.createElement('link');
  cssLink.rel = 'stylesheet';
  cssLink.href = cssHref;
  shadow.appendChild(cssLink);
}

let scrollRaf: number | null = null;
const updateTransform = () => {
  scrollRaf = null;
  reactRoot.style.transform = `translate3d(${-window.scrollX}px, ${-window.scrollY}px, 0)`;
};
const requestTransform = () => {
  if (scrollRaf !== null) return;
  scrollRaf = requestAnimationFrame(updateTransform);
};

window.addEventListener('scroll', requestTransform, { passive: true });
window.addEventListener('resize', requestTransform);
requestTransform();

const getUniqueSelector = (el: HTMLElement): string => {
  if (el.id) return `#${el.id}`;
  if (el.tagName === 'BODY') return 'body';

  let selector = el.tagName.toLowerCase();
  if (el.className && typeof el.className === 'string') {
    const classes = el.className.trim().split(/\s+/).filter((c) => c && !c.includes(':')).join('.');
    if (classes) selector += `.${classes}`;
  }

  const parent = el.parentElement;
  if (parent) {
    const children = Array.from(parent.children);
    const index = children.indexOf(el) + 1;
    selector = `${getUniqueSelector(parent)} > ${selector}:nth-child(${index})`;
  }

  return selector;
};

const findScrollableAncestor = (start: HTMLElement | null): HTMLElement | null => {
  let el: HTMLElement | null = start;
  for (let i = 0; i < 16 && el; i++) {
    if (el.tagName === 'HTML' || el.tagName === 'BODY') return null;
    const style = window.getComputedStyle(el);
    const canScrollY =
      (style.overflowY === 'auto' || style.overflowY === 'scroll' || style.overflowY === 'overlay') &&
      el.scrollHeight > el.clientHeight + 4;
    const canScrollX =
      (style.overflowX === 'auto' || style.overflowX === 'scroll' || style.overflowX === 'overlay') &&
      el.scrollWidth > el.clientWidth + 4;
    if (canScrollY || canScrollX) return el;
    el = el.parentElement;
  }
  return null;
};

// --- Hold-to-open logic ---
let holdTimer: ReturnType<typeof setTimeout> | null = null;
let menuOpened = false;

document.addEventListener('mousedown', (e) => {
  if (e.button !== 2) return;
  menuOpened = false;
  
  if (holdTimer) clearTimeout(holdTimer);
  
  holdTimer = setTimeout(() => {
    const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    let anchor:
      | {
          selector?: string;
          offsetX?: number;
          offsetY?: number;
          containerSelector?: string;
          containerX?: number;
          containerY?: number;
          anchorTag?: string;
          anchorText?: string;
        }
      | undefined;

    if (target && target.tagName !== 'BODY' && target.tagName !== 'HTML') {
      const rect = target.getBoundingClientRect();
      const scrollContainer = findScrollableAncestor(target);
      const raw = (target.getAttribute('aria-label') || target.textContent || '').trim().replace(/\s+/g, ' ');
      anchor = {
        selector: getUniqueSelector(target),
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        anchorTag: target.tagName.toLowerCase(),
        anchorText: raw ? raw.slice(0, 80) : undefined,
      };

      if (scrollContainer) {
        const containerRect = scrollContainer.getBoundingClientRect();
        anchor.containerSelector = getUniqueSelector(scrollContainer);
        anchor.containerX = scrollContainer.scrollLeft + (e.clientX - containerRect.left);
        anchor.containerY = scrollContainer.scrollTop + (e.clientY - containerRect.top);
      }
    }

    menuOpened = true;
    window.dispatchEvent(new CustomEvent('noteoverlay:open-menu', {
      detail: { x: e.clientX, y: e.clientY, anchor }
    }));
  }, 1000); // 1 second
}, true);

document.addEventListener('mouseup', (e) => {
  if (e.button !== 2) return;
  if (holdTimer) {
    clearTimeout(holdTimer);
    holdTimer = null;
  }
}, true);

document.addEventListener('contextmenu', (e) => {
  // If the menu was opened by holding, prevent the browser menu
  if (menuOpened) {
    e.preventDefault();
    e.stopPropagation();
    menuOpened = false; // Reset
  }
}, true);

createRoot(reactRoot).render(<App />);
