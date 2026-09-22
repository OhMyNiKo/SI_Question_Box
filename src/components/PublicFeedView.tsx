import { useState } from 'react';
import {
  MessageSquare,
  ArrowLeft,
  RotateCcw,
  Search,
  ShieldCheck,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { QuestionItem } from '../types';

interface PublicFeedViewProps {
  questions: QuestionItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onBackToSubmit: () => void;
}

export function PublicFeedView({
  questions,
  isLoading,
  onRefresh,
  onBackToSubmit,
}: PublicFeedViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredQuestions = questions.filter((q) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const matchContent = q.content.toLowerCase().includes(query);
    const matchReply = q.reply?.toLowerCase().includes(query) ?? false;
    return matchContent || matchReply;
  });

  return (
    <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 py-6 flex-1 flex flex-col z-10 relative">
      {/* Top Bar Navigation & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-5 border-b border-[#0D1527]/10">
        <div className="flex items-center gap-4">
          <button
            id="back-to-ask-btn"
            onClick={onBackToSubmit}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white hover:bg-stone-50 border-2 border-[#0D1527] text-[#0D1527] text-xs sm:text-sm font-black transition-all shadow-[2px_2px_0px_#0D1527] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Say It</span>
          </button>

          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-black text-[#0D1527] tracking-tight">
                Public Q&A Board
              </h2>
              <span className="text-xs px-3 py-0.5 rounded-full bg-[#FF8C73] text-white font-black shadow-xs">
                {questions.length} Answered
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
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="search-public-feed-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions or replies..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border-2 border-[#0D1527]/30 rounded-full focus:outline-none focus:border-[#0D1527] transition-colors placeholder:text-stone-400 font-medium"
            />
          </div>

          <button
            id="refresh-feed-btn"
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh Questions"
            className="p-2.5 rounded-full bg-white border-2 border-[#0D1527]/30 hover:border-[#0D1527] text-[#0D1527] transition-all cursor-pointer shrink-0 disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#FF5030]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid of Uniform Height Chat Boxes: 4 to 5 per row on desktop */}
      {filteredQuestions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[32px] border-2 border-[#0D1527] p-8 max-w-md mx-auto shadow-[6px_6px_0px_#0D1527]">
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
          <button
            onClick={onBackToSubmit}
            className="px-6 py-2.5 bg-[#0D1527] hover:bg-stone-800 text-white rounded-full text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
          >
            <span>Say It Anonymously</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          id="public-feed-grid"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
        >
          {filteredQuestions.map((q) => (
            <div
              key={q.id}
              id={`question-card-${q.id}`}
              className="bg-white rounded-[26px] border-2 border-[#0D1527] shadow-[4px_4px_0px_#0D1527] hover:shadow-[6px_6px_0px_#0D1527] hover:-translate-y-1 transition-all flex flex-col h-[410px] overflow-hidden"
            >
              {/* Header: Student Indicator & Exact Requested Top-Right Timestamp (年月日小时秒) */}
              <div className="px-4 py-2.5 bg-[#F8F6F0] border-b-2 border-[#0D1527] flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5030]"></span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#0D1527]">
                    Student
                  </span>
                </div>

                {/* Top-Right Timestamp: YYYY-MM-DD HH:mm:ss */}
                <div
                  title="Submission Time (YYYY-MM-DD HH:mm:ss)"
                  className="flex items-center gap-1 text-[10px] font-mono font-bold text-stone-500 bg-white px-2 py-0.5 rounded-md border border-stone-200 shrink-0"
                >
                  <Clock className="w-3 h-3 text-stone-400" />
                  <span>{q.createdAtFormatted}</span>
                </div>
              </div>

              {/* Chat Conversation Content */}
              <div className="p-4 flex-1 flex flex-col gap-3.5 overflow-y-auto">
                {/* 1. Student Question Chat Bubble */}
                <div className="flex flex-col items-start max-w-[96%]">
                  <div className="text-[9px] font-black uppercase tracking-wider text-stone-400 mb-1 pl-1">
                    Question
                  </div>
                  <div className="p-3.5 rounded-2xl rounded-tl-xs bg-[#F8F6F0] text-[#0D1527] text-xs sm:text-[13px] font-medium leading-relaxed border border-[#E7DFCE] break-words w-full">
                    {q.content}
                  </div>
                </div>

                {/* 2. Official Student Inclusion Reply Chat Bubble */}
                <div className="flex flex-col items-end max-w-[96%] ml-auto mt-auto pt-1">
                  <div className="flex items-center gap-1 text-[10px] font-black tracking-wider text-[#FF5030] mb-1 pr-1 uppercase">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{q.repliedBy || 'Student Inclusion'}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl rounded-tr-xs bg-[#EBF2FE] text-[#1E3A8A] text-xs sm:text-[13px] font-medium leading-relaxed border border-[#D6E4FD] break-words w-full shadow-2xs">
                    {q.reply}
                  </div>
                  {q.repliedAtFormatted && (
                    <div className="text-[9px] font-mono text-stone-400 mt-1 pr-1">
                      Replied {q.repliedAtFormatted}
                    </div>
                  )}
                </div>
              </div>

              {/* Minimal Card Footer */}
              <div className="px-4 py-2 bg-[#F8F6F0] border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500 shrink-0">
                <span className="font-semibold text-stone-600">Official Resolution</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
