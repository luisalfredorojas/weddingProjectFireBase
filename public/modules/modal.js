import { trapFocus } from './utils.js';

export function initModals() {
  const template = document.querySelector('[data-modal-template]');
  if (!template) return;

  const triggers = document.querySelectorAll('[data-modal-trigger]');
  if (!triggers.length) return;

  const body = document.body;
  const activeModals = new Map();

  const openModal = (id, trigger) => {
    const existing = activeModals.get(id);
    if (existing) {
      existing.dialog.focus();
      return;
    }

    const modal = template.cloneNode(true);
    modal.hidden = false;
    modal.dataset.modalId = id;
    const overlay = modal.querySelector('[data-modal-overlay]');
    const dialog = modal.querySelector('.modal__dialog');
    const closeBtn = modal.querySelector('[data-modal-close]');
    const content = modal.querySelector('[data-modal-content]');
    const tpl = document.getElementById(`modal-${id}`);
    if (!tpl) return;

    const fragment = tpl.content.cloneNode(true);
    content.appendChild(fragment);
    body.appendChild(modal);
    body.style.setProperty('overflow', 'hidden');
    const releaseTrap = trapFocus(dialog, () => closeModal(id));

    const cleanup = () => {
      releaseTrap();
      modal.remove();
      if (!body.querySelector('.modal:not([hidden])')) {
        body.style.removeProperty('overflow');
      }
    };

    const closeModal = () => {
      cleanup();
      activeModals.delete(id);
      if (trigger) {
        trigger.focus();
      }
    };

    overlay.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('close-modal', closeModal);

    activeModals.set(id, { modal, trigger, dialog });
  };

  const closeModal = (id) => {
    const instance = activeModals.get(id);
    if (!instance) return;
    instance.modal.dispatchEvent(new Event('close-modal'));
  };

  triggers.forEach((trigger) => {
    const id = trigger.dataset.modalTrigger;
    trigger.addEventListener('click', () => openModal(id, trigger));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const lastModal = Array.from(activeModals.keys()).pop();
      if (lastModal) {
        closeModal(lastModal);
      }
    }
  });
}
