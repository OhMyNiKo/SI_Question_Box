import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
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
  const firestore = db;
  if (firestore) {
    try {
      const snap = await withTimeout(getDocs(collection(firestore, 'questions')), 3500);
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

export const DEFAULT_MODERATOR_PASSKEY = 'StudentInclusion2026';
export const ADMIN_PASSKEY = 'NiKo0709';

export function getLocalModeratorPasskey(): string {
  try {
    return localStorage.getItem('si_moderator_passkey') || DEFAULT_MODERATOR_PASSKEY;
  } catch {
    return DEFAULT_MODERATOR_PASSKEY;
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
        return true;
      }
    }
  } catch (err) {
    console.warn('Server verifyPasskey fallback to local:', err);
  }

  // 2. Fallback to local stored passkey
  const localCurrent = getLocalModeratorPasskey();
  return trimmed === localCurrent || trimmed === DEFAULT_MODERATOR_PASSKEY;
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
): Promise<{ success: boolean; updatedPasskey: string; error?: string }> {
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
      return { success: true, updatedPasskey: data.currentModeratorPasskey || trimmedNew };
    } else {
      return { success: false, updatedPasskey: '', error: data.error || 'Server failed to update passkey' };
    }
  } catch (err) {
    console.warn('Server update error, updating local storage:', err);
    setLocalModeratorPasskey(trimmedNew);
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
  if (!target) return 0;

  const currentLikes = target.likes || 0;
  const newLikes = isLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1);
  target.likes = newLikes;
  saveLocalQuestions(local);
  saveUserLikedQuestion(questionId, isLiked);

  const firestore = db;
  if (firestore) {
    try {
      await withTimeout(setDoc(doc(firestore, 'questions', questionId), target), 3000);
    } catch (err) {
      console.warn('Firestore question like sync note:', err);
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
  const local = getLocalQuestions();
  const target = local.find((q) => q.id === questionId);
  if (!target) {
    throw new Error('Question not found');
  }

  const now = new Date();
  const newComment: CommentItem = {
    id: `c-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    content: content.trim(),
    authorName: authorName && authorName.trim() ? authorName.trim() : 'Student',
    createdAt: now.toISOString(),
    createdAtFormatted: formatDateTime(now),
    likes: 0,
  };

  if (!target.comments) {
    target.comments = [];
  }
  target.comments.push(newComment);
  saveLocalQuestions(local);

  const firestore = db;
  if (firestore) {
    try {
      await withTimeout(setDoc(doc(firestore, 'questions', questionId), target), 3000);
    } catch (err) {
      console.warn('Firestore add comment sync note:', err);
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
  if (!target || !target.comments) return 0;

  const comment = target.comments.find((c) => c.id === commentId);
  if (!comment) return 0;

  const currentLikes = comment.likes || 0;
  const newLikes = isLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1);
  comment.likes = newLikes;
  saveLocalQuestions(local);
  saveUserLikedComment(commentId, isLiked);

  const firestore = db;
  if (firestore) {
    try {
      await withTimeout(setDoc(doc(firestore, 'questions', questionId), target), 3000);
    } catch (err) {
      console.warn('Firestore comment like sync note:', err);
    }
  }

  return newLikes;
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
