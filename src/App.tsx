import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Header } from './components/Header';
import { SubmitView } from './components/SubmitView';
import { PublicFeedView } from './components/PublicFeedView';
import { ModeratorView } from './components/ModeratorView';
import { QuestionItem, ActiveView } from './types';
import {
  getPublicQuestions,
  getModeratorQuestions,
  replyToQuestion,
  deleteQuestion,
  verifyPasskey,
} from './services/questionsService';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('submit');
  const [isModerator, setIsModerator] = useState<boolean>(() => {
    return localStorage.getItem('si_is_moderator') === 'true';
  });

  const [publicQuestions, setPublicQuestions] = useState<QuestionItem[]>([]);
  const [allModeratorQuestions, setAllModeratorQuestions] = useState<QuestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [moderatorBannerNotice, setModeratorBannerNotice] = useState<string | null>(null);

  // Fetch public questions (sorted by newest)
  const fetchPublicQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getPublicQuestions();
      setPublicQuestions(data);
    } catch (err) {
      console.error('Failed to load public questions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch moderator questions (in submission order)
  const fetchModeratorQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getModeratorQuestions();
      setAllModeratorQuestions(data);
    } catch (err) {
      console.error('Failed to load moderator questions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPublicQuestions();
    if (isModerator) {
      fetchModeratorQuestions();
    }
  }, [fetchPublicQuestions, fetchModeratorQuestions, isModerator]);

  // Handle secret keyword trigger: "StudentInclusion2026"
  const handleTriggerModerator = async (passkey: string) => {
    if (verifyPasskey(passkey)) {
      setIsModerator(true);
      localStorage.setItem('si_is_moderator', 'true');
      setActiveView('moderation');
      await fetchModeratorQuestions();
      setModeratorBannerNotice('Moderator Mode Activated: Teleported to Reviewer Portal');
      setTimeout(() => setModeratorBannerNotice(null), 5000);
    } else {
      alert('Invalid passkey.');
    }
  };

  const handleLogoutModerator = () => {
    setIsModerator(false);
    localStorage.removeItem('si_is_moderator');
    if (activeView === 'moderation') {
      setActiveView('submit');
    }
  };

  // Moderator actions
  const handleReplySubmit = async (id: string, reply: string) => {
    await replyToQuestion(id, reply, 'Student Inclusion Team');
    await fetchModeratorQuestions();
    await fetchPublicQuestions();
  };

  const handleDeleteQuestion = async (id: string) => {
    await deleteQuestion(id);
    await fetchModeratorQuestions();
    await fetchPublicQuestions();
  };

  return (
    <div className="min-h-screen bg-grid-pattern text-[#0D1527] flex flex-col justify-between font-sans selection:bg-[#0D1527] selection:text-white relative overflow-x-hidden">
      {/* Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        isModerator={isModerator}
        onLogoutModerator={handleLogoutModerator}
        publicCount={publicQuestions.length}
      />

      {/* Moderator Notification Toast */}
      {moderatorBannerNotice && (
        <div className="bg-[#0D1527] text-white text-xs font-bold text-center py-2.5 px-4 shadow-sm z-30">
          {moderatorBannerNotice}
        </div>
      )}

      {/* Main Content with Animated Transitions */}
      <main className="flex-1 flex flex-col justify-center min-h-0 relative">
        <AnimatePresence mode="wait">
          {activeView === 'submit' && (
            <motion.div
              key="submit-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="flex-1 flex flex-col justify-center"
            >
              <SubmitView
                onQuestionSubmitted={() => {
                  fetchPublicQuestions();
                  if (isModerator) fetchModeratorQuestions();
                }}
                onTriggerModerator={handleTriggerModerator}
                onNavigateToFeed={() => setActiveView('public_feed')}
                publicCount={publicQuestions.length}
              />
            </motion.div>
          )}

          {activeView === 'public_feed' && (
            <motion.div
              key="public-feed-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="flex-1 flex flex-col"
            >
              <PublicFeedView
                questions={publicQuestions}
                isLoading={isLoading}
                onRefresh={fetchPublicQuestions}
                onBackToSubmit={() => setActiveView('submit')}
              />
            </motion.div>
          )}

          {activeView === 'moderation' && isModerator && (
            <motion.div
              key="moderation-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="flex-1 flex flex-col"
            >
              <ModeratorView
                questions={allModeratorQuestions}
                isLoading={isLoading}
                onRefresh={fetchModeratorQuestions}
                onReplySubmit={handleReplySubmit}
                onDeleteQuestion={handleDeleteQuestion}
                onBackToFeed={() => setActiveView('public_feed')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer strictly matching reference picture:
          STUDENT INCLUSION · 2026 on left, YOUR VOICE BELONGS HERE. on right */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-6 text-[10px] sm:text-xs lg:text-sm font-black tracking-[0.18em] lg:tracking-[0.22em] text-stone-400 uppercase flex items-center justify-between z-20 shrink-0">
        <span>Student Inclusion · 2026</span>
        <span>Your voice belongs here.</span>
      </footer>
    </div>
  );
}
