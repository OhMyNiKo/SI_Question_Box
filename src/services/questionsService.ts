import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { QuestionItem, CommentItem } from '../types';

export function formatDateTime(date: Date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const INITIAL_QUESTIONS: QuestionItem[] = [
  {
    id: 'q-101',
    content:
      'Can we have dedicated quiet hours and low-sensory zones in the main library during midterms week for neurodivergent students?',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    createdAtFormatted: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 48)),
    reply:
      'Thank you for this essential feedback! We coordinated with the Library Council, and Room 302 and the 4th-floor annex will be designated as sensory-friendly quiet spaces with dimmable warm lighting and noise-canceling headphones starting this Monday.',
    repliedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    repliedAtFormatted: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 36)),
    repliedBy: 'Student Inclusion Team',
    status: 'approved',
    likes: 34,
    comments: [
      {
        id: 'c-101-1',
        authorName: 'Maya L.',
        content: 'Thank you so much! Dimmed warm lighting in 302 will help with sensory overload immensely.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 32).toISOString(),
        createdAtFormatted: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 32)),
        likes: 12,
      },
      {
        id: 'c-101-2',
        authorName: 'Alex (Senior)',
        content: 'Will headphones be sanitized between uses? So grateful for this prompt response!',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
        createdAtFormatted: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 20)),
        likes: 7,
      },
      {
        id: 'c-101-3',
        authorName: 'Jordan K.',
        content: 'Studied in Room 302 yesterday, the atmosphere was genuinely calm and focused.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        createdAtFormatted: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 6)),
        likes: 19,
      },
    ],
  },
  {
    id: 'q-102',
    content:
      'Are there any financial grants or subsidies available for low-income students who cannot afford the lab kit fees for engineering classes?',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    createdAtFormatted: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 30)),
    reply:
      'Yes! The Student Inclusion Equity Emergency Fund covers 100% of required lab gear and course materials. You can apply without invasive documentation through the confidential emergency aid portal on the student affairs page.',
    repliedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    repliedAtFormatted: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 20)),
    repliedBy: 'Student Inclusion Team',
    status: 'approved',
    likes: 52,
    comments: [
      {
        id: 'c-102-1',
        authorName: 'Engineering Junior',
        content: 'The lab kit was $240 this semester. This emergency grant literally saved my term.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
        createdAtFormatted: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 18)),
        likes: 21,
      },
      {
        id: 'c-102-2',
        authorName: 'First-Gen Mentee',
        content: 'Applied yesterday and received confirmation in under 4 hours without intrusive bank statements. Truly accessible.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
        createdAtFormatted: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 10)),
        likes: 15,
      },
    ],
  },
  {
    id: 'q-103',
    content:
      'Could the cafeteria offer more clearly labeled halal and kosher hot meal options every day instead of just once a week?',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    createdAtFormatted: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 22)),
    reply:
      'Great suggestion. Dining Services has committed to standardizing daily certified halal and kosher hot options at the Global Flavors counter beginning next semester, complete with ingredient allergen cards.',
    repliedAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    repliedAtFormatted: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 14)),
    repliedBy: 'Student Inclusion Team',
    status: 'approved',
    likes: 27,
    comments: [
      {
        id: 'c-103-1',
        authorName: 'Tariq M.',
        content: 'Super grateful to see halal options every single day now! Please keep the spicy chicken bowls on rotation.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 11).toISOString(),
        createdAtFormatted: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 11)),
        likes: 10,
      },
    ],
  },
  {
    id: 'q-104',
    content:
      'Is there an anonymous way to report subtle microaggressions in seminar classrooms without fear of faculty retaliation?',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    createdAtFormatted: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 12)),
    reply:
      'Absolutely. The campus Ombudsperson operates a strictly confidential, independent reporting channel where reports are aggregated anonymously to guide mandatory faculty cultural competence workshops.',
    repliedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    repliedAtFormatted: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 6)),
    repliedBy: 'Student Inclusion Team',
    status: 'approved',
    likes: 41,
    comments: [
      {
        id: 'c-104-1',
        authorName: 'Grad Researcher',
        content: 'Having an independent Ombudsperson outside department leadership makes this safe to use.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        createdAtFormatted: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 4)),
        likes: 14,
      },
    ],
  },
  {
    id: 'q-105',
    content:
      'How can international students get involved in organizing cultural heritage months and multicultural performance nights?',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    createdAtFormatted: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 8)),
    reply:
      'We warmly welcome all international students! The Student Inclusion Committee hosts open steering committee meetings every Thursday at 4 PM in the Multicultural Lounge. Drop in or email us directly!',
    repliedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    repliedAtFormatted: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 3)),
    repliedBy: 'Student Inclusion Team',
    status: 'approved',
    likes: 18,
    comments: [
      {
        id: 'c-105-1',
        authorName: 'ISU Steering',
        content: 'Looking forward to meeting new faces this Thursday at 4 PM in the lounge!',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        createdAtFormatted: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 2)),
        likes: 8,
      },
    ],
  },
  {
    id: 'q-106',
    content:
      'Could we get automatic door openers installed on the older North Wing restrooms? Wheelchair navigation is really difficult there right now.',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    createdAtFormatted: formatDateTime(new Date(Date.now() - 1000 * 60 * 45)),
    status: 'pending',
    likes: 15,
    comments: [],
  },
];

