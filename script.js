// =====================================================
// ALWAYS OPEN ON THE HERO PAGE
// Mobile browsers sometimes try to "restore" scroll position
// or jump to a section on load — this forces it back to top.
// =====================================================
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.addEventListener('load', () => {
  window.scrollTo(0, 0);
});

// =====================================================
// HERO VIDEO DIAGNOSTICS — if the background video fails
// to load (wrong filename/path), this logs a clear warning
// in the browser console (F12 → Console tab) instead of
// just silently showing a black background.
// =====================================================
const frontpageVideo = document.querySelector('.frontpage-bg-video');
if (frontpageVideo) {
  frontpageVideo.addEventListener('error', () => {
    console.warn('⚠️ frontpage background video failed to load. Check that assets/Flower_bg.mp4 exists and the filename casing matches exactly.');
  });
}

// =====================================================
// START BUTTON — scrolls to Section 1
// =====================================================
const startBtn = document.getElementById('startBtn');
if (startBtn) {
  startBtn.addEventListener('click', () => {
    const greetSection = document.getElementById('greet');
    if (greetSection) greetSection.scrollIntoView({ behavior: 'smooth' });
  });
}

// =====================================================
// GALLERY CAROUSEL — duplicate the track once so the
// CSS animation (-50% translateX) loops seamlessly.
// =====================================================
const track = document.getElementById('carouselTrack');
if (track) {
  track.innerHTML += track.innerHTML; // duplicate all images once
}

// =====================================================
// THE LETTER — click envelope to open/close. When opening,
// the fullscreen letter automatically appears shortly after
// (once the slide-out animation has played).
// =====================================================
const envelope = document.getElementById('envelope');
if (envelope) {
  envelope.addEventListener('click', () => {
    const isNowOpen = envelope.classList.toggle('open');
    if (isNowOpen) {
      setTimeout(() => {
        openLetterModal();
      }, 1100); // matches the letter-image's 0.3s delay + 0.8s slide transition
    }
  });
}

// =====================================================
// LETTER FULLSCREEN VIEWER — opens automatically after the
// envelope's slide-out animation, or by clicking the letter
// image directly afterwards. Zoom by scrolling (desktop) or
// pinching with two fingers (mobile). Close with the ×
// button or by clicking the dark background.
// =====================================================
const letterImage = document.querySelector('.letter-image');
const letterModal = document.getElementById('letterModal');
const letterModalImg = document.getElementById('letterModalImg');
const letterModalClose = document.getElementById('letterModalClose');
const letterModalViewport = document.getElementById('letterModalViewport');

// Zoom/pan state. We use a CSS transform (scale + translate) instead of
// resizing width/height — the image has max-width/max-height in CSS to fit
// the screen at rest, and those properties CAP any inline width/height JS
// sets, so the old approach could never actually grow the image. transform
// is not affected by max-width/max-height, so this actually works.
let letterScale = 1;
let letterPanX = 0;
let letterPanY = 0;
const LETTER_ZOOM_MIN = 1;
const LETTER_ZOOM_MAX = 4;

function clampLetterPan() {
  if (!letterModalImg || !letterModalViewport) return;
  // Base (unscaled, fitted) size of the image
  const baseRect = letterModalImg.getBoundingClientRect();
  // getBoundingClientRect already includes the current transform, so work
  // out the untransformed size by dividing out the current scale.
  const baseWidth = baseRect.width / letterScale;
  const baseHeight = baseRect.height / letterScale;

  const scaledWidth = baseWidth * letterScale;
  const scaledHeight = baseHeight * letterScale;

  const viewportRect = letterModalViewport.getBoundingClientRect();

  // Max pan distance so the image edge never goes past the viewport edge
  // (i.e. nothing gets "cut off" into empty space beyond the image).
  const maxPanX = Math.max(0, (scaledWidth - viewportRect.width) / 2);
  const maxPanY = Math.max(0, (scaledHeight - viewportRect.height) / 2);

  letterPanX = Math.min(maxPanX, Math.max(-maxPanX, letterPanX));
  letterPanY = Math.min(maxPanY, Math.max(-maxPanY, letterPanY));
}

function applyLetterTransform() {
  if (!letterModalImg) return;
  letterModalImg.style.transform =
    `translate(${letterPanX}px, ${letterPanY}px) scale(${letterScale})`;
}

