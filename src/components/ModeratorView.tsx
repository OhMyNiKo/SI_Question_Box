import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  X,
  Send,
  Trash2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  RotateCcw,
  Search,
  Columns2,
  Rows,
} from 'lucide-react';
import { QuestionItem } from '../types';

interface ModeratorViewProps {
  questions: QuestionItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onReplySubmit: (id: string, reply: string) => Promise<void>;
  onDeleteQuestion: (id: string) => Promise<void>;
  onBackToFeed: () => void;
}

export function ModeratorView({
  questions,
  isLoading,
  onRefresh,
  onReplySubmit,
  onDeleteQuestion,
  onBackToFeed,
}: ModeratorViewProps) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [submittingIds, setSubmittingIds] = useState<Record<string, boolean>>({});
  const [successNotices, setSuccessNotices] = useState<Record<string, string>>({});

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<QuestionItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter: 'all', 'pending', 'approved'
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('all');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Layout mode: split (two columns, one at left and one at right) vs single column
  const [isSplitLayout, setIsSplitLayout] = useState(false);

  const handleDraftChange = (id: string, value: string) => {
    setDrafts((prev) => ({ ...prev, [id]: value }));
  };

  const handleReply = async (id: string) => {
    const currentQuestion = questions.find((q) => q.id === id);
    const textToSubmit = drafts[id] !== undefined ? drafts[id] : currentQuestion?.reply || '';

    if (!textToSubmit.trim()) return;

    setSubmittingIds((prev) => ({ ...prev, [id]: true }));
    try {
      await onReplySubmit(id, textToSubmit.trim());
      setSuccessNotices((prev) => ({ ...prev, [id]: 'Reply published to Public Board!' }));
      setTimeout(() => {
        setSuccessNotices((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }, 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDeleteQuestion(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Sort submissions: LATEST TO OLDEST, from top to bottom
  const sortedAndFilteredQuestions = useMemo(() => {
    const sorted = [...questions].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeB - timeA; // Latest first (newest at top, oldest at bottom)
    });

    const term = searchQuery.trim().toLowerCase();

    return sorted.filter((q) => {
      // Status tab filter
      if (statusFilter === 'pending' && q.status !== 'pending') return false;
      if (statusFilter === 'approved' && q.status !== 'approved') return false;

      // Search query filter
      if (term) {
        const matchesContent = q.content.toLowerCase().includes(term);
        const matchesReply = q.reply ? q.reply.toLowerCase().includes(term) : false;
        const matchesDate = q.createdAtFormatted ? q.createdAtFormatted.toLowerCase().includes(term) : false;
        return matchesContent || matchesReply || matchesDate;
      }

      return true;
    });
  }, [questions, statusFilter, searchQuery]);

  const pendingCount = questions.filter((q) => q.status === 'pending').length;
  const approvedCount = questions.filter((q) => q.status === 'approved').length;

  return (
    <div
      className={`w-full mx-auto px-4 sm:px-6 md:px-10 py-6 flex-1 flex flex-col z-10 relative transition-all duration-300 ${
        isSplitLayout ? 'max-w-7xl' : 'max-w-4xl'
      }`}
    >
      {/* Top Banner matching reference style */}
      <div className="bg-white rounded-[28px] border-2 border-[#0D1527] p-5 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[4px_4px_0px_#0D1527]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0D1527] text-white flex items-center justify-center shrink-0 font-black shadow-xs">
            <ShieldAlert className="w-5 h-5 text-[#FF5030]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-[#0D1527] tracking-tight">
                Reviewer Portal
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#FF8C73] text-white px-2 py-0.5 rounded-full">
                Staff Mode
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5 font-medium">
              Sorted newest to oldest. Type reply to publish publicly or click (X) to delete.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {/* Split / 2-Columns Layout Toggle Button */}
          <button
            id="toggle-moderator-layout-btn"
            onClick={() => setIsSplitLayout((prev) => !prev)}
            title={isSplitLayout ? 'Switch to single column' : 'Split into 2 columns (left and right)'}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 border-[#0D1527] text-xs font-bold transition-all shadow-[2px_2px_0px_#0D1527] cursor-pointer ${
              isSplitLayout
                ? 'bg-[#FF8C73] text-white hover:bg-[#FF7A5C]'
                : 'bg-white hover:bg-stone-50 text-[#0D1527]'
            }`}
          >
            {isSplitLayout ? (
              <>
                <Rows className="w-3.5 h-3.5" />
                <span>Single Column</span>
              </>
            ) : (
              <>
                <Columns2 className="w-3.5 h-3.5" />
                <span>Split 2-Columns (Left & Right)</span>
              </>
            )}
          </button>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-stone-50 border-2 border-[#0D1527]/30 text-[#0D1527] text-xs font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#FF5030]' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            id="moderator-back-to-public-btn"
            onClick={onBackToFeed}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0D1527] hover:bg-stone-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit to Feed</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Filter Controls Row */}
      <div className="bg-[#F8F6F0] rounded-[24px] border-2 border-[#0D1527] p-3.5 mb-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-[3px_3px_0px_#0D1527]">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            id="moderator-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search submissions by content, reply, or timestamp..."
            className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-white border-2 border-[#0D1527]/25 rounded-full focus:outline-none focus:border-[#0D1527] transition-colors placeholder:text-stone-400 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#0D1527] p-0.5 cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-[#0D1527] text-white shadow-xs'
                : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            All Submissions ({questions.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'pending'
                ? 'bg-[#FF5030] text-white shadow-xs'
                : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'approved'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            Answered ({approvedCount})
          </button>
        </div>
      </div>

      {/* Submissions Count Indicator */}
      <div className="flex items-center justify-between text-xs text-stone-500 font-medium px-2 mb-3">
        <span>
          Showing <strong>{sortedAndFilteredQuestions.length}</strong> of {questions.length} submissions (Newest first)
        </span>
        {isSplitLayout && (
          <span className="text-[#FF5030] font-bold hidden sm:inline">
            ● 2-Columns Layout Active (Left & Right)
          </span>
        )}
      </div>

      {/* Questions List / Grid */}
      {sortedAndFilteredQuestions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[28px] border-2 border-[#0D1527] p-8 text-stone-500 text-sm shadow-[4px_4px_0px_#0D1527]">
          {searchQuery ? (
            <>
              <p className="font-bold text-[#0D1527] mb-1">No matching submissions found</p>
              <p className="text-xs">Try adjusting your search keywords or clear the filter.</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 px-4 py-1.5 bg-[#0D1527] text-white text-xs font-bold rounded-full cursor-pointer"
              >
                Clear Search
              </button>
            </>
          ) : (
            'No questions in this filter tab.'
          )}
        </div>
      ) : (
        <div
          className={
            isSplitLayout
              ? 'grid grid-cols-1 md:grid-cols-2 gap-5 items-start'
              : 'space-y-5'
          }
        >
          {sortedAndFilteredQuestions.map((q, index) => {
            const currentDraft = drafts[q.id] !== undefined ? drafts[q.id] : q.reply || '';
            const isSubmitting = submittingIds[q.id] || false;
            const successMsg = successNotices[q.id];

            return (
              <div
                key={q.id}
                id={`moderator-card-${q.id}`}
                className="bg-white rounded-[26px] border-2 border-[#0D1527] shadow-[4px_4px_0px_#0D1527] overflow-hidden transition-all flex flex-col justify-between"
              >
                {/* Header: Sequence Number, Timestamp, Status & Delete 'X' Button */}
                <div className="px-4 sm:px-5 py-3 bg-[#F8F6F0] border-b-2 border-[#0D1527] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-[#0D1527] bg-white px-2.5 py-0.5 rounded border border-stone-300">
                      #{index + 1}
                    </span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                        q.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {q.status === 'approved' ? 'Published' : 'Pending Review'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-stone-500 bg-white px-2 py-0.5 rounded-md border border-stone-200">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{q.createdAtFormatted}</span>
                    </div>

                    {/* Delete Question Cross Button (X) */}
                    <button
                      id={`delete-question-btn-${q.id}`}
                      onClick={() => setDeleteTarget(q)}
                      title="Delete question permanently"
                      className="w-7 h-7 rounded-full bg-white border border-stone-300 text-stone-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-wider text-stone-400 mb-1.5">
                      <span>
                        Message from:{' '}
                        <strong className="text-[#0D1527] normal-case font-bold">
                          {q.authorName || 'Student'}
                        </strong>
                      </span>
                    </div>
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F8F6F0] text-[#0D1527] text-sm leading-relaxed border border-[#E7DFCE] font-medium">
                      {q.content}
                    </div>
                  </div>

                  {/* Reply Input Box */}
                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor={`reply-input-${q.id}`}
                        className="text-[10px] uppercase font-black tracking-wider text-[#FF5030]"
                      >
                        Official Student Inclusion Reply:
                      </label>
                      {q.status === 'approved' && (
                        <span className="text-[10px] sm:text-[11px] text-emerald-700 font-bold">
                          ● Live on Public Board
                        </span>
                      )}
                    </div>

                    <textarea
                      id={`reply-input-${q.id}`}
                      rows={3}
                      value={currentDraft}
                      onChange={(e) => handleDraftChange(q.id, e.target.value)}
                      placeholder="Type official verified answer here to publish to the Public Feed..."
                      className="w-full resize-none p-3 text-xs sm:text-sm rounded-xl bg-white border-2 border-[#0D1527]/30 focus:border-[#0D1527] focus:outline-none transition-all placeholder:text-stone-400 font-medium"
                    />

                    <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                      {successMsg ? (
                        <span className="text-xs font-bold text-emerald-700">{successMsg}</span>
                      ) : (
                        <span className="text-[10px] sm:text-[11px] text-stone-400 font-medium">
                          Publishes directly to public board.
                        </span>
                      )}

                      <button
                        id={`submit-reply-btn-${q.id}`}
                        onClick={() => handleReply(q.id)}
                        disabled={isSubmitting || !currentDraft.trim()}
                        className="px-4 py-2 bg-[#0D1527] hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-bold rounded-full flex items-center gap-1.5 transition-colors cursor-pointer ml-auto"
                      >
                        <Send className="w-3.5 h-3.5 text-[#FF8C73]" />
                        <span>
                          {isSubmitting
                            ? 'Publishing...'
                            : q.status === 'approved'
                            ? 'Update Reply'
                            : 'Publish Reply'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-[32px] max-w-md w-full p-6 sm:p-7 border-2 border-[#0D1527] shadow-[8px_8px_0px_#0D1527] animate-scaleIn">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-black text-[#0D1527] mb-2 tracking-tight">
              Permanently Delete Question?
            </h3>

            <p className="text-xs sm:text-sm text-stone-600 mb-4 leading-relaxed font-medium">
              Are you sure you want to delete this question? This action cannot be undone.
            </p>

            <div className="p-3.5 bg-[#F8F6F0] rounded-2xl text-xs text-stone-700 mb-6 border border-[#E7DFCE] line-clamp-3 italic font-medium">
              "{deleteTarget.content}"
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-5 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-modal-btn"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Deleting...' : 'Yes, Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