const LOCAL_STORAGE_KEY = 'si_cached_questions_v2';

function getLocalQuestions(): QuestionItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_QUESTIONS));
      return INITIAL_QUESTIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_QUESTIONS;
  } catch {
    return INITIAL_QUESTIONS;
  }
}

function saveLocalQuestions(items: QuestionItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('LocalStorage save error:', err);
  }
}

function withTimeout<T>(promise: Promise<T>, ms = 3000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
    ),
  ]);
}

export async function getAllQuestions(): Promise<QuestionItem[]> {
  // 1. Fetch from central authoritative server first
  try {
    const res = await withTimeout(fetch('/api/questions?scope=all'), 3000);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const clean = data.filter((q) => q && !q.id?.startsWith('_'));
        saveLocalQuestions(clean);
        return clean;
      }
    }
  } catch (err) {
    console.warn('Server getAllQuestions note (falling back to Firestore/local):', err);
  }

  // 2. Fetch from Firestore if available
  const firestore = db;
  if (firestore) {
    try {
      const snap = await withTimeout(getDocs(collection(firestore, 'questions')), 3000);
      if (!snap.empty) {
        const list: QuestionItem[] = [];
        snap.forEach((d) => {
          if (!d.id.startsWith('_')) {
            const data = d.data() as QuestionItem;
            if (data && data.content) {
              list.push(data);
            }
          }
        });
        if (list.length > 0) {
          saveLocalQuestions(list);
          return list;
        }
      }
    } catch (err) {
      console.warn('Firestore load note:', err);
    }
  }

  return getLocalQuestions();
}

