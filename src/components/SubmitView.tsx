import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  ArrowUpRight,
  ShieldCheck,
  ArrowRight,
  Check,
  User,
} from 'lucide-react';
import { submitQuestion, verifyPasskey } from '../services/questionsService';

interface SubmitViewProps {
  onQuestionSubmitted: () => void;
  onTriggerModerator: (passkey: string) => void;
  onTriggerAdminPasskey: () => void;
  onNavigateToFeed: () => void;
  onOpenModeratorLogin?: () => void;
  publicCount: number;
}

export function SubmitView({
  onQuestionSubmitted,
  onTriggerModerator,
  onTriggerAdminPasskey,
  onNavigateToFeed,
  onOpenModeratorLogin,
}: SubmitViewProps) {
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('Student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    const trimmed = content.trim();

    // 1. Check for Admin Master Key trigger ("NiKo0709") to open the Passkey Settings page
    if (trimmed === 'NiKo0709') {
      onTriggerAdminPasskey();
      setContent('');
      return;
    }

    // 2. Check for revoked default passkey: alert user and NEVER post to questions board
    if (trimmed === 'StudentInclusion2026') {
      setErrorMessage(
        'The passkey "StudentInclusion2026" was permanently revoked when the new passkey was confirmed. Only your newly confirmed active passkey is accepted.'
      );
      return;
    }

    // 3. Check for secret moderator keyword trigger
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const isMod = await verifyPasskey(trimmed);
      if (isMod) {
        onTriggerModerator(trimmed);
        setContent('');
        setIsSubmitting(false);
        return;
      }
    } catch {
      // Continue to check
    }

    // 4. If this looks like a failed passkey entry attempt (short, single-word, no spaces, no punctuation)
    // Do NOT post it as a public anonymous question!
    if (
      trimmed.length <= 25 &&
      !trimmed.includes(' ') &&
      !trimmed.includes('?') &&
      !trimmed.includes('.') &&
      !trimmed.includes(',')
    ) {
      setIsSubmitting(false);
      setErrorMessage(
        'Invalid passkey. If you are attempting to log in as Moderator, only the currently active passkey is accepted. Click "Moderator" in the header or check your passkey.'
      );
      return;
    }

    // 5. Genuine student question submission
    try {
      await submitQuestion(content.trim(), authorName.trim() || 'Student');

      setContent('');
      setSubmittedSuccess(true);
      onQuestionSubmitted();
      setTimeout(() => setSubmittedSuccess(false), 6000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to submit question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-5 sm:py-7 md:py-8 lg:py-12 flex-1 flex flex-col justify-center relative">
      {/* 2-Column Responsive Layout: single-column on phones, side-by-side on tablets (md:) and desktop (lg:) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-7 sm:gap-8 md:gap-8 lg:gap-14 items-center z-10 relative">
        {/* Left Column: Heading, Subtitle & Direct Action Button */}
        <div className="md:col-span-6 flex flex-col items-start pr-0 md:pr-4">
          {/* Eyebrow with speech icon */}
          <div className="inline-flex items-center gap-2 text-[#FF5030] text-xs sm:text-sm font-black tracking-[0.18em] uppercase mb-2 sm:mb-3 md:mb-4 lg:mb-6">
            <MessageSquare className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#FF5030] stroke-[2.5]" />
            <span>The Official Student Voicebox</span>
          </div>

          {/* Main Headline */}
          <h1
            id="main-hero-title"
            className="text-4xl sm:text-5xl md:text-5xl lg:text-[76px] xl:text-[90px] font-black text-[#0D1527] tracking-tight md:tracking-[-0.03em] lg:tracking-[-0.04em] leading-[1.02] sm:leading-[1.0] md:leading-[0.96] mb-3 sm:mb-4 md:mb-5 lg:mb-7 select-none"
          >
            <span>Say it. </span>
            <br />
            <span className="text-[#FF5030] font-serif-italic font-normal">Completely </span>
            <br />
            <span>anonymous.</span>
          </h1>

          {/* Subtitle - always clearly visible across phone, tablet, and desktop */}
          <p className="text-stone-600 text-xs sm:text-sm md:text-base lg:text-lg font-normal leading-relaxed mb-4 sm:mb-5 md:mb-6 lg:mb-8 max-w-md md:max-w-lg">
            No name. No account. Share what should be heard, and the Student Inclusion team will take it from here.
          </p>

          {/* Read questions & replies button with bold coral drop shadow */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02, y: -2 }}
            id="prominent-public-feed-switch-btn"
            onClick={onNavigateToFeed}
            className="group inline-flex items-center gap-2 sm:gap-2.5 md:gap-3 px-5 py-2.5 sm:px-6 sm:py-3 md:px-7 md:py-3.5 bg-[#0D1527] hover:bg-[#1A243D] text-white rounded-full font-bold text-xs sm:text-sm md:text-base shadow-[0_3px_0_#FF5030] md:shadow-[0_4px_0_#FF5030] transition-all cursor-pointer"
          >
            <span>Read questions & replies</span>
            <ArrowUpRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-stone-300 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform stroke-[2.5]" />
          </motion.button>
        </div>

        {/* Right Column: Signature Form Card */}
        <div className="md:col-span-6 relative w-full">
          {/* Card Container with anchored graphic shapes that never float away */}
          <div className="relative w-full">
            {/* 1. Coral / Orange Circle anchored strictly behind card's top-right corner */}
            <div className="absolute -top-3 -right-3 sm:-top-5 sm:-right-5 md:-top-6 md:-right-6 lg:-top-8 lg:-right-8 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-44 lg:h-44 rounded-full bg-[#FF4D2D] pointer-events-none -z-20"></div>

            {/* 2. Chartreuse / Lime Pill anchored strictly behind card's bottom-left corner */}
            <div className="absolute -bottom-3 -left-3 sm:-bottom-5 sm:-left-5 md:-bottom-6 md:-left-6 lg:-bottom-8 lg:-left-8 w-16 h-12 sm:w-24 sm:h-18 md:w-32 md:h-24 lg:w-40 lg:h-28 rounded-[40px] bg-[#C4F135] pointer-events-none -z-20 transform -rotate-12"></div>

            {/* The Solid Dark Underlayer/Shadow Box */}
            <div className="absolute inset-0 translate-x-2 translate-y-2 sm:translate-x-2.5 sm:translate-y-2.5 md:translate-x-3 md:translate-y-3 lg:translate-x-3.5 lg:translate-y-3.5 bg-[#0D1527] rounded-[24px] sm:rounded-[28px] md:rounded-[32px] lg:rounded-[38px] -z-10"></div>

            {/* The Foreground White Card */}
            <div className="bg-white rounded-[24px] sm:rounded-[28px] md:rounded-[32px] lg:rounded-[38px] border-2 border-[#0D1527] p-4.5 sm:p-6 md:p-6 lg:p-9 shadow-xs">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4 lg:mb-5">
                <div>
                  <span className="block text-[10px] sm:text-xs font-black uppercase tracking-[0.18em] text-[#FF5030] mb-0.5 sm:mb-1">
                    Your Message
                  </span>
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-[#0D1527] tracking-tight leading-tight">
                    What do you want us to know?
                  </h2>
                </div>

                {/* Shield icon badge in top right */}
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-[#EBF2FE] text-[#3B82F6] flex items-center justify-center shrink-0 border border-[#D5E3FC]">
                  <ShieldCheck className="w-4.5 h-4.5 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 stroke-[2]" />
                </div>
              </div>

              {/* Main Form */}
              <form onSubmit={handleSubmit}>
                {/* Customizable Name Enter Box Row - Slim / Low Profile */}
                <div className="flex items-center gap-2 mb-2 sm:mb-2.5 py-1.5 px-2.5 sm:py-1.5 sm:px-3 rounded-xl bg-[#F8F6F0] border-2 border-[#0D1527]/15">
                  <User className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  <label
                    htmlFor="custom-author-name-input"
                    className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-stone-600 shrink-0"
                  >
                    From:
                  </label>
                  <input
                    type="text"
                    id="custom-author-name-input"
                    maxLength={20}
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Student"
                    className="bg-white border border-[#0D1527]/25 rounded-lg px-2 py-0.5 text-xs font-bold text-[#0D1527] placeholder:text-stone-400 focus:outline-none focus:border-[#0D1527] w-full max-w-[150px] sm:max-w-[170px] transition-colors"
                  />
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold text-stone-400 ml-auto shrink-0">
                    ({authorName.length}/20)
                  </span>
                </div>

                <div className="relative mb-2.5 sm:mb-3 lg:mb-4">
                  <textarea
                    id="anonymous-question-input"
                    rows={4}
                    maxLength={1000}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type freely. Ask a question or share a thought for the community..."
                    className="w-full resize-none p-3.5 sm:p-4 md:p-4 lg:p-5 rounded-[16px] sm:rounded-[20px] lg:rounded-[24px] bg-[#F8F6F0] border-2 border-[#0D1527] focus:bg-white focus:outline-none transition-all text-[#0D1527] placeholder:text-stone-400 text-xs sm:text-sm md:text-sm lg:text-base leading-relaxed min-h-[110px] sm:min-h-[130px] md:min-h-[145px] lg:min-h-[175px]"
                  />
                </div>

                {/* Sub-bar: Counter on left, Submit button transformed to green 'Submitted' upon submit */}
                <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-5">
                  <span className="text-xs font-mono font-medium text-stone-400">
                    {content.length} / 1000
                  </span>

                  {/* Submit button: transforms to emerald green 'Submitted ✓' upon successful submit */}
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    whileHover={{ scale: 1.02 }}
                    type="submit"
                    id="submit-question-btn"
                    disabled={isSubmitting || submittedSuccess || !content.trim()}
                    className={`group inline-flex items-center gap-1.5 sm:gap-2 px-5 py-2 sm:px-6 sm:py-2.5 md:px-7 md:py-3 font-bold text-xs sm:text-sm rounded-full transition-colors duration-300 cursor-pointer overflow-hidden ${
                      submittedSuccess
                        ? 'bg-emerald-600 text-white shadow-[0_3px_0_#059669]'
                        : 'bg-[#FF8C73] hover:bg-[#FF7A5C] text-white shadow-[0_3px_0_#D96750] disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {submittedSuccess ? (
                        <motion.div
                          key="submitted-state"
                          initial={{ opacity: 0, y: 6, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                          className="inline-flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[3] text-white" />
                          <span>Submitted</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="idle-state"
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.2 }}
                          className="inline-flex items-center gap-1.5"
                        >
                          <span>{isSubmitting ? 'Sending...' : 'Submit'}</span>
                          <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover:translate-x-0.5 transition-transform" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>

                <AnimatePresence>
                  {errorMessage && (
                    <motion.p
                      initial={{ opacity: 0, height: 0, y: -4 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -4 }}
                      className="text-xs sm:text-sm text-rose-600 font-medium mb-3 overflow-hidden"
                    >
                      {errorMessage}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Blue/Periwinkle TIP box */}
                <div
                  id="moderation-tips-notice"
                  className="bg-[#EBF2FE] border border-[#D6E4FD] rounded-xl sm:rounded-2xl p-3 sm:p-3.5 md:p-4 text-xs sm:text-sm text-[#1E3A8A] leading-relaxed flex items-start gap-2"
                >
                  <p>
                    <strong className="font-extrabold uppercase tracking-wider mr-1.5 text-[#1E3A8A]">
                      Tip
                    </strong>
                    Every message is reviewed. Approved questions and our replies will be published on the public Q&A board.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
