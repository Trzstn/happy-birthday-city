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

let letterZoom = 1;
const LETTER_ZOOM_MIN = 1;
const LETTER_ZOOM_MAX = 3;

function setLetterZoom(zoom) {
  letterZoom = Math.min(LETTER_ZOOM_MAX, Math.max(LETTER_ZOOM_MIN, zoom));
  if (letterModalImg) letterModalImg.style.transform = `scale(${letterZoom})`;
}

function openLetterModal() {
  if (!letterModal) return;
  letterModal.classList.add('open');
  setLetterZoom(1);
  document.body.style.overflow = 'hidden'; // lock background scroll while modal is open
}

function closeLetterModal() {
  if (!letterModal) return;
  letterModal.classList.remove('open');
  setLetterZoom(1);
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

// Mobile: two-finger pinch to zoom
let pinchStartDist = null;
let pinchStartZoom = 1;

function getTouchDist(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

if (letterModalViewport) {
  letterModalViewport.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      pinchStartDist = getTouchDist(e.touches);
      pinchStartZoom = letterZoom;
    }
  });

  letterModalViewport.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && pinchStartDist) {
      e.preventDefault();
      const newDist = getTouchDist(e.touches);
      setLetterZoom(pinchStartZoom * (newDist / pinchStartDist));
    }
  }, { passive: false });

  letterModalViewport.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) pinchStartDist = null;
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
