export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || '// TODO: add apiKey',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || '// TODO: add authDomain',
  projectId: process.env.FIREBASE_PROJECT_ID || '// TODO: add projectId',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '// TODO: add storageBucket',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '// TODO: add messagingSenderId',
  appId: process.env.FIREBASE_APP_ID || '// TODO: add appId',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || undefined,
};

export const sheetsIntegration = {
  mode: 'appsScript', // "appsScript" | "cloudFunction"
  appsScriptUrl: '// TODO: pega aquí la URL del Web App de Apps Script',
  cloudFunctionUrl: '// TODO: pega aquí la URL de la Function appendRSVP',
};

export const inviteesStoragePath = 'data/invitees.json';

export const caching = {
  storageCacheMinutes: 15,
};
