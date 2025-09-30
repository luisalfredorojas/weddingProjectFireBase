export const prefersReducedMotion = () =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const raf = (cb) => window.requestAnimationFrame(cb);

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const loadMediaElement = (slide) => {
  const type = slide.dataset.type;
  const src = slide.dataset.src;
  const alt = slide.dataset.alt || '';

  if (!type || slide.dataset.loaded === 'true') {
    return;
  }

  let element;
  if (type === 'image') {
    element = document.createElement('img');
    element.src = src;
    element.alt = alt;
    element.loading = 'lazy';
    element.decoding = 'async';
  } else if (type === 'video') {
    element = document.createElement('video');
    element.src = src;
    element.controls = true;
    element.preload = 'metadata';
    element.playsInline = true;
    element.setAttribute('aria-label', alt);
    const caption = slide.dataset.caption;
    if (caption) {
      element.setAttribute('data-caption', caption);
    }
  } else if (type === 'youtube') {
    element = document.createElement('iframe');
    element.src = `${src}?rel=0&modestbranding=1`;
    element.title = alt || 'Video';
    element.loading = 'lazy';
    element.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    element.allowFullscreen = true;
  }

  if (element) {
    element.classList.add('carousel__media');
    const placeholder = slide.querySelector('.carousel__lazy-placeholder');
    if (placeholder) {
      placeholder.replaceWith(element);
    } else {
      slide.appendChild(element);
    }
    slide.dataset.loaded = 'true';
  }
};

export const trapFocus = (container, onClose) => {
  const focusableSelectors =
    'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"])';
  const focusable = Array.from(container.querySelectorAll(focusableSelectors)).filter(
    (el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden')
  );

  if (!focusable.length) {
    return () => {};
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  const handleKeydown = (event) => {
    if (event.key === 'Tab') {
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };

  container.addEventListener('keydown', handleKeydown);
  first.focus();

  return () => {
    container.removeEventListener('keydown', handleKeydown);
  };
};

export const formatPlusOne = (plusOne, lang) => {
  if (lang === 'en') {
    return plusOne ? 'Plus one allowed: Yes' : 'Plus one allowed: No';
  }
  return plusOne ? 'Con acompañante: Sí' : 'Con acompañante: No';
};

export const safeJsonParse = (text) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('JSON parse error', error);
    return null;
  }
};

export const cacheResponse = async (key, response, minutes) => {
  const data = {
    timestamp: Date.now(),
    ttl: minutes * 60 * 1000,
    body: await response.clone().text(),
    headers: {
      etag: response.headers.get('ETag') || null,
    },
  };
  localStorage.setItem(key, JSON.stringify(data));
};

export const getCachedResponse = (key) => {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  const data = safeJsonParse(raw);
  if (!data) return null;
  if (Date.now() - data.timestamp > data.ttl) {
    localStorage.removeItem(key);
    return null;
  }
  return data;
};

export const createQueue = (storageKey) => {
  const loadQueue = () => {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = safeJsonParse(raw);
    return Array.isArray(parsed) ? parsed : [];
  };

  const saveQueue = (items) => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  };

  const enqueue = (item) => {
    const queue = loadQueue();
    queue.push(item);
    saveQueue(queue);
  };

  const dequeue = () => {
    const queue = loadQueue();
    const item = queue.shift();
    saveQueue(queue);
    return item;
  };

  const peek = () => {
    const queue = loadQueue();
    return queue[0];
  };

  const isEmpty = () => loadQueue().length === 0;

  return { enqueue, dequeue, peek, isEmpty, loadQueue, saveQueue };
};
