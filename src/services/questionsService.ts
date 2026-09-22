import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { QuestionItem } from '../types';

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
  },
  {
    id: 'q-106',
    content:
      'Could we get automatic door openers installed on the older North Wing restrooms? Wheelchair navigation is really difficult there right now.',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    createdAtFormatted: formatDateTime(new Date(Date.now() - 1000 * 60 * 45)),
    status: 'pending',
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
  const firestore = db;
  if (firestore) {
    try {
      const snap = await withTimeout(getDocs(collection(firestore, 'questions')), 3500);
      if (!snap.empty) {
        const list: QuestionItem[] = [];
        snap.forEach((d) => list.push(d.data() as QuestionItem));
        saveLocalQuestions(list);
        return list;
      } else {
        // Initial seed into Firebase
        const seedPromises = INITIAL_QUESTIONS.map((q) =>
          setDoc(doc(firestore, 'questions', q.id), q)
        );
        Promise.all(seedPromises).catch((err) => console.warn('Seeding note:', err));
        saveLocalQuestions(INITIAL_QUESTIONS);
        return [...INITIAL_QUESTIONS];
      }
    } catch (err) {
      console.warn('Firestore load failed or timed out; reading from local storage:', err);
    }
  }

  return getLocalQuestions();
}

export async function getPublicQuestions(): Promise<QuestionItem[]> {
  const all = await getAllQuestions();
  return all
    .filter((q) => q.status === 'approved' && Boolean(q.reply))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getModeratorQuestions(): Promise<QuestionItem[]> {
  const all = await getAllQuestions();
  return [...all].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function submitQuestion(content: string, authorName?: string): Promise<QuestionItem> {
  const trimmed = content.trim();
  const now = new Date();
  const newQuestion: QuestionItem = {
    id: `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    content: trimmed,
    createdAt: now.toISOString(),
    createdAtFormatted: formatDateTime(now),
    status: 'pending',
    authorName: authorName && authorName.trim() ? authorName.trim() : 'Student',
  };

  // Always update local storage first so the user is NEVER blocked
  const local = getLocalQuestions();
  local.unshift(newQuestion);
  saveLocalQuestions(local);

  // Sync to Firebase Firestore
  const firestore = db;
  if (firestore) {
    try {
      await withTimeout(setDoc(doc(firestore, 'questions', newQuestion.id), newQuestion), 3000);
    } catch (err) {
      console.warn('Firestore submission sync note:', err);
    }
  }

  return newQuestion;
}

export async function replyToQuestion(
  id: string,
  reply: string,
  repliedBy = 'Student Inclusion Team'
): Promise<QuestionItem> {
  const all = await getAllQuestions();
  const target = all.find((q) => q.id === id);
  if (!target) {
    throw new Error('Question not found');
  }

  const now = new Date();
  const updated: QuestionItem = {
    ...target,
    reply: reply.trim(),
    repliedAt: now.toISOString(),
    repliedAtFormatted: formatDateTime(now),
    repliedBy: repliedBy.trim() || 'Student Inclusion Team',
    status: 'approved',
  };

  const local = getLocalQuestions();
  const idx = local.findIndex((q) => q.id === id);
  if (idx >= 0) {
    local[idx] = updated;
  } else {
    local.push(updated);
  }
  saveLocalQuestions(local);

  const firestore = db;
  if (firestore) {
    try {
      await withTimeout(setDoc(doc(firestore, 'questions', id), updated), 3000);
    } catch (err) {
      console.warn('Firestore reply sync note:', err);
    }
  }

  return updated;
}

export async function deleteQuestion(id: string): Promise<boolean> {
  const local = getLocalQuestions();
  const filtered = local.filter((q) => q.id !== id);
  saveLocalQuestions(filtered);

  const firestore = db;
  if (firestore) {
    try {
      await withTimeout(deleteDoc(doc(firestore, 'questions', id)), 3000);
    } catch (err) {
      console.warn('Firestore delete sync note:', err);
    }
  }

  return true;
}

export function verifyPasskey(passkey: string): boolean {
  return passkey.trim() === 'StudentInclusion2026';
}
