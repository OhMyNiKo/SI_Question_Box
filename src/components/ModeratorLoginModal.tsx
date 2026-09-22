import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Eye, EyeOff, X, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { ADMIN_PASSKEY } from '../services/questionsService';

interface ModeratorLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (passkey: string) => void;
  onAdminTrigger: () => void;
  verifyPasskeyFn: (passkey: string) => Promise<boolean>;
}

export function ModeratorLoginModal({
  isOpen,
  onClose,
  onSuccess,
  onAdminTrigger,
  verifyPasskeyFn,
}: ModeratorLoginModalProps) {
  const [passkey, setPasskey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = passkey.trim();
    if (!trimmed) {
      setErrorMessage('Please enter a passkey.');
      return;
    }

    setErrorMessage(null);

    // 1. Check if user entered Admin Master Key
    if (trimmed === ADMIN_PASSKEY) {
      onClose();
      onAdminTrigger();
      setPasskey('');
      return;
    }

    // 2. Check Moderator passkey
    setIsVerifying(true);
    try {
      const isValid = await verifyPasskeyFn(trimmed);
      if (isValid) {
        onSuccess(trimmed);
        onClose();
        setPasskey('');
      } else {
        if (trimmed === 'StudentInclusion2026') {
          setErrorMessage(
            'The passkey "StudentInclusion2026" was permanently revoked when the new passkey was confirmed. Only your new active passkey is accepted.'
          );
        } else {
          setErrorMessage(
            'Invalid passkey. Only the currently confirmed passkey can access the moderator portal.'
          );
        }
      }
    } catch {
      setErrorMessage('Verification failed due to a network error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white rounded-2xl border-2 border-[#0D1527] shadow-[6px_6px_0_#0D1527] p-6 sm:p-7 z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-[#0D1527] rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#0D1527] text-white flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#0D1527] tracking-tight leading-snug">
                Moderator Access
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                Enter your active passkey to access the reviewer portal
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="moderator-passkey-input"
                className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5"
              >
                Passkey
              </label>
              <div className="relative">
                <input
                  id="moderator-passkey-input"
                  type={showPassword ? 'text' : 'password'}
                  value={passkey}
                  onChange={(e) => {
                    setPasskey(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoFocus
                  placeholder="Enter current passkey (e.g. si2026)"
                  className="w-full px-4 py-2.5 pr-11 bg-stone-50 rounded-xl border border-stone-300 text-[#0D1527] text-sm font-mono placeholder:font-sans placeholder:text-stone-400 focus:outline-hidden focus:border-[#0D1527] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
                  title={showPassword ? 'Hide passkey' : 'Show passkey'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying || !passkey.trim()}
              className="w-full py-2.5 px-4 bg-[#0D1527] hover:bg-[#1a2942] disabled:opacity-50 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Passkey...</span>
                </>
              ) : (
                <>
                  <span>Enter Moderator Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick link for Admin */}
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Passkey administrator?</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onAdminTrigger();
              }}
              className="text-[#0D1527] font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
