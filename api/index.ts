import express from 'express';
import {
  QuestionItem,
  getAllQuestions,
  upsertQuestion,
  deleteQuestion,
  formatDateTime,
} from '../server/db';
import { getDb } from '../server/firebase';

const app = express();

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

export type { QuestionItem };

function getParsedBody(req: express.Request): Record<string, unknown> {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return (req.body as Record<string, unknown>) || {};
}

const router = express.Router();

// Health check endpoint to quickly test API in browser: /api/health
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    firebaseConnected: Boolean(getDb()),
  });
});

// Public questions: only approved ones with replies, sorted by newest first
router.get('/questions', async (req, res) => {
  try {
    const list = await getAllQuestions();
    const publicList = list
      .filter((q) => q.status === 'approved' && Boolean(q.reply))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(publicList);
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ error: 'Failed to retrieve questions' });
  }
});

// Submit a new question
router.post('/questions', async (req, res) => {
  try {
    const body = getParsedBody(req);
    const content = body.content;
    const authorName = body.authorName;

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
      authorName:
        typeof authorName === 'string' && authorName.trim() ? authorName.trim() : 'Student',
    };

    await upsertQuestion(newQuestion);
    res.status(201).json(newQuestion);
  } catch (err) {
    console.error('Error submitting question:', err);
    res.status(500).json({ error: 'Failed to submit question' });
  }
});

// Moderator verify passkey
router.post('/moderator/verify', (req, res) => {
  const body = getParsedBody(req);
  const passkey = body.passkey;
  if (passkey === 'StudentInclusion2026') {
    res.json({ success: true, message: 'Authorized' });
  } else {
    res.status(401).json({ success: false, error: 'Invalid passkey' });
  }
});

// Moderator questions: all questions
router.get('/moderator/questions', async (req, res) => {
  try {
    const list = await getAllQuestions();
    const sorted = [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json(sorted);
  } catch (err) {
    console.error('Error fetching moderator questions:', err);
    res.status(500).json({ error: 'Failed to retrieve moderator questions' });
  }
});

// Moderator reply to a question
router.post('/moderator/reply', async (req, res) => {
  try {
    const body = getParsedBody(req);
    const id = body.id;
    const reply = body.reply;
    const repliedBy = body.repliedBy;

    if (!id || typeof id !== 'string' || typeof reply !== 'string' || !reply.trim()) {
      res.status(400).json({ error: 'Question ID and reply content are required' });
      return;
    }

    const list = await getAllQuestions();
    const target = list.find((q) => q.id === id);
    if (!target) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    const now = new Date();
    const updated: QuestionItem = {
      ...target,
      reply: reply.trim(),
      repliedAt: now.toISOString(),
      repliedAtFormatted: formatDateTime(now),
      repliedBy:
        typeof repliedBy === 'string' && repliedBy.trim()
          ? repliedBy.trim()
          : 'Student Inclusion Team',
      status: 'approved',
    };

    await upsertQuestion(updated);
    res.json(updated);
  } catch (err) {
    console.error('Error replying to question:', err);
    res.status(500).json({ error: 'Failed to reply to question' });
  }
});

// Moderator delete question permanently
router.delete('/moderator/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteQuestion(id);
    if (!deleted) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }
    res.json({ success: true, message: 'Question permanently deleted' });
  } catch (err) {
    console.error('Error deleting question:', err);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// Mount router on BOTH '/api' AND '/' so Vercel rewrites and direct calls always succeed
app.use('/api', router);
app.use('/', router);

export default app;