export async function getPublicQuestions(): Promise<QuestionItem[]> {
  try {
    const res = await withTimeout(fetch('/api/questions'), 2500);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch {
    // fallback to local filter
  }

  const all = await getAllQuestions();
  return all
    .filter((q) => q.status === 'approved' && Boolean(q.reply))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getModeratorQuestions(): Promise<QuestionItem[]> {
  try {
    const res = await withTimeout(fetch('/api/moderator/questions'), 2500);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch {
    // fallback
  }

  const all = await getAllQuestions();
  return [...all].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function submitQuestion(content: string, authorName?: string): Promise<QuestionItem> {
  const trimmed = content.trim();
  const author = authorName && authorName.trim() ? authorName.trim() : 'Student';
  const now = new Date();

  // Optimistic local item
  const optimisticQuestion: QuestionItem = {
    id: `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    content: trimmed,
    createdAt: now.toISOString(),
    createdAtFormatted: formatDateTime(now),
    status: 'pending',
    likes: 0,
    comments: [],
    authorName: author,
  };

  const local = getLocalQuestions();
  local.unshift(optimisticQuestion);
  saveLocalQuestions(local);

  let finalQuestion = optimisticQuestion;

  // 1. Submit to central server for instant real-time synchronization to all devices
  try {
    const res = await withTimeout(
      fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed, authorName: author }),
      }),
      3500
    );
    if (res.ok) {
      finalQuestion = await res.json();
      const updatedLocal = getLocalQuestions().map((q) =>
        q.id === optimisticQuestion.id ? finalQuestion : q
      );
      saveLocalQuestions(updatedLocal);
    }
  } catch (err) {
    console.warn('Server question submit note:', err);
  }

  // 2. Also save to Firestore
  const firestore = db;
  if (firestore) {
    try {
      await withTimeout(setDoc(doc(firestore, 'questions', finalQuestion.id), finalQuestion), 2000);
    } catch (err) {
      console.warn('Firestore submission note:', err);
    }
  }

  return finalQuestion;
}

export async function replyToQuestion(
  id: string,
  reply: string,
  repliedBy = 'Student Inclusion Team'
): Promise<QuestionItem> {
  const cleanReply = reply.trim();
  const cleanRepliedBy = repliedBy.trim() || 'Student Inclusion Team';
  const now = new Date();

  // Optimistic local update
  const local = getLocalQuestions();
  const idx = local.findIndex((q) => q.id === id);
  let updatedQuestion: QuestionItem = {
    id,
    content: '',
    createdAt: now.toISOString(),
    createdAtFormatted: formatDateTime(now),
    reply: cleanReply,
    repliedAt: now.toISOString(),
    repliedAtFormatted: formatDateTime(now),
    repliedBy: cleanRepliedBy,
    status: 'approved',
  };

  if (idx >= 0) {
    updatedQuestion = {
      ...local[idx],
      reply: cleanReply,
      repliedAt: now.toISOString(),
      repliedAtFormatted: formatDateTime(now),
      repliedBy: cleanRepliedBy,
      status: 'approved',
    };
    local[idx] = updatedQuestion;
    saveLocalQuestions(local);
  }

  // 1. Submit to central server (triggers instant SSE broadcast to all devices)
  try {
    const res = await withTimeout(
      fetch('/api/moderator/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, reply: cleanReply, repliedBy: cleanRepliedBy }),
      }),
      3500
    );
    if (res.ok) {
      updatedQuestion = await res.json();
      const refreshed = getLocalQuestions().map((q) => (q.id === id ? updatedQuestion : q));
      saveLocalQuestions(refreshed);
    }
  } catch (err) {
    console.warn('Server reply note:', err);
  }

  // 2. Sync to Firestore
  const firestore = db;
  if (firestore) {
    try {
      await withTimeout(setDoc(doc(firestore, 'questions', id), updatedQuestion), 2000);
    } catch (err) {
      console.warn('Firestore reply sync note:', err);
    }
  }

  return updatedQuestion;
}

export async function deleteQuestion(id: string): Promise<boolean> {
  const local = getLocalQuestions();
  const filtered = local.filter((q) => q.id !== id);
  saveLocalQuestions(filtered);

  // 1. Delete on central server (triggers instant SSE broadcast to all devices)
  try {
    await withTimeout(
      fetch('/api/moderator/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      }),
      3500
    );
  } catch (err) {
    console.warn('Server delete question note:', err);
  }

  // 2. Delete on Firestore
  const firestore = db;
  if (firestore) {
    try {
      await withTimeout(deleteDoc(doc(firestore, 'questions', id)), 2000);
    } catch (err) {
      console.warn('Firestore delete sync note:', err);
    }
  }

  return true;
}

export const DEFAULT_MODERATOR_PASSKEY = 'StudentInclusion2026';
export const ADMIN_PASSKEY = 'NiKo0709';

export function getLocalModeratorPasskey(): string {
  try {
    return localStorage.getItem('si_moderator_passkey') || '';
  } catch {
    return '';
  }
}

export function setLocalModeratorPasskey(passkey: string): void {
  try {
    localStorage.setItem('si_moderator_passkey', passkey.trim());
  } catch (err) {
    console.warn(err);
  }
}

export async function verifyPasskey(passkey: string): Promise<boolean> {
  const trimmed = passkey.trim();
  if (!trimmed) return false;

  // 1. Try server verification
  try {
    const res = await fetch('/api/moderator/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passkey: trimmed }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        setLocalModeratorPasskey(trimmed);
        if (data.passkeyVersion) {
          localStorage.setItem('si_moderator_session_version', String(data.passkeyVersion));
        }
        return true;
      }
    } else {
      // Server explicitly rejected the passkey (HTTP 401 or other error)
      // Never fall back to accepting old or default passkeys!
      return false;
    }
  } catch (err) {
    console.warn('Server verifyPasskey network error:', err);
  }

  // 2. Only in genuine network connection failure, verify strictly against locally cached active passkey
  const localCurrent = getLocalModeratorPasskey();
  return trimmed === localCurrent;
}

export async function checkModeratorSessionValidity(): Promise<{
  isValid: boolean;
  serverPasskeyVersion?: number;
}> {
  try {
    const res = await fetch('/api/moderator/session-check');
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.passkeyVersion === 'number') {
        const storedVersion = localStorage.getItem('si_moderator_session_version');
        const isMod = localStorage.getItem('si_is_moderator') === 'true';
        if (isMod) {
          if (!storedVersion || storedVersion !== String(data.passkeyVersion)) {
            // Out of sync! Session is invalid
            localStorage.removeItem('si_is_moderator');
            localStorage.removeItem('si_moderator_session_version');
            return { isValid: false, serverPasskeyVersion: data.passkeyVersion };
          }
        }
        return { isValid: true, serverPasskeyVersion: data.passkeyVersion };
      }
    }
  } catch (err) {
    console.warn('Session check note:', err);
  }
  return { isValid: true };
}

export async function verifyAdminPasskey(adminPasskey: string): Promise<{ success: boolean; currentPasskey: string }> {
  const trimmed = adminPasskey.trim();
  if (trimmed !== ADMIN_PASSKEY) {
    return { success: false, currentPasskey: '' };
  }

  try {
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPasskey: trimmed }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.currentModeratorPasskey) {
        setLocalModeratorPasskey(data.currentModeratorPasskey);
        return { success: true, currentPasskey: data.currentModeratorPasskey };
      }
    }
  } catch (err) {
    console.warn('Server verifyAdminPasskey fallback:', err);
  }

  return { success: true, currentPasskey: getLocalModeratorPasskey() };
}

export async function fetchCurrentModeratorPasskey(adminPasskey: string): Promise<string> {
  const trimmed = adminPasskey.trim();
  if (trimmed !== ADMIN_PASSKEY) return getLocalModeratorPasskey();

  try {
    const res = await fetch('/api/admin/get-passkey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPasskey: trimmed }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.currentModeratorPasskey) {
        setLocalModeratorPasskey(data.currentModeratorPasskey);
        return data.currentModeratorPasskey;
      }
    }
  } catch (err) {
    console.warn('fetchCurrentModeratorPasskey error:', err);
  }

  return getLocalModeratorPasskey();
}

export async function updateModeratorPasskey(
  adminPasskey: string,
  newPasskey: string
): Promise<{ success: boolean; updatedPasskey: string; passkeyVersion?: number; error?: string }> {
  const trimmedAdmin = adminPasskey.trim();
  const trimmedNew = newPasskey.trim();

  if (trimmedAdmin !== ADMIN_PASSKEY) {
    return { success: false, updatedPasskey: '', error: 'Unauthorized: Invalid Admin Master Key' };
  }

  if (!trimmedNew || trimmedNew.length < 3) {
    return { success: false, updatedPasskey: '', error: 'New passkey must be at least 3 characters long.' };
  }

  try {
    const res = await fetch('/api/admin/update-passkey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPasskey: trimmedAdmin, newPasskey: trimmedNew }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setLocalModeratorPasskey(data.currentModeratorPasskey || trimmedNew);
      // Immediately invalidate any active moderator session on this device
      localStorage.removeItem('si_is_moderator');
      localStorage.removeItem('si_moderator_session_version');
      return {
        success: true,
        updatedPasskey: data.currentModeratorPasskey || trimmedNew,
        passkeyVersion: data.passkeyVersion,
      };
    } else {
      return { success: false, updatedPasskey: '', error: data.error || 'Server failed to update passkey' };
    }
  } catch (err) {
    console.warn('Server update error, updating local storage:', err);
    setLocalModeratorPasskey(trimmedNew);
    localStorage.removeItem('si_is_moderator');
    localStorage.removeItem('si_moderator_session_version');
    return { success: true, updatedPasskey: trimmedNew };
  }
}

// User-specific like tracking in localStorage
export function getUserLikedQuestions(): Set<string> {
  try {
    const raw = localStorage.getItem('si_user_liked_questions_v1');
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function saveUserLikedQuestion(questionId: string, isLiked: boolean): void {
  try {
    const set = getUserLikedQuestions();
    if (isLiked) {
      set.add(questionId);
    } else {
      set.delete(questionId);
    }
    localStorage.setItem('si_user_liked_questions_v1', JSON.stringify(Array.from(set)));
  } catch (err) {
    console.warn(err);
  }
}

export function getUserLikedComments(): Set<string> {
  try {
    const raw = localStorage.getItem('si_user_liked_comments_v1');
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function saveUserLikedComment(commentId: string, isLiked: boolean): void {
  try {
    const set = getUserLikedComments();
    if (isLiked) {
      set.add(commentId);
    } else {
      set.delete(commentId);
    }
    localStorage.setItem('si_user_liked_comments_v1', JSON.stringify(Array.from(set)));
  } catch (err) {
    console.warn(err);
  }
}

// Toggle like for a Question
export async function toggleQuestionLike(questionId: string, isLiked: boolean): Promise<number> {
  const local = getLocalQuestions();
  const target = local.find((q) => q.id === questionId);
  const currentLikes = target?.likes || 0;
  const newLikes = isLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1);

  if (target) {
    target.likes = newLikes;
    saveLocalQuestions(local);
  }
  saveUserLikedQuestion(questionId, isLiked);

  // 1. Central server update (triggers real-time SSE broadcast to all devices)
  try {
    fetch(`/api/questions/${encodeURIComponent(questionId)}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isLiked }),
    }).catch((err) => console.warn('Server question like note:', err));
  } catch (err) {
    console.warn('Like request note:', err);
  }

  // 2. Firestore update
  const firestore = db;
  if (firestore && target) {
    try {
      setDoc(doc(firestore, 'questions', questionId), target).catch(() => {});
    } catch {
      // ignore
    }
  }

  return newLikes;
}

