import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  QuestionItem,
  CommentItem,
  getAllQuestions,
  upsertQuestion,
  deleteQuestion,
  formatDateTime,
  getModeratorPasskey,
  setModeratorPasskey,
  ADMIN_PASSKEY,
  toggleQuestionLike,
  addCommentToQuestion,
  toggleCommentLike,
} from './server/db';

const PORT = 3000;

export type { QuestionItem, CommentItem };

// Active Server-Sent Events (SSE) clients for real-time synchronization across all devices
const sseClients = new Set<express.Response>();

export async function broadcastQuestions(): Promise<void> {
  try {
    const list = await getAllQuestions();
    const payload = `data: ${JSON.stringify({ type: 'sync', questions: list, timestamp: Date.now() })}\n\n`;
    for (const client of Array.from(sseClients)) {
      try {
        client.write(payload);
      } catch {
        sseClients.delete(client);
      }
    }
  } catch (err) {
    console.error('SSE broadcast error:', err);
  }
}

// 15-second heartbeat ping to prevent proxies from dropping idle SSE streams
setInterval(() => {
  for (const client of Array.from(sseClients)) {
    try {
      client.write(':ping\n\n');
    } catch {
      sseClients.delete(client);
    }
  }
}, 15000);

// Lazy initialization of Gemini GenAI client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  // Smart Search: AI-powered semantic matching using Gemini, with fuzzy keyword fallback
  app.post('/api/search', async (req, res) => {
    try {
      const { query, items } = req.body;
      if (!query || typeof query !== 'string' || !query.trim()) {
        res.json({ matchedIds: [], smart: false });
        return;
      }

      const cleanQuery = query.trim();
      if (!Array.isArray(items) || items.length === 0) {
        res.json({ matchedIds: [], smart: false });
        return;
      }

      // 1. Try Gemini GenAI semantic search if API key is present
      const ai = getAI();
      if (ai) {
        try {
          const catalog = items.slice(0, 60).map((item: any) => ({
            id: item.id,
            content: typeof item.content === 'string' ? item.content.slice(0, 300) : '',
            reply: typeof item.reply === 'string' ? item.reply.slice(0, 300) : '',
            comments: Array.isArray(item.comments)
              ? item.comments.slice(0, 4).map((c: any) => (typeof c === 'string' ? c : c?.content || '').slice(0, 150))
              : [],
          }));

          const prompt = `You are an advanced search matching and relevance ranking engine for an anonymous student campus Q&A board.
The student typed this search query:
"${cleanQuery}"

Catalog of campus questions and official answers:
${JSON.stringify(catalog)}

Instructions:
1. The search query may be:
   - An exact phrase in quotes (e.g. "financial aid", "quiet study", "meal plan").
   - Multiple words (e.g. "quiet study library", "food dining hall weekend", "stress exam counseling").
   - A natural language question or phrase (e.g. "how do I get help with tuition", "where to sleep on campus").
2. Match questions based on:
   - Exact phrase matches (if quoted or if words appear consecutively).
   - Multi-word relevance: items addressing multiple words or concepts from the query should receive high scores.
   - Conceptual / semantic intent and campus synonyms (e.g. "food" <-> "dining hall", "meal plan", "cafeteria"; "depressed/stressed" <-> "wellness center", "counseling").
3. Score each relevant question from 1 to 100:
   - 90-100: Exact phrase or direct match on all key concepts.
   - 70-89: Matches multiple words/concepts or strong semantic intent.
   - 40-69: Partially matches words or related campus topic.
   - Below 40: Do not include.

Return a JSON array of objects sorted by relevance descending:
[
  { "id": string, "score": number }
]
If none are relevant, return an empty array [].
Output ONLY valid JSON without markdown wrapping.`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
            },
          });

          const rawText = response.text?.trim() || '[]';
          const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
          const parsed = JSON.parse(cleanJson);

          if (Array.isArray(parsed)) {
            const matchedIds = parsed
              .filter((p: any) => p && typeof p.id === 'string' && (p.score === undefined || p.score >= 35))
              .map((p: any) => p.id);
            res.json({ matchedIds, smart: true });
            return;
          }
        } catch (geminiErr) {
          console.warn('Gemini semantic search fallback to keyword engine:', geminiErr);
        }
      }

      // 2. Fallback: advanced phrase and multi-word token matching
      const fullClean = cleanQuery.toLowerCase();
      const quotedPhrases: string[] = [];
      const unquoted = fullClean.replace(/["']([^"']+)["']/g, (_, phrase) => {
        const trimmed = phrase.trim();
        if (trimmed) quotedPhrases.push(trimmed);
        return ' ';
      });
      const tokens = unquoted
        .split(/[\s,.;:!?/\\(){}[\]<>~`@#$%^&*+=_-]+/)
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const scored = items
        .map((item: any) => {
          const content = (item.content || '').toLowerCase();
          const reply = (item.reply || '').toLowerCase();
          const comments = Array.isArray(item.comments)
            ? item.comments
                .map((c: any) => (typeof c === 'string' ? c : c?.content || ''))
                .join(' ')
                .toLowerCase()
            : '';
          const combined = `${content} ${reply} ${comments}`;

          // If quotes were used, verify all quoted phrases are present
          if (quotedPhrases.length > 0) {
            const allQuotesMatch = quotedPhrases.every((qp) => combined.includes(qp));
            if (!allQuotesMatch) return { id: item.id, score: 0 };
          }

          let score = 0;

          // Quoted phrase bonus
          if (quotedPhrases.length > 0) {
            score += quotedPhrases.length * 60;
          }

          // Full exact continuous phrase match
          if (fullClean && combined.includes(fullClean)) {
            score += 80;
            if (content.includes(fullClean)) score += 40;
            if (reply.includes(fullClean)) score += 20;
          }

          // Multiple word tokens
          const activeTokens = tokens.length > 0 ? tokens : [fullClean];
          let matchedTokensCount = 0;

          for (const token of activeTokens) {
            let matched = false;
            if (content.includes(token)) {
              score += 25;
              matched = true;
            }
            if (reply.includes(token)) {
              score += 18;
              matched = true;
            }
            if (comments.includes(token)) {
              score += 10;
              matched = true;
            }
            if (matched) matchedTokensCount++;
          }

          // All-words bonus for multi-word searches
          if (activeTokens.length > 1 && matchedTokensCount === activeTokens.length) {
            score += 50;
          } else if (activeTokens.length > 1 && matchedTokensCount > 1) {
            score += matchedTokensCount * 15;
          }

          return { id: item.id, score };
        })
        .filter((s: any) => s.score > 0)
        .sort((a: any, b: any) => b.score - a.score)
        .map((s: any) => s.id);

      res.json({ matchedIds: scored, smart: false });
    } catch (err) {
      console.error('Search error:', err);
      res.status(500).json({ error: 'Search failed', matchedIds: [], smart: false });
    }
  });

  // Real-time Server-Sent Events (SSE) stream for instant synchronization across all devices
  app.get('/api/questions/stream', async (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*',
    });

    // Send immediate snapshot upon connection
    try {
      const list = await getAllQuestions();
      res.write(`data: ${JSON.stringify({ type: 'init', questions: list, timestamp: Date.now() })}\n\n`);
    } catch (err) {
      console.error('Initial SSE send error:', err);
    }

    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
  });

  // Public questions: approved questions with replies by default, or all questions if ?scope=all
  app.get('/api/questions', async (req, res) => {
    try {
      const list = await getAllQuestions();
      if (req.query.scope === 'all') {
        const sorted = [...list].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        res.json(sorted);
        return;
      }
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
        likes: 0,
        comments: [],
        authorName:
          typeof authorName === 'string' && authorName.trim() ? authorName.trim() : 'Student',
      };

      await upsertQuestion(newQuestion);
      broadcastQuestions().catch((err) => console.error('Broadcast note:', err));
      res.status(201).json(newQuestion);
    } catch (err) {
      console.error('Error submitting question:', err);
      res.status(500).json({ error: 'Failed to submit question' });
    }
  });

  // Moderator verify passkey (dynamically checks current passkey)
  app.post('/api/moderator/verify', async (req, res) => {
    try {
      const { passkey } = req.body;
      const current = await getModeratorPasskey();
      if (passkey && passkey.trim() === current) {
        res.json({ success: true, message: 'Authorized' });
      } else {
        res.status(401).json({ success: false, error: 'Invalid passkey' });
      }
    } catch (err) {
      console.error('Error verifying moderator passkey:', err);
      res.status(500).json({ success: false, error: 'Verification error' });
    }
  });

  // Admin verify master passkey ("NiKo0709") to access passkey management page
  app.post('/api/admin/verify', async (req, res) => {
    try {
      const { adminPasskey } = req.body;
      if (adminPasskey && adminPasskey.trim() === ADMIN_PASSKEY) {
        const currentModeratorPasskey = await getModeratorPasskey();
        res.json({
          success: true,
          message: 'Admin authorized',
          currentModeratorPasskey,
        });
      } else {
        res.status(401).json({ success: false, error: 'Invalid admin passkey' });
      }
    } catch (err) {
      console.error('Error verifying admin passkey:', err);
      res.status(500).json({ success: false, error: 'Admin verification failed' });
    }
  });

  // Admin get current moderator passkey (requires admin passkey)
  app.post('/api/admin/get-passkey', async (req, res) => {
    try {
      const { adminPasskey } = req.body;
      if (adminPasskey && adminPasskey.trim() === ADMIN_PASSKEY) {
        const currentModeratorPasskey = await getModeratorPasskey();
        res.json({ success: true, currentModeratorPasskey });
      } else {
        res.status(401).json({ success: false, error: 'Unauthorized: Invalid admin passkey' });
      }
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to retrieve passkey' });
    }
  });

  // Admin update moderator passkey (requires admin passkey)
  app.post('/api/admin/update-passkey', async (req, res) => {
    try {
      const { adminPasskey, newPasskey } = req.body;
      if (!adminPasskey || adminPasskey.trim() !== ADMIN_PASSKEY) {
        res.status(401).json({ success: false, error: 'Unauthorized: Invalid admin passkey' });
        return;
      }

      if (!newPasskey || typeof newPasskey !== 'string' || !newPasskey.trim()) {
        res.status(400).json({ success: false, error: 'New passkey cannot be empty' });
        return;
      }

      const trimmed = newPasskey.trim();
      if (trimmed.length < 3) {
        res.status(400).json({ success: false, error: 'Passkey must be at least 3 characters long' });
        return;
      }

      const updated = await setModeratorPasskey(trimmed);
      res.json({
        success: true,
        message: 'Moderator passkey successfully updated',
        currentModeratorPasskey: updated,
      });
    } catch (err) {
      console.error('Error updating moderator passkey:', err);
      res.status(500).json({ success: false, error: 'Failed to update passkey' });
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
      broadcastQuestions().catch((err) => console.error('Broadcast note:', err));
      res.json(updated);
    } catch (err) {
      console.error('Error replying to question:', err);
      res.status(500).json({ error: 'Failed to reply to question' });
    }
  });

  // Moderator delete question permanently (DELETE method)
  app.delete('/api/moderator/questions/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await deleteQuestion(id);
      if (!deleted) {
        res.status(404).json({ error: 'Question not found' });
        return;
      }
      broadcastQuestions().catch((err) => console.error('Broadcast note:', err));
      res.json({ success: true, message: 'Question permanently deleted' });
    } catch (err) {
      console.error('Error deleting question:', err);
      res.status(500).json({ error: 'Failed to delete question' });
    }
  });

  // Moderator delete question (POST alternative for high-compatibility proxies)
  app.post('/api/moderator/delete', async (req, res) => {
    try {
      const { id } = req.body;
      if (!id) {
        res.status(400).json({ error: 'Question id is required' });
        return;
      }
      const deleted = await deleteQuestion(id);
      if (!deleted) {
        res.status(404).json({ error: 'Question not found' });
        return;
      }
      broadcastQuestions().catch((err) => console.error('Broadcast note:', err));
      res.json({ success: true, message: 'Question permanently deleted' });
    } catch (err) {
      console.error('Error deleting question via POST:', err);
      res.status(500).json({ error: 'Failed to delete question' });
    }
  });

  // Like or unlike a question
  app.post('/api/questions/:id/like', async (req, res) => {
    try {
      const { id } = req.params;
      const { isLiked } = req.body;
      const likes = await toggleQuestionLike(id, Boolean(isLiked));
      broadcastQuestions().catch((err) => console.error('Broadcast note:', err));
      res.json({ success: true, likes });
    } catch (err) {
      console.error('Error liking question:', err);
      res.status(500).json({ error: 'Failed to like question' });
    }
  });

  // Add comment to a question
  app.post('/api/questions/:id/comments', async (req, res) => {
    try {
      const { id } = req.params;
      const { content, authorName } = req.body;
      if (!content || typeof content !== 'string' || !content.trim()) {
        res.status(400).json({ error: 'Comment content is required' });
        return;
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

      const result = await addCommentToQuestion(id, newComment);
      if (!result) {
        res.status(404).json({ error: 'Question not found' });
        return;
      }

      broadcastQuestions().catch((err) => console.error('Broadcast note:', err));
      res.status(201).json(result);
    } catch (err) {
      console.error('Error adding comment:', err);
      res.status(500).json({ error: 'Failed to add comment' });
    }
  });

  // Like or unlike a comment
  app.post('/api/questions/:id/comments/:commentId/like', async (req, res) => {
    try {
      const { id, commentId } = req.params;
      const { isLiked } = req.body;
      const likes = await toggleCommentLike(id, commentId, Boolean(isLiked));
      broadcastQuestions().catch((err) => console.error('Broadcast note:', err));
      res.json({ success: true, likes });
    } catch (err) {
      console.error('Error liking comment:', err);
      res.status(500).json({ error: 'Failed to like comment' });
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
