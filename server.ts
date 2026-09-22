import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'questions.json');

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
}

function formatDateTime(date: Date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Initial seed data with thoughtful Student Inclusion questions and official answers
const INITIAL_QUESTIONS: QuestionItem[] = [
  {
    id: 'q-101',
    content: 'Can we have dedicated quiet hours and low-sensory zones in the main library during midterms week for neurodivergent students?',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    createdAtFormatted: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 48)),
    reply: 'Thank you for this essential feedback! We coordinated with the Library Council, and Room 302 and the 4th-floor annex will be designated as sensory-friendly quiet spaces with dimmable warm lighting and noise-canceling headphones starting this Monday.',
    repliedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    repliedAtFormatted: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 36)),
    repliedBy: 'Student Inclusion Team',
    status: 'approved',
  },
  {
    id: 'q-102',
    content: 'Are there any financial grants or subsidies available for low-income students who cannot afford the lab kit fees for engineering classes?',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    createdAtFormatted: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 30)),
    reply: 'Yes! The Student Inclusion Equity Emergency Fund covers 100% of required lab gear and course materials. You can apply without invasive documentation through the confidential emergency aid portal on the student affairs page.',
    repliedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    repliedAtFormatted: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 20)),
    repliedBy: 'Student Inclusion Team',
    status: 'approved',
  },
  {
    id: 'q-103',
    content: 'Could the cafeteria offer more clearly labeled halal and kosher hot meal options every day instead of just once a week?',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    createdAtFormatted: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 22)),
    reply: 'Great suggestion. Dining Services has committed to standardizing daily certified halal and kosher hot options at the Global Flavors counter beginning next semester, complete with ingredient allergen cards.',
    repliedAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    repliedAtFormatted: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 14)),
    repliedBy: 'Student Inclusion Team',
    status: 'approved',
  },
  {
    id: 'q-104',
    content: 'Is there an anonymous way to report subtle microaggressions in seminar classrooms without fear of faculty retaliation?',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    createdAtFormatted: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 12)),
    reply: 'Absolutely. The campus Ombudsperson operates a strictly confidential, independent reporting channel where reports are aggregated anonymously to guide mandatory faculty cultural competence workshops.',
    repliedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    repliedAtFormatted: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 6)),
    repliedBy: 'Student Inclusion Team',
    status: 'approved',
  },
  {
    id: 'q-105',
    content: 'How can international students get involved in organizing cultural heritage months and multicultural performance nights?',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    createdAtFormatted: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 8)),
    reply: 'We warmly welcome all international students! The Student Inclusion Committee hosts open steering committee meetings every Thursday at 4 PM in the Multicultural Lounge. Drop in or email us directly!',
    repliedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    repliedAtFormatted: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 3)),
    repliedBy: 'Student Inclusion Team',
    status: 'approved',
  },
  {
    id: 'q-106',
    content: 'Could we get automatic door openers installed on the older North Wing restrooms? Wheelchair navigation is really difficult there right now.',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    createdAtFormatted: formatDateTime(new Date(Date.now() - 1000 * 60 * 45)),
    status: 'pending',
  },
];

function loadQuestions(): QuestionItem[] {
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

function saveQuestions(questions: QuestionItem[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(questions, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving questions file:', err);
  }
}

let questionsStore: QuestionItem[] = loadQuestions();

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  // Public questions: only approved ones with replies, sorted by newest first
  app.get('/api/questions', (req, res) => {
    const publicList = questionsStore
      .filter((q) => q.status === 'approved' && Boolean(q.reply))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(publicList);
  });

  // Submit a new anonymous question
  app.post('/api/questions', (req, res) => {
    const { content } = req.body;
    if (!content || typeof content !== 'string' || !content.trim()) {
      res.status(400).json({ error: 'Question content is required' });
      return;
    }

    const trimmed = content.trim();
    const now = new Date();
    const newQuestion: QuestionItem = {
      id: `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      content: trimmed,
      createdAt: now.toISOString(),
      createdAtFormatted: formatDateTime(now),
      status: 'pending',
    };

    // Add to store (in submission order)
    questionsStore.push(newQuestion);
    saveQuestions(questionsStore);

    res.status(201).json(newQuestion);
  });

  // Moderator verify passkey
  app.post('/api/moderator/verify', (req, res) => {
    const { passkey } = req.body;
    if (passkey === 'StudentInclusion2026') {
      res.json({ success: true, message: 'Authorized' });
    } else {
      res.status(401).json({ success: false, error: 'Invalid passkey' });
    }
  });

  // Moderator questions: all questions in submission order (oldest to newest)
  app.get('/api/moderator/questions', (req, res) => {
    // Preserve submission order
    res.json([...questionsStore]);
  });

  // Moderator reply to a question
  app.post('/api/moderator/reply', (req, res) => {
    const { id, reply, repliedBy } = req.body;
    if (!id || typeof reply !== 'string' || !reply.trim()) {
      res.status(400).json({ error: 'Question ID and reply content are required' });
      return;
    }

    const questionIndex = questionsStore.findIndex((q) => q.id === id);
    if (questionIndex === -1) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    const now = new Date();
    questionsStore[questionIndex].reply = reply.trim();
    questionsStore[questionIndex].repliedAt = now.toISOString();
    questionsStore[questionIndex].repliedAtFormatted = formatDateTime(now);
    questionsStore[questionIndex].repliedBy = repliedBy?.trim() || 'Student Inclusion Team';
    questionsStore[questionIndex].status = 'approved';

    saveQuestions(questionsStore);
    res.json(questionsStore[questionIndex]);
  });

  // Moderator delete question permanently
  app.delete('/api/moderator/questions/:id', (req, res) => {
    const { id } = req.params;
    const initialLen = questionsStore.length;
    questionsStore = questionsStore.filter((q) => q.id !== id);

    if (questionsStore.length === initialLen) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    saveQuestions(questionsStore);
    res.json({ success: true, message: 'Question permanently deleted' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Student Inclusion Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