// Add a comment to a Question
export async function addComment(
  questionId: string,
  content: string,
  authorName?: string
): Promise<CommentItem> {
  const author = authorName && authorName.trim() ? authorName.trim() : 'Student';
  const now = new Date();
  const newComment: CommentItem = {
    id: `c-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    content: content.trim(),
    authorName: author,
    createdAt: now.toISOString(),
    createdAtFormatted: formatDateTime(now),
    likes: 0,
  };

  const local = getLocalQuestions();
  const target = local.find((q) => q.id === questionId);
  if (target) {
    if (!target.comments) {
      target.comments = [];
    }
    target.comments.push(newComment);
    saveLocalQuestions(local);
  }

  // 1. Central server update (triggers instant real-time broadcast to all devices)
  try {
    const res = await withTimeout(
      fetch(`/api/questions/${encodeURIComponent(questionId)}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), authorName: author }),
      }),
      3500
    );
    if (res.ok) {
      const serverComment = await res.json();
      return serverComment;
    }
  } catch (err) {
    console.warn('Server addComment note:', err);
  }

  // 2. Firestore update
  const firestore = db;
  if (firestore && target) {
    try {
      setDoc(doc(firestore, 'questions', questionId), target).catch(() => {});
    } catch {
      // ignore
    }
  }

  return newComment;
}

