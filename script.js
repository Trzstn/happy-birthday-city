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
  (_, i) => `assets/PLACEHOLDER-REASON-${i + 1}.jpg`
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

