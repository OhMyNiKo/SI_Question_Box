import fs from 'fs';
import path from 'path';
import { getDb } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';

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
      const snap = await withTimeout(getDocs(collection(db, 'questions')), 2500);
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
        return list;
      } else {
        // Initial seeding if Firestore collection is fresh (non-blocking)
        Promise.all(INITIAL_QUESTIONS.map((q) => setDoc(doc(db, 'questions', q.id), q))).catch(
          (err) => console.error('Seeding error:', err)
        );
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

// -------------------------------------------------------------
// Moderator Passkey Management & Security
// -------------------------------------------------------------
export const DEFAULT_MODERATOR_PASSKEY = 'StudentInclusion2026';
export const ADMIN_PASSKEY = 'NiKo0709';

const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

export interface AppSettings {
  moderatorPasskey: string;
  updatedAt: string;
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
        return data;
      }
    }
  } catch (err) {
    console.error('Error reading settings file:', err);
  }
  return {
    moderatorPasskey: DEFAULT_MODERATOR_PASSKEY,
    updatedAt: new Date().toISOString(),
  };
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

export async function getModeratorPasskey(): Promise<string> {
  const db = getDb();
  if (db) {
    // 1. Primary: read from questions/_settings_security (covered by /questions/{id} rule)
    try {
      const snap = await withTimeout(getDoc(doc(db, 'questions', '_settings_security')), 2500);
      if (snap.exists()) {
        const data = snap.data();
        if (data && typeof data.moderatorPasskey === 'string' && data.moderatorPasskey.trim()) {
          return data.moderatorPasskey.trim();
        }
      }
    } catch {
      // ignore
    }

    // 2. Secondary: try settings/moderator_security
    try {
      const docSnap = await withTimeout(getDoc(doc(db, 'settings', 'moderator_security')), 2500);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && typeof data.moderatorPasskey === 'string' && data.moderatorPasskey.trim()) {
          return data.moderatorPasskey.trim();
        }
      }
    } catch {
      // ignore
    }
  }
  const local = loadLocalSettings();
  return local.moderatorPasskey;
}

export async function setModeratorPasskey(newPasskey: string): Promise<string> {
  const trimmed = newPasskey.trim();
  const settings: AppSettings = {
    moderatorPasskey: trimmed,
    updatedAt: new Date().toISOString(),
  };

  const db = getDb();
  if (db) {
    // 1. Save to questions/_settings_security (permitted under /questions/{id})
    try {
      await withTimeout(setDoc(doc(db, 'questions', '_settings_security'), settings), 2500);
    } catch {
      // ignore
    }

    // 2. Also try settings/moderator_security if /settings/ is allowed
    try {
      await withTimeout(setDoc(doc(db, 'settings', 'moderator_security'), settings), 2500);
    } catch {
      // ignore
    }
  }

  saveLocalSettings(settings);
  return trimmed;
}