// Toggle like for a Comment inside a Question
export async function toggleCommentLike(
  questionId: string,
  commentId: string,
  isLiked: boolean
): Promise<number> {
  const local = getLocalQuestions();
  const target = local.find((q) => q.id === questionId);
  const comment = target?.comments?.find((c) => c.id === commentId);
  const currentLikes = comment?.likes || 0;
  const newLikes = isLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1);

  if (comment) {
    comment.likes = newLikes;
    saveLocalQuestions(local);
  }
  saveUserLikedComment(commentId, isLiked);

  // 1. Central server update
  try {
    fetch(
      `/api/questions/${encodeURIComponent(questionId)}/comments/${encodeURIComponent(commentId)}/like`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLiked }),
      }
    ).catch((err) => console.warn('Server comment like note:', err));
  } catch (err) {
    console.warn('Comment like request note:', err);
  }

  // 2. Firestore update
  const firestore = db;
  if (firestore && target) {
    try {
      setDoc(doc(firestore, 'questions', questionId), target).catch(() => {});
    } catch {
      // ignore
    }
  }

  return newLikes;
}

/**
 * Real-time synchronization subscriber across all devices:
 * 1. Connects to Server-Sent Events (SSE) `/api/questions/stream` for sub-second updates
 * 2. Listens to Firebase Firestore `onSnapshot` when available
 * 3. Keeps a resilient 4-second polling timer fallback in case mobile browsers sleep or drop SSE
 */
