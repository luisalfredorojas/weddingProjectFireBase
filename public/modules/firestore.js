import { firebaseConfig } from '../app.config.js';

let firebaseApp;
let firestore;
let storage;

async function ensureFirebase() {
  if (firebaseApp) return { firebaseApp, firestore, storage };
  const [{ initializeApp }, { getFirestore, collection, addDoc, serverTimestamp }, { getStorage, ref, getDownloadURL }] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'),
    import('https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js'),
  ]);

  firebaseApp = initializeApp(firebaseConfig);
  firestore = getFirestore(firebaseApp);
  storage = getStorage(firebaseApp);

  return { firebaseApp, firestore, storage, collection, addDoc, serverTimestamp, ref, getDownloadURL };
}

export async function addRSVP(data) {
  const { firestore, collection, addDoc, serverTimestamp } = await ensureFirebase();
  const col = collection(firestore, 'rsvps');
  await addDoc(col, {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function getInviteesDownloadUrl(path) {
  const { storage, ref, getDownloadURL } = await ensureFirebase();
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
}

export { ensureFirebase };
