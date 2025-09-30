import { loadMediaElement, raf, clamp } from './utils.js';

export function initCarousel({ autoplay = true } = {}) {
  const carousel = document.querySelector('[data-carousel]');
  if (!carousel) return;

  const track = carousel.querySelector('[data-carousel-track]');
  const slides = Array.from(track.children);
  if (!slides.length) return;

  let current = 0;
  let autoTimer = null;
  let isPointerDown = false;
  let startX = 0;
  let deltaX = 0;
  const autoplayDelay = 6000;

  const indicatorsContainer = carousel.querySelector('[data-carousel-indicators]');
  indicatorsContainer.innerHTML = '';
  slides.forEach((_, index) => {
    const button = document.createElement('button');
    button.className = 'carousel__indicator';
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-label', `Ir al slide ${index + 1}`);
    button.dataset.index = index;
    button.addEventListener('click', () => goTo(index));
    indicatorsContainer.appendChild(button);
  });

  const updateIndicators = () => {
    indicatorsContainer.querySelectorAll('.carousel__indicator').forEach((indicator, index) => {
      const selected = index === current;
      indicator.setAttribute('aria-selected', String(selected));
      indicator.toggleAttribute('data-current', selected);
    });
  };

  const preloadNeighbours = (index) => {
    const neighbours = [index, (index + 1) % slides.length, (index - 1 + slides.length) % slides.length];
    neighbours.forEach((idx) => loadMediaElement(slides[idx]));
  };

  const goTo = (index) => {
    current = clamp(index, 0, slides.length - 1);
    track.style.transform = `translateX(-${current * 100}%)`;
    preloadNeighbours(current);
    updateIndicators();
    resetAutoplay();
  };

  const next = () => goTo((current + 1) % slides.length);
  const prev = () => goTo((current - 1 + slides.length) % slides.length);

  carousel.querySelector('[data-carousel-next]').addEventListener('click', next);
  carousel.querySelector('[data-carousel-prev]').addEventListener('click', prev);

  const handleKeydown = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      next();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      prev();
    }
  };

  carousel.addEventListener('keydown', handleKeydown);

  const startAutoplay = () => {
    if (!autoplay) return;
    stopAutoplay();
    autoTimer = window.setInterval(next, autoplayDelay);
  };

  const stopAutoplay = () => {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  };

  const resetAutoplay = () => {
    stopAutoplay();
    startAutoplay();
  };

  const handleVisibility = () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  };

  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);
  document.addEventListener('visibilitychange', handleVisibility);

  const handlePointerDown = (event) => {
    isPointerDown = true;
    startX = event.clientX || event.touches?.[0]?.clientX || 0;
    deltaX = 0;
    stopAutoplay();
  };

  const handlePointerMove = (event) => {
    if (!isPointerDown) return;
    const x = event.clientX || event.touches?.[0]?.clientX || 0;
    deltaX = x - startX;
    raf(() => {
      track.style.transition = 'none';
      track.style.transform = `translateX(calc(-${current * 100}% + ${deltaX}px))`;
    });
  };

  const handlePointerUp = () => {
    if (!isPointerDown) return;
    track.style.transition = '';
    if (Math.abs(deltaX) > 60) {
      if (deltaX < 0) {
        next();
      } else {
        prev();
      }
    } else {
      goTo(current);
    }
    isPointerDown = false;
    deltaX = 0;
    startAutoplay();
  };

  track.addEventListener('pointerdown', handlePointerDown);
  track.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', handlePointerUp);
  track.addEventListener('touchstart', handlePointerDown, { passive: true });
  track.addEventListener('touchmove', handlePointerMove, { passive: true });
  track.addEventListener('touchend', handlePointerUp);

  preloadNeighbours(0);
  updateIndicators();
  goTo(0);
  startAutoplay();
}
