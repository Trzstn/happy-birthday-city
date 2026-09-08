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
document.getElementById('startBtn').addEventListener('click', () => {
  document.getElementById('greet').scrollIntoView({ behavior: 'smooth' });
});

// =====================================================
// GALLERY CAROUSEL — duplicate the track once so the
// CSS animation (-50% translateX) loops seamlessly.
// =====================================================
const track = document.getElementById('carouselTrack');
if (track) {
  track.innerHTML += track.innerHTML; // duplicate all images once
}

// =====================================================
// THE LETTER — click envelope to open/close
// =====================================================
const envelope = document.getElementById('envelope');
if (envelope) {
  envelope.addEventListener('click', () => {
    envelope.classList.toggle('open');
  });
}

// =====================================================
// LETTER FULLSCREEN VIEWER — click the letter image (once
// it's slid out of the envelope) to view it fullscreen.
// Zoom by scrolling (desktop) or pinching with two fingers
// (mobile), then drag/swipe to pan around while zoomed in.
// Close with the × button or by clicking the dark background.
// =====================================================
const letterImage = document.querySelector('.letter-image');
const letterModal = document.getElementById('letterModal');
const letterModalImg = document.getElementById('letterModalImg');
const letterModalClose = document.getElementById('letterModalClose');
const letterModalViewport = document.getElementById('letterModalViewport');

let letterZoom = 1;
let letterPanX = 0;
let letterPanY = 0;
const LETTER_ZOOM_MIN = 1;
const LETTER_ZOOM_MAX = 3;

function updateLetterTransform() {
  if (letterModalImg) {
    letterModalImg.style.transform = `translate(${letterPanX}px, ${letterPanY}px) scale(${letterZoom})`;
  }
}

function setLetterZoom(zoom) {
  letterZoom = Math.min(LETTER_ZOOM_MAX, Math.max(LETTER_ZOOM_MIN, zoom));
  updateLetterTransform();
}

function resetLetterView() {
  letterZoom = 1;
  letterPanX = 0;
  letterPanY = 0;
  updateLetterTransform();
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

// Desktop: scroll wheel to zoom in/out
if (letterModalViewport) {
  letterModalViewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    setLetterZoom(letterZoom + (e.deltaY < 0 ? 0.2 : -0.2));
  }, { passive: false });
}

// Desktop: click-and-drag to pan around while zoomed in
let isMouseDragging = false;
let mouseDragStartX = 0;
let mouseDragStartY = 0;
let mousePanStartX = 0;
let mousePanStartY = 0;

if (letterModalImg) {
  letterModalImg.addEventListener('mousedown', (e) => {
    isMouseDragging = true;
    mouseDragStartX = e.clientX;
    mouseDragStartY = e.clientY;
    mousePanStartX = letterPanX;
    mousePanStartY = letterPanY;
    letterModalImg.style.cursor = 'grabbing';
  });
}

window.addEventListener('mousemove', (e) => {
  if (!isMouseDragging) return;
  letterPanX = mousePanStartX + (e.clientX - mouseDragStartX);
  letterPanY = mousePanStartY + (e.clientY - mouseDragStartY);
  updateLetterTransform();
});

window.addEventListener('mouseup', () => {
  isMouseDragging = false;
  if (letterModalImg) letterModalImg.style.cursor = '';
});

// Mobile: one finger drags/pans, two fingers pinch-zoom
let touchMode = null; // 'pan' or 'pinch'
let touchPanStartX = 0;
let touchPanStartY = 0;
let touchPanOriginX = 0;
let touchPanOriginY = 0;
let pinchStartDist = null;
let pinchStartZoom = 1;

function getTouchDist(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

if (letterModalViewport) {
  letterModalViewport.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchMode = 'pan';
      touchPanStartX = e.touches[0].clientX;
      touchPanStartY = e.touches[0].clientY;
      touchPanOriginX = letterPanX;
      touchPanOriginY = letterPanY;
    } else if (e.touches.length === 2) {
      touchMode = 'pinch';
      pinchStartDist = getTouchDist(e.touches);
      pinchStartZoom = letterZoom;
    }
  });

  letterModalViewport.addEventListener('touchmove', (e) => {
    if (touchMode === 'pan' && e.touches.length === 1) {
      e.preventDefault();
      letterPanX = touchPanOriginX + (e.touches[0].clientX - touchPanStartX);
      letterPanY = touchPanOriginY + (e.touches[0].clientY - touchPanStartY);
      updateLetterTransform();
    } else if (touchMode === 'pinch' && e.touches.length === 2 && pinchStartDist) {
      e.preventDefault();
      const newDist = getTouchDist(e.touches);
      setLetterZoom(pinchStartZoom * (newDist / pinchStartDist));
    }
  }, { passive: false });

  letterModalViewport.addEventListener('touchend', (e) => {
    if (e.touches.length === 0) {
      touchMode = null;
      pinchStartDist = null;
    } else if (e.touches.length === 1) {
      // Went from pinching to one finger left — switch to panning from here
      touchMode = 'pan';
      pinchStartDist = null;
      touchPanStartX = e.touches[0].clientX;
      touchPanStartY = e.touches[0].clientY;
      touchPanOriginX = letterPanX;
      touchPanOriginY = letterPanY;
    }
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