export function subscribeToRealtimeQuestions(
  callback: (questions: QuestionItem[]) => void,
  onModeratorLogout?: (reason: string) => void
): () => void {
  let isClosed = false;

  // 1. Server-Sent Events (SSE)
  let eventSource: EventSource | null = null;
  const setupSSE = () => {
    if (isClosed) return;
    try {
      eventSource = new EventSource('/api/questions/stream');

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (!payload) return;

          // Check if server broadcasted a global moderator logout
          if (payload.type === 'moderator_logout_all' || payload.type === 'passkey_changed') {
            onModeratorLogout?.(
              payload.message ||
                'The moderator passkey was changed. All active moderator sessions have been logged out.'
            );
          }

          // Check passkeyVersion discrepancy against active session
          if (typeof payload.passkeyVersion === 'number') {
            const storedVersion = localStorage.getItem('si_moderator_session_version');
            const isMod = localStorage.getItem('si_is_moderator') === 'true';
            if (isMod && storedVersion && storedVersion !== String(payload.passkeyVersion)) {
              onModeratorLogout?.(
                'Your session has expired because the moderator passkey was changed.'
              );
            }
          }

          if (Array.isArray(payload.questions) && payload.questions.length > 0) {
            const cleanList: QuestionItem[] = payload.questions.filter(
              (q: any) => q && !q.id?.startsWith('_')
            );
            saveLocalQuestions(cleanList);
            callback(cleanList);
          }
        } catch {
          // ignore parsing ping or non-json messages
        }
      };

      eventSource.onerror = () => {
        // EventSource will automatically attempt reconnection
      };
    } catch (err) {
      console.warn('SSE subscription setup note:', err);
    }
  };

  setupSSE();

  // 2. Firebase Firestore onSnapshot listener
  let unsubFirestore: (() => void) | null = null;
  if (db) {
    try {
      unsubFirestore = onSnapshot(
        collection(db, 'questions'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: QuestionItem[] = [];
            snapshot.forEach((d) => {
              if (!d.id.startsWith('_')) {
                const qData = d.data() as QuestionItem;
                if (qData && qData.content) {
                  list.push(qData);
                }
              }
            });
            if (list.length > 0) {
              saveLocalQuestions(list);
              callback(list);
            }
          }
        },
        (err) => {
          // Firestore listener note - SSE and periodic polling handle sync
          console.warn('Firestore onSnapshot listener note:', err?.message || err);
        }
      );
    } catch {
      // ignore
    }
  }

  // 3. Resilient 4-second polling fallback for devices on sleep/unstable networks
  const pollInterval = setInterval(async () => {
    if (isClosed) return;
    try {
      // Periodic session check to detect passkey changes on sleepy devices
      const isMod = localStorage.getItem('si_is_moderator') === 'true';
      if (isMod) {
        try {
          const sessionRes = await fetch('/api/moderator/session-check');
          if (sessionRes.ok) {
            const sessionData = await sessionRes.json();
            if (sessionData && typeof sessionData.passkeyVersion === 'number') {
              const storedVersion = localStorage.getItem('si_moderator_session_version');
              if (storedVersion && storedVersion !== String(sessionData.passkeyVersion)) {
                onModeratorLogout?.(
                  'Your session expired because the moderator passkey was changed.'
                );
              }
            }
          }
        } catch {
          // ignore
        }
      }

      const res = await fetch('/api/questions?scope=all');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const clean: QuestionItem[] = data.filter((q) => q && !q.id?.startsWith('_'));
          saveLocalQuestions(clean);
          callback(clean);
        }
      }
    } catch {
      // silent background fallback
    }
  }, 4000);

  // Return unsubscribe cleanup function
  return () => {
    isClosed = true;
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    clearInterval(pollInterval);
    if (unsubFirestore) {
      unsubFirestore();
      unsubFirestore = null;
    }
  };
}

