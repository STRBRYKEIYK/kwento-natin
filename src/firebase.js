import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const app = initializeApp({
  apiKey: 'AIzaSyDt5xOekBmIC-GnNDqlpDcRRX2KQPZchTA',
  authDomain: 'chica-keicodes-dev.firebaseapp.com',
  projectId: 'chica-keicodes-dev',
  storageBucket: 'chica-keicodes-dev.firebasestorage.app',
  messagingSenderId: '359088819077',
  appId: '1:359088819077:web:e88d4d052b25289735d2ec',
});

export const db = getFirestore(app);
export const storage = getStorage(app);
