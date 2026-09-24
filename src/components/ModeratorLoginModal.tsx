import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Lock, Eye, EyeOff, X, ArrowRight, KeyRound, AlertCircle } from 'lucide-react';
import { verifyPasskeyDetailed } from '../services/questionsService';

interface ModeratorLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (passkey: string) => void;
  onOpenAdminConsole?: () => void;
  prefilledPasskey?: string;
}

export function ModeratorLoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  onOpenAdminConsole,
  prefilledPasskey = '',
}: ModeratorLoginModalProps) {
  const [passkey, setPasskey] = useState(prefilledPasskey);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setPasskey(prefilledPasskey);
      setErrorMessage(null);
      setIsLoading(false);
    }
  }, [isOpen, prefilledPasskey]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = passkey.trim();
    if (!trimmed) {
      setErrorMessage('Please enter the moderator passkey.');
      return;
    }

    // Check if user entered master admin passkey NiKo0709 (case-insensitive)
    if (trimmed === 'NiKo0709' || trimmed.toLowerCase() === 'niko0709') {
      onClose();
      onOpenAdminConsole?.();
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await verifyPasskeyDetailed(trimmed);
      if (res.isAdmin) {
        onClose();
        onOpenAdminConsole?.();
        return;
      }

      if (res.isValid) {
        onLoginSuccess(trimmed);
        onClose();
      } else if (res.isOldDefaultPasskey) {
        setErrorMessage(
          'Notice: The team moderator passkey was changed from "StudentInclusion2026". Please enter the newly updated passkey, or access the Admin Console (NiKo0709).'
        );
      } else {
        setErrorMessage(
          'Incorrect passkey. If the team passkey was recently changed on another device, please verify you have the current passkey, or check with an administrator.'
        );
      }
    } catch {
      setErrorMessage('Verification failed due to a network issue. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md bg-white rounded-2xl sm:rounded-3xl border-2 border-[#0D1527] shadow-[4px_4px_0_#0D1527] p-6 sm:p-8 overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-[#0D1527] hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border-2 border-[#FF5030] flex items-center justify-center text-[#FF5030] shrink-0">
            <Lock className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="block text-[11px] font-black uppercase tracking-[0.16em] text-[#FF5030]">
              Team Portal
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[#0D1527] tracking-tight">
              Moderator Access
            </h3>
          </div>
        </div>

        <p className="text-stone-600 text-xs sm:text-sm font-medium leading-relaxed mb-5">
          Enter the moderator passkey to review pending student voices, approve submissions, and post verified team replies. Everyone with the passkey has access.
        </p>

        {/* Error Notification */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5 overflow-hidden"
            >
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
              Moderator Passkey
            </label>
            <div className="relative">
              <input
                type={isVisible ? 'text' : 'password'}
                autoFocus
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Enter current passkey..."
                disabled={isLoading}
                className="w-full bg-stone-50 border-2 border-stone-300 focus:border-[#0D1527] focus:bg-white rounded-xl py-2.5 pl-3.5 pr-11 text-sm font-bold text-[#0D1527] placeholder:text-stone-400 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-700 rounded-lg transition-colors cursor-pointer"
                title={isVisible ? 'Hide passkey' : 'Show passkey'}
              >
                {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 px-4 bg-[#0D1527] hover:bg-[#1A243D] text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-[2px_2px_0_#FF5030] transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Verifying passkey across devices...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-[#FF5030]" />
                <span>Unlock Moderator Portal</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </motion.button>
        </form>

        {/* Admin settings shortcut */}
        <div className="mt-5 pt-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span className="font-medium">Need to view or change passkey?</span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAdminConsole?.();
            }}
            className="font-bold text-[#FF5030] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Admin Console (NiKo0709)</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
