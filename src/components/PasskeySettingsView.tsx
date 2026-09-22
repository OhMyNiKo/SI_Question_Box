import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  ArrowLeft,
  Lock,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  Info,
} from 'lucide-react';
import {
  ADMIN_PASSKEY,
  getLocalModeratorPasskey,
  fetchCurrentModeratorPasskey,
  updateModeratorPasskey,
} from '../services/questionsService';

interface PasskeySettingsViewProps {
  onBackToSubmit: () => void;
  onNavigateToModeration: () => void;
  initialAdminAuth?: boolean;
}

export function PasskeySettingsView({
  onBackToSubmit,
  onNavigateToModeration,
  initialAdminAuth = false,
}: PasskeySettingsViewProps) {
  // Authentication gate for this page
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(initialAdminAuth);
  const [enteredAdminKey, setEnteredAdminKey] = useState('');
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);

  // Moderator passkey state
  const [currentPasskey, setCurrentPasskey] = useState<string>(getLocalModeratorPasskey());
  const [isPasskeyVisible, setIsPasskeyVisible] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  // Change passkey form
  const [newPasskey, setNewPasskey] = useState('');
  const [confirmPasskey, setConfirmPasskey] = useState('');
  const [isNewPasskeyVisible, setIsNewPasskeyVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Fetch verified passkey from server once authenticated
  useEffect(() => {
    if (initialAdminAuth) {
      setIsAdminAuthenticated(true);
    }
  }, [initialAdminAuth]);

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchCurrentModeratorPasskey(ADMIN_PASSKEY).then((key) => {
        if (key) setCurrentPasskey(key);
      });
    }
  }, [isAdminAuthenticated]);

  // Handle Admin Login submission
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredAdminKey.trim() === ADMIN_PASSKEY) {
      setIsAdminAuthenticated(true);
      setAdminAuthError(null);
      setEnteredAdminKey('');
    } else {
      setAdminAuthError('Invalid Admin Passkey. Please enter "NiKo0709" to access this page.');
    }
  };

  // Copy current passkey to clipboard
  const handleCopyPasskey = async () => {
    try {
      await navigator.clipboard.writeText(currentPasskey);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Update Moderator Passkey
  const handleUpdatePasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const trimmedNew = newPasskey.trim();
    const trimmedConfirm = confirmPasskey.trim();

    if (!trimmedNew) {
      setFeedback({ type: 'error', message: 'New passkey cannot be empty.' });
      return;
    }

    if (trimmedNew.length < 3) {
      setFeedback({
        type: 'error',
        message: 'Passkey is too short. Please use at least 3 characters.',
      });
      return;
    }

    if (trimmedNew !== trimmedConfirm) {
      setFeedback({
        type: 'error',
        message: 'Passkeys do not match. Please verify the confirmation field.',
      });
      return;
    }

    if (trimmedNew === currentPasskey) {
      setFeedback({
        type: 'error',
        message: 'The new passkey is identical to the current passkey.',
      });
      return;
    }

    try {
      setIsUpdating(true);
      const res = await updateModeratorPasskey(ADMIN_PASSKEY, trimmedNew);

      if (res.success) {
        setCurrentPasskey(res.updatedPasskey);
        setNewPasskey('');
        setConfirmPasskey('');
        setFeedback({
          type: 'success',
          message: `Success! The moderator passkey has been securely updated to "${res.updatedPasskey}".`,
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to update passkey. Please try again.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'A network error occurred while updating passkey.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 flex-1 flex flex-col justify-center">
      {/* Top back navigation button */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBackToSubmit}
          className="inline-flex items-center gap-2 text-stone-600 hover:text-[#0D1527] font-semibold text-xs sm:text-sm tracking-wide transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </button>

        {isAdminAuthenticated && (
          <button
            onClick={() => setIsAdminAuthenticated(false)}
            className="text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
          >
            Lock Security Console
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!isAdminAuthenticated ? (
          /* =========================================================================
             SCREEN 1: Admin Passkey Gate ("NiKo0709")
             ========================================================================= */
          <motion.div
            key="admin-gate"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="bg-white border-2 border-[#0D1527] shadow-[6px_6px_0px_#0D1527] p-6 sm:p-8 md:p-10 max-w-lg mx-auto w-full"
          >
            <div className="w-12 h-12 bg-amber-50 border-2 border-amber-300 rounded-none flex items-center justify-center mb-5 text-amber-800 shadow-[3px_3px_0px_#f59e0b]">
              <Lock className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div className="mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF5030] block mb-1">
                Restricted Administration
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0D1527] tracking-tight">
                Master Security Access
              </h2>
              <p className="text-stone-600 text-xs sm:text-sm mt-2 leading-relaxed">
                This console allows modifying the moderator portal passkey. To access this page,
                please enter the master administration passkey.
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Admin Passkey
                </label>
                <input
                  type="password"
                  id="admin-master-key-input"
                  value={enteredAdminKey}
                  onChange={(e) => {
                    setEnteredAdminKey(e.target.value);
                    if (adminAuthError) setAdminAuthError(null);
                  }}
                  placeholder="Enter NiKo0709..."
                  autoFocus
                  className="w-full px-4 py-3 bg-[#FAF8F5] border-2 border-[#0D1527] text-[#0D1527] font-mono text-sm placeholder:text-stone-400 focus:outline-none focus:ring-0 focus:border-[#FF5030] transition-colors"
                />
              </div>

              {adminAuthError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{adminAuthError}</span>
                </div>
              )}

              <button
                type="submit"
                id="admin-auth-submit-btn"
                className="w-full py-3 px-5 bg-[#0D1527] hover:bg-[#1a2942] active:bg-black text-white font-bold text-sm tracking-wider uppercase transition-colors shadow-[4px_4px_0px_#FF5030] cursor-pointer"
              >
                Authenticate & Unlock
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-stone-200 text-stone-500 text-[11px] flex items-center gap-2">
              <Info className="w-3.5 h-3.5 shrink-0 text-stone-400" />
              <span>Required master access passkey: <code className="font-mono font-bold text-stone-700">NiKo0709</code></span>
            </div>
          </motion.div>
        ) : (
          /* =========================================================================
             SCREEN 2: Passkey Management Dashboard
             ========================================================================= */
          <motion.div
            key="passkey-dashboard"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Header Banner */}
            <div className="bg-[#0D1527] text-white p-6 sm:p-7 border-2 border-[#0D1527] shadow-[6px_6px_0px_#FF5030] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-[#FF5030] text-xs font-black tracking-[0.2em] uppercase mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Security Console</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Moderator Passkey Manager
                </h1>
                <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-lg">
                  Manage the passkey required to access the Moderator Reviewer Portal.
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Admin Authorized (NiKo0709)
                </span>
              </div>
            </div>

            {/* Current Passkey Card */}
            <div className="bg-white border-2 border-[#0D1527] shadow-[6px_6px_0px_#0D1527] p-6 sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-[0.16em] text-stone-500">
                    Active Authentication Secret
                  </span>
                  <h2 className="text-lg font-black text-[#0D1527] tracking-tight">
                    Current Moderator Passkey
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPasskeyVisible(!isPasskeyVisible)}
                    className="p-2 border border-stone-300 hover:border-[#0D1527] text-stone-600 hover:text-[#0D1527] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title={isPasskeyVisible ? 'Hide passkey' : 'Reveal passkey'}
                  >
                    {isPasskeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>{isPasskeyVisible ? 'Hide' : 'Reveal'}</span>
                  </button>

                  <button
                    onClick={handleCopyPasskey}
                    id="copy-current-passkey-btn"
                    className="p-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-[#0D1527] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Copy passkey to clipboard"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Passkey display box */}
              <div className="bg-[#FAF8F5] border-2 border-dashed border-stone-300 p-4 sm:p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <KeyRound className="w-5 h-5 text-[#FF5030] shrink-0" />
                  <div className="font-mono text-base sm:text-xl font-bold tracking-wider text-[#0D1527] select-all">
                    {isPasskeyVisible ? currentPasskey : '•'.repeat(Math.max(currentPasskey.length, 12))}
                  </div>
                </div>

                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1">
                  Enforced
                </span>
              </div>

              <p className="text-stone-500 text-xs mt-3">
                Moderators enter this secret in the Say It voicebox to teleport into the review feed.
              </p>
            </div>

            {/* Change Passkey Form Card */}
            <div className="bg-white border-2 border-[#0D1527] shadow-[6px_6px_0px_#0D1527] p-6 sm:p-7">
              <div className="mb-5">
                <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#FF5030]">
                  Credential Rotation
                </span>
                <h2 className="text-lg font-black text-[#0D1527] tracking-tight">
                  Change Moderator Passkey
                </h2>
                <p className="text-stone-600 text-xs mt-1">
                  Changing the passkey will immediately invalidate previous credentials. Make sure to note down the new passkey.
                </p>
              </div>

              {/* Feedback messages */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-3.5 mb-5 border text-xs font-semibold flex items-start gap-2.5 ${
                      feedback.type === 'success'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-red-50 border-red-300 text-red-800'
                    }`}
                  >
                    {feedback.type === 'success' ? (
                      <Check className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                    )}
                    <span className="leading-relaxed">{feedback.message}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleUpdatePasskey} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* New Passkey */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                      New Passkey
                    </label>
                    <div className="relative">
                      <input
                        type={isNewPasskeyVisible ? 'text' : 'password'}
                        id="new-passkey-input"
                        value={newPasskey}
                        onChange={(e) => setNewPasskey(e.target.value)}
                        placeholder="e.g. StudentInclusion2026..."
                        className="w-full px-3.5 py-2.5 pr-10 bg-[#FAF8F5] border-2 border-[#0D1527] text-[#0D1527] font-mono text-sm placeholder:text-stone-400 focus:outline-none focus:border-[#FF5030] transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setIsNewPasskeyVisible(!isNewPasskeyVisible)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                        tabIndex={-1}
                      >
                        {isNewPasskeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Passkey */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                      Confirm New Passkey
                    </label>
                    <input
                      type={isNewPasskeyVisible ? 'text' : 'password'}
                      id="confirm-passkey-input"
                      value={confirmPasskey}
                      onChange={(e) => setConfirmPasskey(e.target.value)}
                      placeholder="Re-type new passkey..."
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border-2 border-[#0D1527] text-[#0D1527] font-mono text-sm placeholder:text-stone-400 focus:outline-none focus:border-[#FF5030] transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-[11px] text-stone-500">
                    Recommended: Combine capital letters, lowercase, and numbers.
                  </div>

                  <button
                    type="submit"
                    id="save-new-passkey-btn"
                    disabled={isUpdating}
                    className="inline-flex items-center justify-center gap-2 py-2.5 px-6 bg-[#0D1527] hover:bg-[#1a2942] active:bg-black disabled:bg-stone-400 text-white font-bold text-xs uppercase tracking-wider shadow-[4px_4px_0px_#FF5030] transition-colors cursor-pointer"
                  >
                    {isUpdating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating Passkey...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Save & Apply Passkey</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <button
                onClick={onBackToSubmit}
                className="text-xs font-bold text-stone-600 hover:text-[#0D1527] underline underline-offset-4 cursor-pointer"
              >
                Return to Anonymous Student Voicebox
              </button>

              <button
                onClick={onNavigateToModeration}
                id="test-moderator-link-btn"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF5030] hover:text-[#e04020] cursor-pointer"
              >
                <span>Proceed to Moderator Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
