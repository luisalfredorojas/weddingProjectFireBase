const STRINGS = {
  es: {
    brand: 'Valeria & Mateo',
    'nav.hero': 'Inicio',
    'nav.details': 'Detalles',
    'nav.rsvp': 'Confirmación',
    'nav.thanks': 'Gracias',
    'cta.title': 'Detalles importantes',
    'cta.subtitle': 'Encuentra la información clave para acompañarnos.',
    'cta.itinerary': 'Itinerario',
    'cta.location': 'Ubicación',
    'cta.dress': 'Código de vestimenta',
    'cta.registry': 'Mesa de regalos',
    'rsvp.title': 'Confirmación de asistencia',
    'rsvp.subtitle': 'Por favor completa el siguiente formulario a más tardar el 20 de noviembre.',
    'rsvp.inviteeLabel': 'Nombre en la invitación',
    'rsvp.inviteePlaceholder': 'Selecciona tu nombre',
    'rsvp.plusOne': 'Con acompañante: —',
    'rsvp.allergiesLabel': '¿Alguna alergia o restricción alimentaria?',
    'rsvp.counter': '0 / 200',
    'rsvp.attendingLabel': '¿Podrás asistir?',
    'rsvp.attendingYes': 'Sí',
    'rsvp.attendingNo': 'No',
    'rsvp.submit': 'Enviar confirmación',
    'rsvp.notice': 'Tus datos se utilizan únicamente para coordinar la logística del evento. Si necesitas ayuda, contáctanos.',
    'thanks.title': '¡Gracias por compartir este día!',
    'thanks.message': 'Valeria & Mateo — 20 de diciembre de 2025. Tu presencia hace nuestro día aún más especial.',
    'footer.note': 'Hecho con mucho amor. © 2025.',
    'modal.itinerary.title': 'Itinerario del día',
    'modal.itinerary.desc': 'Agenda tentativa.',
    'modal.itinerary.item1.time': '16:00',
    'modal.itinerary.item1.text': 'Ceremonia civil',
    'modal.itinerary.item2.time': '17:30',
    'modal.itinerary.item2.text': 'Recepción y coctel',
    'modal.itinerary.item3.time': '19:00',
    'modal.itinerary.item3.text': 'Cena y brindis',
    'modal.itinerary.item4.time': '21:00',
    'modal.itinerary.item4.text': 'Baile y fiesta',
    'modal.location.title': 'Ubicación',
    'modal.location.desc': 'Dirección y mapa del lugar.',
    'modal.location.address': '// TODO: Reemplaza con la dirección completa.',
    'modal.dress.title': 'Código de vestimenta',
    'modal.dress.desc': 'Sugerencias para el atuendo.',
    'modal.dress.item1': 'Formal elegante: trajes oscuros, vestidos largos o midi.',
    'modal.dress.item2': 'Zapatos cómodos para bailar.',
    'modal.dress.item3': 'Los colores claros son bienvenidos, evita blanco total.',
    'modal.registry.title': 'Mesa de regalos',
    'modal.registry.desc': 'Opciones para celebrar con nosotros.',
    'modal.registry.item1': 'Lista Amazon',
    'modal.registry.item2': 'Detalles hechos a mano',
    'modal.registry.item3': 'Transferencia bancaria',
  },
  en: {
    brand: 'Valeria & Mateo',
    'nav.hero': 'Home',
    'nav.details': 'Details',
    'nav.rsvp': 'RSVP',
    'nav.thanks': 'Gratitude',
    'cta.title': 'Key Details',
    'cta.subtitle': 'Find everything you need to celebrate with us.',
    'cta.itinerary': 'Itinerary',
    'cta.location': 'Location',
    'cta.dress': 'Dress code',
    'cta.registry': 'Registry & Gifts',
    'rsvp.title': 'RSVP',
    'rsvp.subtitle': 'Please respond by November 20.',
    'rsvp.inviteeLabel': 'Name on invitation',
    'rsvp.inviteePlaceholder': 'Choose your name',
    'rsvp.plusOne': 'Plus one allowed: —',
    'rsvp.allergiesLabel': 'Any allergies or dietary notes?',
    'rsvp.counter': '0 / 200',
    'rsvp.attendingLabel': 'Will you attend?',
    'rsvp.attendingYes': 'Yes',
    'rsvp.attendingNo': 'No',
    'rsvp.submit': 'Send RSVP',
    'rsvp.notice': 'We use this information only to coordinate the celebration. Reach out if you need help.',
    'thanks.title': 'Thank you for sharing this day!',
    'thanks.message': 'Valeria & Mateo — December 20, 2025. Your presence makes it unforgettable.',
    'footer.note': 'Made with love. © 2025.',
    'modal.itinerary.title': 'Day itinerary',
    'modal.itinerary.desc': 'Tentative schedule.',
    'modal.itinerary.item1.time': '4:00 PM',
    'modal.itinerary.item1.text': 'Civil ceremony',
    'modal.itinerary.item2.time': '5:30 PM',
    'modal.itinerary.item2.text': 'Reception & cocktail',
    'modal.itinerary.item3.time': '7:00 PM',
    'modal.itinerary.item3.text': 'Dinner & toast',
    'modal.itinerary.item4.time': '9:00 PM',
    'modal.itinerary.item4.text': 'Dancing party',
    'modal.location.title': 'Location',
    'modal.location.desc': 'Venue address and map.',
    'modal.location.address': '// TODO: Replace with full address.',
    'modal.dress.title': 'Dress code',
    'modal.dress.desc': 'Attire suggestions.',
    'modal.dress.item1': 'Elegant formal: suits, long or midi dresses.',
    'modal.dress.item2': 'Comfortable shoes for dancing.',
    'modal.dress.item3': 'Light colors welcome, please avoid full white.',
    'modal.registry.title': 'Registry',
    'modal.registry.desc': 'Ways to celebrate with us.',
    'modal.registry.item1': 'Amazon list',
    'modal.registry.item2': 'Handmade gifts',
    'modal.registry.item3': 'Bank transfer',
  },
};

export function initI18n(defaultLang = 'es') {
  let currentLang = localStorage.getItem('wedding:lang') || defaultLang;

  const applyStrings = () => {
    document.documentElement.lang = currentLang;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const value = STRINGS[currentLang]?.[key];
      if (!value) return;
      if (el.dataset.count !== undefined && key === 'rsvp.counter') {
        const currentCount = el.dataset.count || '0';
        el.textContent = `${currentCount} / 200`;
      } else {
        el.textContent = value;
      }
    });
  };

  const setLanguage = (lang) => {
    if (!STRINGS[lang]) return;
    currentLang = lang;
    localStorage.setItem('wedding:lang', currentLang);
    applyStrings();
    document.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang: currentLang } }));
  };

  applyStrings();

  return { setLanguage, get currentLang() { return currentLang; } };
}

export function getStrings(lang = 'es') {
  return STRINGS[lang];
}