function setLetterZoom(nextScale, focalClientX, focalClientY) {
  if (!letterModalImg || !letterModalViewport) return;
  const clamped = Math.min(LETTER_ZOOM_MAX, Math.max(LETTER_ZOOM_MIN, nextScale));

  // Zoom toward the cursor/pinch midpoint rather than the image center,
  // so zooming feels natural and you end up looking at the part you
  // pointed at instead of always recentering.
  if (focalClientX !== undefined && focalClientY !== undefined && clamped !== letterScale) {
    const viewportRect = letterModalViewport.getBoundingClientRect();
    const centerX = viewportRect.left + viewportRect.width / 2;
    const centerY = viewportRect.top + viewportRect.height / 2;

    const offsetX = focalClientX - centerX - letterPanX;
    const offsetY = focalClientY - centerY - letterPanY;
    const ratio = clamped / letterScale;

    letterPanX -= offsetX * (ratio - 1);
    letterPanY -= offsetY * (ratio - 1);
  }

  letterScale = clamped;

  if (letterScale === 1) {
    letterPanX = 0;
    letterPanY = 0;
  } else {
    clampLetterPan();
  }
  applyLetterTransform();
}

function resetLetterView() {
  letterScale = 1;
  letterPanX = 0;
  letterPanY = 0;
  applyLetterTransform();
}

function openLetterModal() {
  if (!letterModal) return;
  letterModal.classList.add('open');
  resetLetterView();
  document.body.style.overflow = 'hidden'; // lock background scroll while modal is open
}

function closeLetterModal() {
  if (!letterModal) return;
  letterModal.classList.remove('open');
  resetLetterView();
  document.body.style.overflow = '';
}

if (letterImage && letterModal) {
  letterImage.addEventListener('click', openLetterModal);
}

if (letterModalClose) {
  letterModalClose.addEventListener('click', closeLetterModal);
}

// Click the dark backdrop (not the image itself) to close
if (letterModal) {
  letterModal.addEventListener('click', (e) => {
    if (e.target === letterModal) closeLetterModal();
  });
}

// ---------- Desktop: scroll wheel to zoom, drag to pan ----------
if (letterModalViewport && letterModalImg) {
  letterModalViewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    setLetterZoom(letterScale * factor, e.clientX, e.clientY);
  }, { passive: false });

  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let panStartX = 0;
  let panStartY = 0;

  letterModalImg.addEventListener('mousedown', (e) => {
    if (letterScale <= 1) return; // nothing to pan when not zoomed
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    panStartX = letterPanX;
    panStartY = letterPanY;
    letterModalImg.style.cursor = 'grabbing';
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    letterPanX = panStartX + (e.clientX - dragStartX);
    letterPanY = panStartY + (e.clientY - dragStartY);
    clampLetterPan();
    applyLetterTransform();
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    letterModalImg.style.cursor = letterScale > 1 ? 'grab' : 'zoom-in';
  });
}

// ---------- Mobile: two-finger pinch to zoom, one-finger drag to pan ----------
let pinchStartDist = null;
let pinchStartZoom = 1;
let pinchMidX = 0;
let pinchMidY = 0;

let touchPanStartX = 0;
let touchPanStartY = 0;
let panOriginX = 0;
let panOriginY = 0;
let isTouchPanning = false;

function getTouchDist(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

function getTouchMid(touches) {
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  };
}

if (letterModalViewport) {
  letterModalViewport.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      pinchStartDist = getTouchDist(e.touches);
      pinchStartZoom = letterScale;
      const mid = getTouchMid(e.touches);
      pinchMidX = mid.x;
      pinchMidY = mid.y;
      isTouchPanning = false;
    } else if (e.touches.length === 1 && letterScale > 1) {
      isTouchPanning = true;
      touchPanStartX = e.touches[0].clientX;
      touchPanStartY = e.touches[0].clientY;
      panOriginX = letterPanX;
      panOriginY = letterPanY;
    }
  }, { passive: false });

  letterModalViewport.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && pinchStartDist) {
      e.preventDefault();
      const newDist = getTouchDist(e.touches);
      const mid = getTouchMid(e.touches);
      setLetterZoom(pinchStartZoom * (newDist / pinchStartDist), mid.x, mid.y);
    } else if (e.touches.length === 1 && isTouchPanning) {
      e.preventDefault();
      letterPanX = panOriginX + (e.touches[0].clientX - touchPanStartX);
      letterPanY = panOriginY + (e.touches[0].clientY - touchPanStartY);
      clampLetterPan();
      applyLetterTransform();
    }
  }, { passive: false });

  letterModalViewport.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) pinchStartDist = null;
    if (e.touches.length < 1) isTouchPanning = false;
  });
}

// =====================================================
// 50 REASONS GRID — auto-generates 50 image slots.
//
// 🖼️ TO EDIT YOUR IMAGES:
// Replace the file names below with your own (they should
// live in your assets/ folder). You can name them anything —
// just make sure the list has 50 entries.
// =====================================================
const REASONS_IMAGES = Array.from(
  { length: 50 },
  (_, i) => `assets/PLACEHOLDER-REASON-${i + 1}.png`
);

const reasonsGrid = document.getElementById('reasonsGrid');
if (reasonsGrid) {
  REASONS_IMAGES.forEach((src, i) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = `Reason ${i + 1}`;
    img.loading = 'lazy';
    reasonsGrid.appendChild(img);
  });
}
