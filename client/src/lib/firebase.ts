import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

async function testConnection() {
  try {
    // Try to reach the server, but don't let it crash the app if it fails at the very first moment
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection verified.");
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      console.warn("Firestore permissions check pending auth stabilization.");
      return;
    }
    if(error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('unavailable'))) {
      console.warn("Firestore is currently operating in offline mode. This is often temporary during startup.");
    } else {
      console.error("Firestore connection error:", error);
    }
  }
}
// Delay the test slightly to allow network initialization
setTimeout(testConnection, 3000);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const isPermissionDenied = error instanceof Error && error.message.includes('permission-denied');
  const isLoggedOut = !auth.currentUser;

  // Silence standard permission race conditions during logout/auth transition
  if (isPermissionDenied && isLoggedOut) {
    console.debug('🔥 Firestore: Suppressed permission error during auth transition', { operationType, path });
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.group('🔥 Firestore Security Error');
  console.error('Operation:', operationType);
  console.error('Path:', path);
  console.error('User:', auth.currentUser?.email || 'Anonymous/Not logged in');
  console.error('Full Info:', errInfo);
  console.groupEnd();
  throw new Error(JSON.stringify(errInfo));
}
