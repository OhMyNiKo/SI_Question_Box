import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  QuestionItem,
  getAllQuestions,
  upsertQuestion,
  deleteQuestion,
  formatDateTime,
} from './server/db';

const PORT = 3000;

export type { QuestionItem };

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  // Public questions: only approved ones with replies, sorted by newest first
  app.get('/api/questions', async (req, res) => {
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
  app.post('/api/questions', async (req, res) => {
    try {
      const { content, authorName } = req.body;
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
  app.post('/api/moderator/verify', (req, res) => {
    const { passkey } = req.body;
    if (passkey === 'StudentInclusion2026') {
      res.json({ success: true, message: 'Authorized' });
    } else {
      res.status(401).json({ success: false, error: 'Invalid passkey' });
    }
  });

  // Moderator questions: all questions
  app.get('/api/moderator/questions', async (req, res) => {
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
  app.post('/api/moderator/reply', async (req, res) => {
    try {
      const { id, reply, repliedBy } = req.body;
      if (!id || typeof reply !== 'string' || !reply.trim()) {
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
        repliedBy: repliedBy?.trim() || 'Student Inclusion Team',
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
  app.delete('/api/moderator/questions/:id', async (req, res) => {
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
