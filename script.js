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
