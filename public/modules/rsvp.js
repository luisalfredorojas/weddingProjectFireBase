import { loadInvitees } from './storageLoader.js';
import { addRSVP } from './firestore.js';
import { sheetsIntegration } from '../app.config.js';
import { createQueue, formatPlusOne } from './utils.js';
import { getStrings } from './i18n.js';

const QUEUE_KEY = 'wedding:rsvpQueue';

const queue = createQueue(QUEUE_KEY);

const sendToSheets = async (payload) => {
  if (sheetsIntegration.mode === 'cloudFunction') {
    if (!sheetsIntegration.cloudFunctionUrl || sheetsIntegration.cloudFunctionUrl.startsWith('// TODO')) {
      throw new Error('Configura la URL de la Cloud Function.');
    }
    const res = await fetch(sheetsIntegration.cloudFunctionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error('Error al enviar a Google Sheets (Cloud Function).');
    }
    return res.json();
  }

  if (!sheetsIntegration.appsScriptUrl || sheetsIntegration.appsScriptUrl.startsWith('// TODO')) {
    throw new Error('Configura la URL del Web App de Apps Script.');
  }
  const res = await fetch(sheetsIntegration.appsScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    mode: 'cors',
  });
  if (!res.ok) {
    throw new Error('Error al enviar a Google Sheets (Apps Script).');
  }
  return res.json();
};

const processQueue = async ({ toast }) => {
  if (queue.isEmpty()) return;
  const lang = document.documentElement.lang || 'es';
  try {
    while (!queue.isEmpty()) {
      const item = queue.peek();
      await sendToSheets(item);
      queue.dequeue();
    }
    toast?.show(lang === 'en' ? 'Offline RSVPs synced.' : 'Confirmaciones pendientes sincronizadas.');
  } catch (error) {
    console.error(error);
    toast?.show(lang === 'en' ? 'Some RSVPs still pending, retry later.' : 'Quedan confirmaciones pendientes, intenta más tarde.');
  }
};

const populateInvitees = ({ select, plusOneEl, invitees, lang }) => {
  select.innerHTML = '';
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = getStrings(lang)['rsvp.inviteePlaceholder'];
  select.appendChild(defaultOption);

  const sorted = [...invitees].sort((a, b) => a.name.localeCompare(b.name, lang === 'en' ? 'en' : 'es'));
  sorted.forEach((invitee) => {
    const option = document.createElement('option');
    option.value = invitee.name;
    option.textContent = invitee.name;
    option.dataset.plusOne = invitee.plusOne ? 'true' : 'false';
    select.appendChild(option);
  });

  plusOneEl.textContent = formatPlusOne(false, lang);
};

export async function initRSVP({ toast }) {
  const form = document.querySelector('[data-rsvp-form]');
  if (!form) return;

  const select = form.querySelector('[data-rsvp-invitee]');
  const plusOneEl = form.querySelector('[data-rsvp-plusone]');
  const allergies = form.querySelector('[data-rsvp-allergies]');
  const counter = form.querySelector('#allergies-counter');
  const alertEl = form.querySelector('[data-rsvp-alert]');
  const submitButton = form.querySelector('button[type="submit"]');

  let invitees = await loadInvitees();
  let currentPlusOne = false;

  const updatePlusOne = (lang) => {
    plusOneEl.textContent = formatPlusOne(currentPlusOne, lang);
  };

  const lang = document.documentElement.lang || 'es';
  populateInvitees({ select, plusOneEl, invitees, lang });

  document.addEventListener('i18n:change', ({ detail }) => {
    populateInvitees({ select, plusOneEl, invitees, lang: detail.lang });
    updatePlusOne(detail.lang);
  });

  select.addEventListener('change', () => {
    const option = select.selectedOptions[0];
    currentPlusOne = option?.dataset.plusOne === 'true';
    updatePlusOne(document.documentElement.lang || 'es');
  });

  allergies.addEventListener('input', () => {
    const value = allergies.value.slice(0, 200);
    allergies.value = value;
    const len = value.length;
    counter.dataset.count = len;
    counter.textContent = `${len} / 200`;
    counter.setAttribute('aria-live', 'polite');
    if (len >= 190) {
      counter.setAttribute('data-warning', 'true');
    } else {
      counter.removeAttribute('data-warning');
    }
  });

  const setStatus = (message, type = 'info') => {
    alertEl.textContent = message;
    alertEl.dataset.type = type;
  };

  const resetForm = () => {
    form.reset();
    currentPlusOne = false;
    updatePlusOne(document.documentElement.lang || 'es');
    counter.dataset.count = 0;
    counter.textContent = `0 / 200`;
  };

  const validate = () => {
    const errors = [];
    if (!select.value) {
      errors.push('Elige tu nombre.');
    }
    if (!form.querySelector('input[name="attending"]:checked')) {
      errors.push('Selecciona si asistirás.');
    }
    if (allergies.value.length > 200) {
      errors.push('El texto de alergias es demasiado largo.');
    }
    return errors;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setStatus('');
    const lang = document.documentElement.lang || 'es';
    const strings = getStrings(lang);

    const errors = validate();
    if (errors.length) {
      setStatus(lang === 'en' ? 'Please review the highlighted fields.' : 'Revisa los campos marcados.', 'error');
      return;
    }

    const attending = form.querySelector('input[name="attending"]:checked').value === 'yes';
    const payload = {
      invitee: select.value,
      plusOne: currentPlusOne,
      allergies: allergies.value,
      attending,
      timestamp: new Date().toISOString(),
    };

    try {
      submitButton.disabled = true;
      await addRSVP(payload);
      try {
        await sendToSheets(payload);
      } catch (sheetError) {
        console.warn('Sheets error, queuing', sheetError);
        queue.enqueue(payload);
        document.dispatchEvent(new Event('app:retryQueue'));
      }
      setStatus(lang === 'en' ? 'RSVP received! Thank you.' : '¡Confirmación recibida! Gracias.', 'success');
      toast.show(lang === 'en' ? 'We can’t wait to celebrate with you.' : '¡Nos emociona celebrar contigo!');
      resetForm();
    } catch (error) {
      console.error(error);
      setStatus(lang === 'en' ? 'There was an issue, please try again.' : 'Tuvimos un inconveniente, intenta de nuevo.', 'error');
      queue.enqueue(payload);
    } finally {
      submitButton.disabled = false;
    }
  });

  document.addEventListener('app:retryQueue', () => {
    processQueue({ toast });
  });

  if (invitees.length === 0) {
    setStatus('No encontramos tu lista de invitados, intenta más tarde.', 'error');
  }
}
