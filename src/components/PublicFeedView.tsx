import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  ArrowLeft,
  RotateCcw,
  Search,
  ArrowUpRight,
} from 'lucide-react';
import { QuestionItem } from '../types';
import { QuestionCard } from './QuestionCard';
import {
  smartSearchQuestions,
  filterAndRankQuestions,
} from '../services/questionsService';

interface PublicFeedViewProps {
  questions: QuestionItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onBackToSubmit: () => void;
  onQuestionUpdated?: (updated: QuestionItem) => void;
}

export function PublicFeedView({
  questions,
  isLoading,
  onRefresh,
  onBackToSubmit,
  onQuestionUpdated,
}: PublicFeedViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [aiMatchedIds, setAiMatchedIds] = useState<string[] | null>(null);

  // Debounced AI smart semantic search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setAiMatchedIds(null);
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      try {
        const ids = await smartSearchQuestions(searchQuery, questions);
        if (active) {
          setAiMatchedIds(ids);
        }
      } catch (err) {
        console.warn('Smart AI search query note:', err);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery, questions]);

  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return questions;

    // 1. Local instant ranked results supporting multi-word and quoted phrases
    const localRanked = filterAndRankQuestions(questions, searchQuery);

    // 2. If smart AI matches exist, prioritize them and combine results
    if (aiMatchedIds !== null) {
      const aiSet = new Set(aiMatchedIds);
      const orderedResults: QuestionItem[] = [];

      // Ranked semantic matches first
      for (const id of aiMatchedIds) {
        const item = questions.find((q) => q.id === id);
        if (item) orderedResults.push(item);
      }

      // Any local phrase/word matches not already captured
      for (const q of localRanked) {
        if (!aiSet.has(q.id)) {
          orderedResults.push(q);
        }
      }

      return orderedResults;
    }

    // Instant local fallback while AI search query completes
    return localRanked;
  }, [questions, searchQuery, aiMatchedIds]);

  return (
    <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 py-6 flex-1 flex flex-col z-10 relative">
      {/* Top Bar Navigation & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-5 border-b border-[#0D1527]/10">
        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.03, y: -1 }}
            id="back-to-ask-btn"
            onClick={onBackToSubmit}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white hover:bg-stone-50 border-2 border-[#0D1527] text-[#0D1527] text-xs sm:text-sm font-black transition-all shadow-[2px_2px_0px_#0D1527] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Say It</span>
          </motion.button>

          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-black text-[#0D1527] tracking-tight">
                Public Q&A Board
              </h2>
              <span className="text-xs px-3 py-0.5 rounded-full bg-[#FF8C73] text-white font-black shadow-xs inline-flex items-center">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={questions.length}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="mr-1"
                  >
                    {questions.length}
                  </motion.span>
                </AnimatePresence>
                <span>Answered</span>
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5 font-medium">
              Verified student voices & official Student Inclusion resolutions
            </p>
          </div>
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
            <input
              type="text"
              id="search-public-feed-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions or replies..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border-2 border-[#0D1527]/30 rounded-full focus:outline-none focus:border-[#0D1527] transition-all placeholder:text-stone-400 font-medium shadow-2xs focus:shadow-xs"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.9, rotate: 180 }}
            whileHover={{ scale: 1.06 }}
            id="refresh-feed-btn"
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh Questions"
            className="p-2.5 rounded-full bg-white border-2 border-[#0D1527]/30 hover:border-[#0D1527] text-[#0D1527] transition-all cursor-pointer shrink-0 disabled:opacity-50 shadow-2xs"
          >
            <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#FF5030]' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Grid of Uniform Height Chat Boxes: 4 to 5 per row on desktop */}
      <AnimatePresence mode="wait">
        {filteredQuestions.length === 0 ? (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="text-center py-20 bg-white rounded-[32px] border-2 border-[#0D1527] p-8 max-w-md mx-auto shadow-[6px_6px_0px_#0D1527]"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#F8F6F0] text-[#FF5030] flex items-center justify-center mx-auto mb-3 border border-stone-200">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#0D1527] mb-1">
              {searchQuery ? 'No matching discussions found' : 'No answered questions yet'}
            </h3>
            <p className="text-xs text-stone-500 mb-5">
              {searchQuery
                ? 'Try searching with different keywords.'
                : 'Submit an anonymous question to begin the dialogue!'}
            </p>
            <motion.button
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.04 }}
              onClick={onBackToSubmit}
              className="px-6 py-2.5 bg-[#0D1527] hover:bg-stone-800 text-white rounded-full text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
            >
              <span>Say It Anonymously</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            layout
            key="grid-container"
            id="public-feed-grid"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 items-start"
          >
            <AnimatePresence>
              {filteredQuestions.map((q) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  onQuestionUpdated={onQuestionUpdated}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

