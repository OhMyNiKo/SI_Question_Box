import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ThumbsUp,
  MessageSquare,
  ChevronDown,
  Sparkles,
  Flame,
  History,
  Send,
  ShieldCheck,
  Clock,
  User,
} from 'lucide-react';
import { QuestionItem, CommentItem, CommentSortMode } from '../types';
import {
  toggleQuestionLike,
  addComment,
  toggleCommentLike,
  getUserLikedQuestions,
  getUserLikedComments,
} from '../services/questionsService';

interface QuestionCardProps {
  question: QuestionItem;
  onQuestionUpdated?: (updated: QuestionItem) => void;
}

export function QuestionCard({ question, onQuestionUpdated }: QuestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sortMode, setSortMode] = useState<CommentSortMode>('latest');

  // Local card state
  const [qLikes, setQLikes] = useState<number>(question.likes || 0);
  const [isQLiked, setIsQLiked] = useState<boolean>(() =>
    getUserLikedQuestions().has(question.id)
  );

  const [comments, setComments] = useState<CommentItem[]>(question.comments || []);
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(() =>
    getUserLikedComments()
  );

  // New comment input state
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentAuthor, setNewCommentAuthor] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const commentsScrollRef = useRef<HTMLDivElement | null>(null);

  // Sync state if question prop changes
  useEffect(() => {
    setQLikes(question.likes || 0);
    setComments(question.comments || []);
  }, [question.likes, question.comments]);

  // Handle Question Like Toggle
  const handleToggleQuestionLike = async () => {
    const nextState = !isQLiked;
    setIsQLiked(nextState);
    const newCount = nextState ? qLikes + 1 : Math.max(0, qLikes - 1);
    setQLikes(newCount);

    try {
      await toggleQuestionLike(question.id, nextState);
      if (onQuestionUpdated) {
        onQuestionUpdated({
          ...question,
          likes: newCount,
          comments,
        });
      }
    } catch (err) {
      console.error('Failed to toggle question like:', err);
    }
  };

  // Cycle Sort Mode: Latest -> Hottest -> Oldest -> Latest
  const cycleSortMode = () => {
    setSortMode((prev) => {
      if (prev === 'latest') return 'hottest';
      if (prev === 'hottest') return 'oldest';
      return 'latest';
    });
  };

  // Sorted Comments based on active mode
  const sortedComments = useMemo(() => {
    const list = [...comments];
    if (sortMode === 'hottest') {
      return list.sort((a, b) => {
        const diff = (b.likes || 0) - (a.likes || 0);
        if (diff !== 0) return diff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
    if (sortMode === 'latest') {
      return list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    if (sortMode === 'oldest') {
      return list.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }
    return list;
  }, [comments, sortMode]);

  // Handle Comment Like Toggle
  const handleToggleCommentLike = async (commentId: string) => {
    const alreadyLiked = likedCommentIds.has(commentId);
    const nextState = !alreadyLiked;

    // Update local set
    setLikedCommentIds((prev) => {
      const next = new Set(prev);
      if (nextState) next.add(commentId);
      else next.delete(commentId);
      return next;
    });

    // Update comment like count
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const current = c.likes || 0;
          return {
            ...c,
            likes: nextState ? current + 1 : Math.max(0, current - 1),
          };
        }
        return c;
      })
    );

    try {
      await toggleCommentLike(question.id, commentId, nextState);
    } catch (err) {
      console.error('Failed to toggle comment like:', err);
    }
  };

  // Handle Add Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);
      const created = await addComment(
        question.id,
        newCommentText.trim(),
        newCommentAuthor.trim() || 'Student'
      );

      const updatedComments = [...comments, created];
      setComments(updatedComments);
      setNewCommentText('');
      setNewCommentAuthor('');

      if (onQuestionUpdated) {
        onQuestionUpdated({
          ...question,
          likes: qLikes,
          comments: updatedComments,
        });
      }

      // Scroll to bottom of comments container
      setTimeout(() => {
        if (commentsScrollRef.current) {
          commentsScrollRef.current.scrollTop = commentsScrollRef.current.scrollHeight;
        }
      }, 50);
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <motion.div
      layout
      id={`question-card-${question.id}`}
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="bg-white rounded-[26px] border-2 border-[#0D1527] shadow-[4px_4px_0px_#0D1527] hover:shadow-[6px_6px_0px_#0D1527] transition-shadow flex flex-col h-auto min-h-[420px] overflow-hidden"
    >
      {/* Header: Author + Timestamp */}
      <div className="px-4 py-2.5 bg-[#F8F6F0] border-b-2 border-[#0D1527] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5030]"></span>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#0D1527] truncate max-w-[130px]">
            {question.authorName || 'Student'}
          </span>
        </div>

        {/* Top-Right Timestamp: YYYY-MM-DD HH:mm:ss */}
        <div
          title="Submission Time (YYYY-MM-DD HH:mm:ss)"
          className="flex items-center gap-1 text-[10px] font-mono font-bold text-stone-500 bg-white px-2 py-0.5 rounded-md border border-stone-200 shrink-0"
        >
          <Clock className="w-3 h-3 text-stone-400" />
          <span>{question.createdAtFormatted}</span>
        </div>
      </div>

      {/* Main Chat Conversation Body */}
      <div className="p-4 flex-1 flex flex-col gap-3.5 overflow-y-auto max-h-[300px]">
        {/* 1. Student Question Chat Bubble */}
        <div className="flex flex-col items-start max-w-[96%]">
          <div className="text-[9px] font-black uppercase tracking-wider text-stone-400 mb-1 pl-1">
            Question
          </div>
          <div className="p-3.5 rounded-2xl rounded-tl-xs bg-[#F8F6F0] text-[#0D1527] text-xs sm:text-[13px] font-medium leading-relaxed border border-[#E7DFCE] break-words w-full">
            {question.content}
          </div>
        </div>

        {/* 2. Official Student Inclusion Reply Chat Bubble */}
        <div className="flex flex-col items-end max-w-[96%] ml-auto mt-auto pt-1">
          <div className="flex items-center gap-1 text-[10px] font-black tracking-wider text-[#FF5030] mb-1 pr-1 uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{question.repliedBy || 'Student Inclusion'}</span>
          </div>
          <div className="p-3.5 rounded-2xl rounded-tr-xs bg-[#EBF2FE] text-[#1E3A8A] text-xs sm:text-[13px] font-medium leading-relaxed border border-[#D6E4FD] break-words w-full shadow-2xs">
            {question.reply}
          </div>
          {question.repliedAtFormatted && (
            <div className="text-[9px] font-mono text-stone-400 mt-1 pr-1">
              Replied {question.repliedAtFormatted}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar: Like Button (Always visible with count) + Expand Comments Trigger */}
      <div className="px-4 py-2 bg-[#F8F6F0] border-t-2 border-[#0D1527] flex items-center justify-between gap-2 shrink-0">
        {/* Q&A Like Button: thumb-up icon, animated transition on click */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.86 }}
          whileHover={{ scale: 1.04 }}
          id={`like-btn-qa-${question.id}`}
          onClick={handleToggleQuestionLike}
          title={isQLiked ? 'Liked (Click to unlike)' : 'Like this Q&A'}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer border ${
            isQLiked
              ? 'bg-[#FFF0F3] text-[#FF2E63] border-[#FF2E63]/30 shadow-2xs'
              : 'bg-white text-stone-500 border-stone-200 hover:text-stone-700 hover:border-stone-300'
          }`}
        >
          <motion.div
            animate={
              isQLiked
                ? { scale: [1, 1.45, 1], rotate: [0, -15, 0] }
                : { scale: 1, rotate: 0 }
            }
            transition={{ duration: 0.3 }}
          >
            <ThumbsUp
              className={`w-3.5 h-3.5 transition-colors ${
                isQLiked ? 'text-[#FF2E63] fill-[#FF2E63]' : 'text-stone-400'
              }`}
            />
          </motion.div>

          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={qLikes}
              initial={{ y: -6, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 6, opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.16 }}
              className={`text-[11px] font-mono inline-block ${
                isQLiked ? 'text-[#FF2E63] font-black' : 'text-stone-600 font-bold'
              }`}
            >
              {qLikes}
            </motion.span>
          </AnimatePresence>
        </motion.button>

        {/* Expand/Collapse Comments Button */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.03 }}
          id={`expand-comments-btn-${question.id}`}
          onClick={() => setIsExpanded((prev) => !prev)}
          title={isExpanded ? 'Collapse comments' : 'Expand comments'}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
            isExpanded
              ? 'bg-[#0D1527] text-white border-[#0D1527]'
              : 'bg-white text-[#0D1527] border-stone-200 hover:border-[#0D1527]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={comments.length}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-[11px] font-mono"
            >
              {comments.length}
            </motion.span>
          </AnimatePresence>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
          </motion.div>
        </motion.button>
      </div>

      {/* Expanded Student Comments Drawer with Animated Height Accordion Transition */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key={`comments-drawer-${question.id}`}
            id={`comments-drawer-${question.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden bg-[#FAFAF9] border-t-2 border-[#0D1527] flex flex-col p-3 gap-2.5"
          >
            {/* Drawer Sub-Header: Comments Title + Interactive Changing Icon Button for Latest/Hottest/Oldest */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-600">
                  Student Comments
                </span>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={comments.length}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-stone-200 text-stone-700 rounded-md inline-block"
                  >
                    {comments.length}
                  </motion.span>
                </AnimatePresence>
              </div>

              {/* Interactive Changing Icon Button: ONLY ICON, NO WORDS, WITH ANIMATED TRANSITION */}
              <div className="flex items-center gap-1.5">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.85 }}
                  whileHover={{ scale: 1.08 }}
                  id={`sort-comments-btn-${question.id}`}
                  onClick={cycleSortMode}
                  title={`Sort: ${
                    sortMode === 'hottest'
                      ? 'Hottest (Most Likes)'
                      : sortMode === 'latest'
                      ? 'Latest (Newest First)'
                      : 'Oldest (First First)'
                  } — Click to switch`}
                  aria-label={`Sort comments by ${sortMode}`}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-[#0D1527]/20 hover:border-[#0D1527] text-[#0D1527] shadow-2xs hover:shadow-xs transition-colors cursor-pointer overflow-hidden"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={sortMode}
                      initial={{ rotate: -70, scale: 0.35, opacity: 0 }}
                      animate={{ rotate: 0, scale: 1, opacity: 1 }}
                      exit={{ rotate: 70, scale: 0.35, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                      {sortMode === 'hottest' && (
                        <Flame className="w-4 h-4 text-[#FF2E63] fill-[#FF2E63]" />
                      )}
                      {sortMode === 'latest' && (
                        <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                      )}
                      {sortMode === 'oldest' && (
                        <History className="w-4 h-4 text-stone-600" />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </motion.button>
              </div>
            </div>

            {/* Limited Space Scrollable Comments Container with animated reordering */}
            <div
              ref={commentsScrollRef}
              className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-transparent"
            >
              {sortedComments.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="py-6 text-center text-stone-400 text-xs italic"
                >
                  No comments yet. Share your voice below!
                </motion.div>
              ) : (
                <AnimatePresence initial={false}>
                  {sortedComments.map((comment) => {
                    const isLiked = likedCommentIds.has(comment.id);
                    return (
                      <motion.div
                        layout
                        key={comment.id}
                        id={`comment-item-${comment.id}`}
                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{
                          layout: { type: 'spring', damping: 26, stiffness: 320 },
                          duration: 0.2,
                        }}
                        className="p-2.5 rounded-xl bg-white border border-stone-200 text-xs flex flex-col gap-1 shadow-2xs"
                      >
                        <div className="flex items-center justify-between text-[10px] text-stone-400">
                          <span className="font-bold text-stone-700 truncate max-w-[120px]">
                            {comment.authorName || 'Student'}
                          </span>
                          <span className="font-mono text-[9px]">
                            {comment.createdAtFormatted.split(' ')[0]}
                          </span>
                        </div>

                        <p className="text-[#0D1527] font-medium leading-snug break-words">
                          {comment.content}
                        </p>

                        {/* Comment Footer: Like button (Thumb-up icon: grey -> pink-red with animated pop) */}
                        <div className="flex items-center justify-end mt-0.5">
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.85 }}
                            whileHover={{ scale: 1.05 }}
                            id={`like-comment-${comment.id}`}
                            onClick={() => handleToggleCommentLike(comment.id)}
                            title={isLiked ? 'Unlike' : 'Like comment'}
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] transition-colors cursor-pointer ${
                              isLiked
                                ? 'text-[#FF2E63] font-bold bg-[#FFF0F3]'
                                : 'text-stone-400 hover:text-stone-600'
                            }`}
                          >
                            <motion.div
                              animate={
                                isLiked
                                  ? { scale: [1, 1.45, 1], rotate: [0, -15, 0] }
                                  : { scale: 1, rotate: 0 }
                              }
                              transition={{ duration: 0.25 }}
                            >
                              <ThumbsUp
                                className={`w-3 h-3 transition-colors ${
                                  isLiked
                                    ? 'text-[#FF2E63] fill-[#FF2E63]'
                                    : 'text-stone-400'
                                }`}
                              />
                            </motion.div>
                            <AnimatePresence mode="popLayout" initial={false}>
                              <motion.span
                                key={comment.likes || 0}
                                initial={{ y: -5, opacity: 0, scale: 0.8 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                exit={{ y: 5, opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.15 }}
                                className="font-mono inline-block"
                              >
                                {comment.likes || 0}
                              </motion.span>
                            </AnimatePresence>
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Add Comment Input Form */}
            <form
              onSubmit={handleAddComment}
              className="flex flex-col gap-1.5 pt-1 border-t border-stone-200"
            >
              <div className="flex items-center gap-1.5">
                <div className="relative w-24 shrink-0">
                  <User className="w-3 h-3 text-stone-400 absolute left-2 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={15}
                    value={newCommentAuthor}
                    onChange={(e) => setNewCommentAuthor(e.target.value)}
                    placeholder="Name"
                    className="w-full pl-6 pr-1.5 py-1 text-[11px] bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-[#0D1527] font-medium placeholder:text-stone-400"
                  />
                </div>

                <div className="relative flex-1">
                  <input
                    type="text"
                    required
                    maxLength={200}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full pl-2.5 pr-8 py-1 text-[11px] bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-[#0D1527] font-medium placeholder:text-stone-400"
                  />
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.88 }}
                    whileHover={{ scale: 1.08 }}
                    disabled={!newCommentText.trim() || isSubmittingComment}
                    title="Post comment"
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-md bg-[#0D1527] text-white hover:bg-stone-800 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
