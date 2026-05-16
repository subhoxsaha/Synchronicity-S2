/**
 * Firestore Collection Schema & Hook Helpers
 * 
 * This module defines the Firestore collection structure and provides
 * typed CRUD hooks ready for direct database integration.
 * 
 * Collections:
 *   users/          — User profiles (student, organizer, admin)
 *   events/         — CampusEvent documents (all post types via discriminator)
 *   registrations/  — RSVP / ticket records
 *   notifications/  — Per-user push/in-app notifications
 *   comments/       — Event comments (subcollection-style, keyed by eventId)
 *   posts/          — Polymorphic post feed (announcement, recruitment, gallery, resource)
 */

import { 
  collection, doc, query, where, orderBy, limit,
  onSnapshot, addDoc, updateDoc, deleteDoc, setDoc,
  serverTimestamp, getDoc, getDocs,
  DocumentReference, QueryConstraint
} from 'firebase/firestore';
import { db } from './firebase';
import { useState, useEffect } from 'react';

// ── Collection References ──
export const COLLECTIONS = {
  USERS: 'users',
  EVENTS: 'events',
  REGISTRATIONS: 'registrations',
  NOTIFICATIONS: 'notifications',
  COMMENTS: 'comments',
  POSTS: 'posts',           // polymorphic feed posts
  BOOKMARKS: 'bookmarks',   // user bookmark records
  FOLLOWS: 'follows',       // user-to-user / user-to-org follows
} as const;

// ── Generic Realtime Listener Hook ──
export function useCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  enabled: boolean = true
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, collectionName), ...constraints);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(docs);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`Firestore [${collectionName}]:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, enabled]);

  return { data, loading, error };
}

// ── Single Document Hook ──
export function useDocument<T>(
  collectionName: string,
  documentId: string | null
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!documentId) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, collectionName, documentId);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setData({ id: snapshot.id, ...snapshot.data() } as T);
      } else {
        setData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [collectionName, documentId]);

  return { data, loading };
}

// ── CRUD Helpers ──

/** Create a new document with auto-generated ID */
export async function createDocument<T extends Record<string, any>>(
  collectionName: string,
  data: T
): Promise<string> {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/** Create or overwrite a document with a specific ID */
export async function setDocument<T extends Record<string, any>>(
  collectionName: string,
  documentId: string,
  data: T,
  merge: boolean = true
): Promise<void> {
  const docRef = doc(db, collectionName, documentId);
  await setDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge });
}

/** Update specific fields on an existing document */
export async function updateDocument(
  collectionName: string,
  documentId: string,
  data: Record<string, any>
): Promise<void> {
  const docRef = doc(db, collectionName, documentId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/** Delete a document */
export async function removeDocument(
  collectionName: string,
  documentId: string
): Promise<void> {
  const docRef = doc(db, collectionName, documentId);
  await deleteDoc(docRef);
}

// ── Typed Feed Query Helpers ──

/** Get posts by type (announcement, recruitment, etc.) */
export function usePostsByType(postType: string) {
  return useCollection(COLLECTIONS.POSTS, [
    where('type', '==', postType),
    orderBy('createdAt', 'desc'),
    limit(20),
  ]);
}

/** Get events near a coordinate (basic bounding box) */
export function useEventsNear(lat: number, lng: number, radiusDeg: number = 0.05) {
  return useCollection(COLLECTIONS.EVENTS, [
    where('coordinates.lat', '>=', lat - radiusDeg),
    where('coordinates.lat', '<=', lat + radiusDeg),
    orderBy('coordinates.lat'),
    limit(50),
  ]);
}

/** Get user's bookmarked event IDs */
export function useUserBookmarks(userId: string | null) {
  return useCollection(COLLECTIONS.BOOKMARKS, [
    where('userId', '==', userId || '__none__'),
    orderBy('createdAt', 'desc'),
  ], !!userId);
}

/** Get registrations for a specific event */
export function useEventRegistrations(eventId: string) {
  return useCollection(COLLECTIONS.REGISTRATIONS, [
    where('eventId', '==', eventId),
    orderBy('timestamp', 'desc'),
  ]);
}
