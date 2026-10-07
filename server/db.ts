import fs from 'fs';
import path from 'path';
import { getDb } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc, onSnapshot } from 'firebase/firestore';

export interface CommentItem {
  id: string;
  authorName?: string;
  content: string;
  createdAt: string;
  createdAtFormatted: string;
  likes?: number;
}

export interface QuestionItem {
  id: string;
  content: string;
  createdAt: string;
  createdAtFormatted: string;
  reply?: string;
  repliedAt?: string;
  repliedAtFormatted?: string;
  repliedBy?: string;
  status: 'pending' | 'approved';
  authorName?: string;
  category?: string;
  likes?: number;
  comments?: CommentItem[];
}

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

const DATA_DIR = process.env.VERCEL ? '/tmp/data' : path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'questions.json');

function loadLocalQuestions(): QuestionItem[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_QUESTIONS, null, 2), 'utf-8');
      return INITIAL_QUESTIONS;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading questions file:', err);
    return INITIAL_QUESTIONS;
  }
}

function saveLocalQuestions(questions: QuestionItem[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(questions, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving questions file:', err);
  }
}

function withTimeout<T>(promise: Promise<T>, ms = 2500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Firestore operation timed out after ${ms}ms`)), ms)
    ),
  ]);
}

export async function getAllQuestions(): Promise<QuestionItem[]> {
  const db = getDb();
  if (db) {
    try {
      const snap = await withTimeout(getDocs(collection(db, 'questions')), 3500);
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
      } else {
        // Initial seeding if Firestore collection is fresh
        console.log('[Server DB] Seeding initial questions to Firestore...');
        try {
          await Promise.all(INITIAL_QUESTIONS.map((q) => setDoc(doc(db, 'questions', q.id), q)));
        } catch (seedErr) {
          console.error('[Server DB] Seeding error:', seedErr);
        }
        saveLocalQuestions(INITIAL_QUESTIONS);
        return [...INITIAL_QUESTIONS];
      }
    } catch (err) {
      console.error('Firestore getAllQuestions error, falling back to local storage:', err);
    }
  }
  return loadLocalQuestions();
}

export async function upsertQuestion(q: QuestionItem): Promise<void> {
  const db = getDb();
  if (db) {
    try {
      await withTimeout(setDoc(doc(db, 'questions', q.id), q), 2500);
    } catch (err) {
      console.error('Firestore upsertQuestion error (will store locally):', err);
    }
  }

  const local = loadLocalQuestions();
  const idx = local.findIndex((item) => item.id === q.id);
  if (idx >= 0) {
    local[idx] = q;
  } else {
    local.push(q);
  }
  saveLocalQuestions(local);
}

export async function deleteQuestion(id: string): Promise<boolean> {
  const db = getDb();
  if (db) {
    try {
      await withTimeout(deleteDoc(doc(db, 'questions', id)), 2500);
    } catch (err) {
      console.error('Firestore deleteQuestion error:', err);
    }
  }

  const local = loadLocalQuestions();
  const filtered = local.filter((item) => item.id !== id);
  const found = filtered.length !== local.length;
  if (found) {
    saveLocalQuestions(filtered);
  }
  return found;
}

export async function toggleQuestionLike(questionId: string, isLiked: boolean): Promise<number> {
  const list = await getAllQuestions();
  const target = list.find((q) => q.id === questionId);
  if (!target) return 0;

  const currentLikes = target.likes || 0;
  const newLikes = isLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1);
  target.likes = newLikes;
  await upsertQuestion(target);
  return newLikes;
}

export async function addCommentToQuestion(questionId: string, comment: CommentItem): Promise<CommentItem | null> {
  const list = await getAllQuestions();
  const target = list.find((q) => q.id === questionId);
  if (!target) return null;

  if (!target.comments) {
    target.comments = [];
  }
  target.comments.push(comment);
  await upsertQuestion(target);
  return comment;
}

export async function toggleCommentLike(
  questionId: string,
  commentId: string,
  isLiked: boolean
): Promise<number> {
  const list = await getAllQuestions();
  const target = list.find((q) => q.id === questionId);
  if (!target || !target.comments) return 0;

  const comment = target.comments.find((c) => c.id === commentId);
  if (!comment) return 0;

  const currentLikes = comment.likes || 0;
  const newLikes = isLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1);
  comment.likes = newLikes;
  await upsertQuestion(target);
  return newLikes;
}

// -------------------------------------------------------------
// Moderator Passkey Management & Security
// -------------------------------------------------------------
export const DEFAULT_MODERATOR_PASSKEY = 'StudentInclusion2026';
export const ADMIN_PASSKEY = 'NiKo0709';

const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

export interface AppSettings {
  moderatorPasskey: string;
  updatedAt: string;
  passkeyVersion: number;
}

function loadLocalSettings(): AppSettings {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data && typeof data.moderatorPasskey === 'string' && data.moderatorPasskey.trim()) {
        return {
          moderatorPasskey: data.moderatorPasskey.trim(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          passkeyVersion: typeof data.passkeyVersion === 'number' ? data.passkeyVersion : 1,
        };
      }
    }
  } catch (err) {
    console.error('Error reading settings file:', err);
  }
  return {
    moderatorPasskey: DEFAULT_MODERATOR_PASSKEY,
    updatedAt: new Date().toISOString(),
    passkeyVersion: 1,
  };
}

let cachedAppSettings: AppSettings | null = null;
let lastSettingsFetchTime = 0;
let firestoreSettingsListenerInitialized = false;

function initFirestoreSettingsListener() {
  if (firestoreSettingsListenerInitialized) return;
  const db = getDb();
  if (!db) return;
  firestoreSettingsListenerInitialized = true;
  const handleSnap = (snap: any) => {
    if (snap.exists()) {
      const data = snap.data();
      if (data && typeof data.moderatorPasskey === 'string' && data.moderatorPasskey.trim()) {
        cachedAppSettings = {
          moderatorPasskey: data.moderatorPasskey.trim(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          passkeyVersion: typeof data.passkeyVersion === 'number' ? data.passkeyVersion : 1,
        };
        lastSettingsFetchTime = Date.now();
        saveLocalSettings(cachedAppSettings);
        console.log(
          '[Server DB] Real-time synced passkey from Firestore:',
          cachedAppSettings.moderatorPasskey,
          'v' + cachedAppSettings.passkeyVersion
        );
      }
    }
  };

  try {
    onSnapshot(doc(db, 'settings', 'security'), handleSnap, (err) => {
      console.warn('[Server DB] Settings onSnapshot notice:', err.message);
    });
    onSnapshot(doc(db, 'questions', '_settings_security'), handleSnap, () => {});
  } catch (err) {
    console.warn('[Server DB] Failed to init settings listener:', err);
  }
}

function saveLocalSettings(settings: AppSettings): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving settings file:', err);
  }
}

export async function getAppSettings(options?: { forceFresh?: boolean }): Promise<AppSettings> {
  initFirestoreSettingsListener();

  const now = Date.now();
  const isCacheExpired = !cachedAppSettings || (now - lastSettingsFetchTime > 6000);

  // If cached and fresh, return immediately unless forceFresh is requested
  if (!options?.forceFresh && cachedAppSettings && !isCacheExpired) {
    return cachedAppSettings;
  }

  const db = getDb();
  if (db) {
    try {
      let snap = await withTimeout(getDoc(doc(db, 'settings', 'security')), 2500);
      if (!snap.exists()) {
        snap = await withTimeout(getDoc(doc(db, 'questions', '_settings_security')), 2500);
      }
      if (snap.exists()) {
        const data = snap.data();
        if (data && typeof data.moderatorPasskey === 'string' && data.moderatorPasskey.trim()) {
          cachedAppSettings = {
            moderatorPasskey: data.moderatorPasskey.trim(),
            updatedAt: data.updatedAt || new Date().toISOString(),
            passkeyVersion: typeof data.passkeyVersion === 'number' ? data.passkeyVersion : 1,
          };
          lastSettingsFetchTime = Date.now();
          saveLocalSettings(cachedAppSettings);
          return cachedAppSettings;
        }
      } else {
        // Seed default passkey to Firestore if document does not exist yet
        const defaultSettings: AppSettings = {
          moderatorPasskey: DEFAULT_MODERATOR_PASSKEY,
          updatedAt: new Date().toISOString(),
          passkeyVersion: 1,
        };
        await setDoc(doc(db, 'settings', 'security'), defaultSettings);
        await setDoc(doc(db, 'questions', '_settings_security'), defaultSettings);
        cachedAppSettings = defaultSettings;
        lastSettingsFetchTime = Date.now();
        saveLocalSettings(defaultSettings);
        return defaultSettings;
      }
    } catch (err) {
      console.warn('[Server DB] Firestore getDoc settings note:', err);
    }
  }

  if (cachedAppSettings) {
    return cachedAppSettings;
  }

  const local = loadLocalSettings();
  cachedAppSettings = local;
  lastSettingsFetchTime = Date.now();
  return cachedAppSettings;
}

export async function getModeratorPasskey(): Promise<string> {
  const settings = await getAppSettings();
  return settings.moderatorPasskey;
}

export async function setModeratorPasskey(newPasskey: string): Promise<AppSettings> {
  const trimmed = newPasskey.trim();
  const current = await getAppSettings({ forceFresh: true });
  const nextVersion = (current.passkeyVersion || 1) + 1;

  const settings: AppSettings = {
    moderatorPasskey: trimmed,
    updatedAt: new Date().toISOString(),
    passkeyVersion: nextVersion,
  };

  cachedAppSettings = settings;
  lastSettingsFetchTime = Date.now();
  saveLocalSettings(settings);

  const db = getDb();
  if (db) {
    try {
      // Guaranteed await so all server instances and connected devices see the new passkey immediately
      await withTimeout(setDoc(doc(db, 'settings', 'security'), settings), 4000);
      await withTimeout(setDoc(doc(db, 'questions', '_settings_security'), settings), 4000);
      console.log(
        '[Server DB] Persisted new moderator passkey to Firestore:',
        trimmed,
        'v' + nextVersion
      );
    } catch (err) {
      console.error('[Server DB] Error persisting new passkey to Firestore:', err);
    }
  }

  return settings;
}
