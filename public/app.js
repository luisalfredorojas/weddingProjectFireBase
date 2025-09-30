import { initCarousel } from './modules/carousel.js';
import { initModals } from './modules/modal.js';
import { initRSVP } from './modules/rsvp.js';
import { createToastSystem } from './modules/toast.js';
import { initI18n } from './modules/i18n.js';
import { prefersReducedMotion } from './modules/utils.js';

const toast = createToastSystem();

document.addEventListener('DOMContentLoaded', async () => {
  const motionReduced = prefersReducedMotion();
  initCarousel({ autoplay: !motionReduced });
  initModals();
  const { setLanguage } = initI18n();
  await initRSVP({ toast, motionReduced });

  const langToggle = document.querySelector('[data-lang-toggle]');
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const nextLang = langToggle.textContent.trim() === 'ES' ? 'EN' : 'ES';
      setLanguage(nextLang.toLowerCase());
      langToggle.textContent = nextLang;
      langToggle.setAttribute('aria-label', nextLang === 'ES' ? 'Cambiar idioma' : 'Switch language');
    });
  }
});

window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    document.dispatchEvent(new Event('app:retryQueue'));
  }
});
