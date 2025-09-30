export function createToastSystem() {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }

  const show = (message, { duration = 5000 } = {}) => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.dataset.visible = 'true';
    });

    window.setTimeout(() => hide(toast), duration);
  };

  const hide = (toast) => {
    toast.dataset.visible = 'false';
    toast.addEventListener(
      'transitionend',
      () => {
        toast.remove();
      },
      { once: true }
    );
  };

  return { show };
}