// Helper to parse search queries for exact quoted phrases and individual words
export function parseSearchTokens(rawQuery: string): {
  quotedPhrases: string[];
  tokens: string[];
  fullCleanQuery: string;
} {
  const fullCleanQuery = rawQuery.trim().toLowerCase();
  const quotedPhrases: string[] = [];

  // Extract quoted strings like "financial aid" or 'study room'
  const unquoted = fullCleanQuery.replace(/["']([^"']+)["']/g, (_, phrase) => {
    const trimmed = phrase.trim();
    if (trimmed) quotedPhrases.push(trimmed);
    return ' ';
  });

  // Split remaining text into words, removing punctuation
  const tokens = unquoted
    .split(/[\s,.;:!?/\\(){}[\]<>~`@#$%^&*+=_-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  return { quotedPhrases, tokens, fullCleanQuery };
}

// Calculate relevance score for phrase and multi-word searches
export function scoreQuestionMatch(
  q: QuestionItem,
  rawQuery: string
): { matches: boolean; score: number } {
  const clean = rawQuery.trim().toLowerCase();
  if (!clean) return { matches: true, score: 0 };

  const { quotedPhrases, tokens, fullCleanQuery } = parseSearchTokens(rawQuery);

  const content = q.content.toLowerCase();
  const reply = (q.reply || '').toLowerCase();
  const comments = (q.comments || []).map((c) => c.content.toLowerCase()).join(' ');
  const combined = `${content} ${reply} ${comments}`;

  // If user specified quotes e.g. "dining hall", ALL quoted phrases MUST exist
  if (quotedPhrases.length > 0) {
    const allQuotesPresent = quotedPhrases.every((phrase) => combined.includes(phrase));
    if (!allQuotesPresent) {
      return { matches: false, score: 0 };
    }
  }

  let score = 0;

  // 1. Quoted phrase bonus
  if (quotedPhrases.length > 0) {
    score += quotedPhrases.length * 60;
    quotedPhrases.forEach((p) => {
      if (content.includes(p)) score += 30;
      if (reply.includes(p)) score += 20;
    });
  }

  // 2. Full unquoted query exact contiguous match
  if (fullCleanQuery && combined.includes(fullCleanQuery)) {
    score += 80;
    if (content.includes(fullCleanQuery)) score += 40;
    if (reply.includes(fullCleanQuery)) score += 25;
  }

  // 3. Multi-word token evaluation
  const allTokens = tokens.length > 0 ? tokens : [fullCleanQuery];
  let matchedTokensCount = 0;

  allTokens.forEach((token) => {
    let tokenMatched = false;
    if (content.includes(token)) {
      score += 25;
      tokenMatched = true;
    }
    if (reply.includes(token)) {
      score += 18;
      tokenMatched = true;
    }
    if (comments.includes(token)) {
      score += 10;
      tokenMatched = true;
    }
    if (tokenMatched) matchedTokensCount++;
  });

  // Multi-word bonus: if ALL words in the query match across the question
  if (allTokens.length > 1 && matchedTokensCount === allTokens.length) {
    score += 50; // Big bonus for matching every word in the query
  } else if (allTokens.length > 1 && matchedTokensCount > 1) {
    score += matchedTokensCount * 15;
  }

  const isMatched = score > 0;
  return { matches: isMatched, score };
}

// Client-side instant filter supporting phrases and multiple words
export function filterAndRankQuestions(
  questions: QuestionItem[],
  rawQuery: string
): QuestionItem[] {
  if (!rawQuery.trim()) return questions;

  const scoredList: { item: QuestionItem; score: number }[] = [];

  for (const q of questions) {
    const { matches, score } = scoreQuestionMatch(q, rawQuery);
    if (matches) {
      scoredList.push({ item: q, score });
    }
  }

  return scoredList.sort((a, b) => b.score - a.score).map((s) => s.item);
}

// AI-assisted smart semantic search query with multi-word & phrase capability
export async function smartSearchQuestions(
  query: string,
  questions: QuestionItem[]
): Promise<string[]> {
  if (!query.trim() || questions.length === 0) return [];

  try {
    const payload = {
      query: query.trim(),
      items: questions.map((q) => ({
        id: q.id,
        content: q.content,
        reply: q.reply,
        comments: q.comments?.map((c) => c.content) || [],
      })),
    };

    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.matchedIds)) {
        return data.matchedIds;
      }
    }
  } catch (err) {
    console.warn('Smart AI search fallback to local engine:', err);
  }

  // Fallback: smart multi-token and phrase filter
  return filterAndRankQuestions(questions, query).map((q) => q.id);
}
