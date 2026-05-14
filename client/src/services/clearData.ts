/**
 * Firestore Cleanup Script
 * Run from browser console while logged in as admin:
 *   import('/src/services/clearData.ts').then(m => m.clearAllEvents())
 * 
 * Or call window.__clearEvents() after this module loads.
 */
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export async function clearAllEvents() {
  const snapshot = await getDocs(collection(db, 'events'));
  const deletes = snapshot.docs.map(d => deleteDoc(doc(db, 'events', d.id)));
  await Promise.all(deletes);
  console.log(`✓ Deleted ${snapshot.size} events`);
  return snapshot.size;
}

export async function clearAllRegistrations() {
  const snapshot = await getDocs(collection(db, 'registrations'));
  const deletes = snapshot.docs.map(d => deleteDoc(doc(db, 'registrations', d.id)));
  await Promise.all(deletes);
  console.log(`✓ Deleted ${snapshot.size} registrations`);
  return snapshot.size;
}

export async function clearAllComments() {
  const snapshot = await getDocs(collection(db, 'comments'));
  const deletes = snapshot.docs.map(d => deleteDoc(doc(db, 'comments', d.id)));
  await Promise.all(deletes);
  console.log(`✓ Deleted ${snapshot.size} comments`);
  return snapshot.size;
}

export async function clearAll() {
  const e = await clearAllEvents();
  const r = await clearAllRegistrations();
  const c = await clearAllComments();
  console.log(`✓ Total cleared: ${e} events, ${r} registrations, ${c} comments`);
}

// Expose on window for quick console access
if (typeof window !== 'undefined') {
  (window as any).__clearEvents = clearAllEvents;
  (window as any).__clearAll = clearAll;
}
