// Firestore Service — fixed to avoid composite index requirements
import {
  collection, doc, addDoc, getDocs, getDoc,
  setDoc, updateDoc, deleteDoc, query,
  orderBy, where, serverTimestamp, writeBatch, limit,
} from 'firebase/firestore';
import { db } from './firebaseConfig.js';

// ─── Conversations ───────────────────────────────────────────────

export async function getOrCreateConversationFirestore(userId, expertId) {
  try {
    // Simple query: only filter by expertId, no orderBy (avoids composite index)
    const ref = collection(db, 'users', userId, 'conversations');
    const q = query(ref, where('expertId', '==', expertId));
    const snap = await getDocs(q);

    if (!snap.empty) {
      // Pick the most recent one client-side
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => {
        const aTime = a.updatedAt?.toMillis?.() || a.updatedAt || 0;
        const bTime = b.updatedAt?.toMillis?.() || b.updatedAt || 0;
        return bTime - aTime;
      });
      return docs[0].id;
    }

    // None found — create one
    const newRef = await addDoc(ref, {
      expertId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      preview: '',
    });
    return newRef.id;
  } catch (err) {
    console.error('getOrCreateConversation error:', err);
    throw err;
  }
}

export async function updateConversationPreviewFirestore(userId, convId, preview) {
  try {
    const ref = doc(db, 'users', userId, 'conversations', convId);
    await updateDoc(ref, { preview, updatedAt: serverTimestamp() });
  } catch (err) {
    console.error('updatePreview error:', err);
  }
}

export async function getRecentConversationsFirestore(userId) {
  try {
    // Simple query: get all, sort client-side to avoid composite index
    const ref = collection(db, 'users', userId, 'conversations');
    const snap = await getDocs(ref);
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    docs.sort((a, b) => {
      const aTime = a.updatedAt?.toMillis?.() || a.updatedAt || 0;
      const bTime = b.updatedAt?.toMillis?.() || b.updatedAt || 0;
      return bTime - aTime;
    });
    return docs;
  } catch (err) {
    console.error('getRecentConversations error:', err);
    return [];
  }
}

export async function deleteConversationFirestore(userId, convId) {
  try {
    const msgsRef = collection(db, 'users', userId, 'conversations', convId, 'messages');
    const snap = await getDocs(msgsRef);
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    batch.delete(doc(db, 'users', userId, 'conversations', convId));
    await batch.commit();
  } catch (err) {
    console.error('deleteConversation error:', err);
    throw err;
  }
}

export async function clearAllHistoryFirestore(userId) {
  try {
    const convRef = collection(db, 'users', userId, 'conversations');
    const snap = await getDocs(convRef);
    const batch = writeBatch(db);
    for (const convDoc of snap.docs) {
      const msgsSnap = await getDocs(collection(convDoc.ref, 'messages'));
      msgsSnap.docs.forEach(m => batch.delete(m.ref));
      batch.delete(convDoc.ref);
    }
    await batch.commit();
  } catch (err) {
    console.error('clearAllHistory error:', err);
    throw err;
  }
}

// ─── Messages ───────────────────────────────────────────────────

export async function saveMessageFirestore(userId, convId, sender, text, interactiveElements = []) {
  try {
    const ref = collection(db, 'users', userId, 'conversations', convId, 'messages');
    await addDoc(ref, {
      sender,
      text,
      interactiveElements: JSON.stringify(interactiveElements),
      timestamp: serverTimestamp(),
    });

    if (sender === 'user') {
      await updateConversationPreviewFirestore(userId, convId, text.slice(0, 80));
    }
  } catch (err) {
    console.error('saveMessage error:', err);
    throw err;
  }
}

export async function getMessagesFirestore(userId, convId) {
  try {
    // Simple orderBy timestamp — single field, no composite index needed
    const ref = collection(db, 'users', userId, 'conversations', convId, 'messages');
    const q = query(ref, orderBy('timestamp', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      interactiveElements: d.data().interactiveElements
        ? (() => { try { return JSON.parse(d.data().interactiveElements); } catch { return []; } })()
        : [],
      timestamp: d.data().timestamp?.toMillis?.() || Date.now(),
    }));
  } catch (err) {
    console.error('getMessages error:', err);
    // If orderBy fails (first time, no index), return unsorted
    try {
      const ref = collection(db, 'users', userId, 'conversations', convId, 'messages');
      const snap = await getDocs(ref);
      return snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        interactiveElements: d.data().interactiveElements
          ? (() => { try { return JSON.parse(d.data().interactiveElements); } catch { return []; } })()
          : [],
        timestamp: d.data().timestamp?.toMillis?.() || Date.now(),
      })).sort((a, b) => a.timestamp - b.timestamp);
    } catch (err2) {
      console.error('getMessages fallback error:', err2);
      return [];
    }
  }
}
