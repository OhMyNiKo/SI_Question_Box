import { ArrowUpRight, Lock, LogOut } from 'lucide-react';
import { ActiveView } from '../types';

interface HeaderProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  isModerator: boolean;
  onLogoutModerator: () => void;
  publicCount: number;
}

export function Header({
  activeView,
  setActiveView,
  isModerator,
  onLogoutModerator,
}: HeaderProps) {
  return (
    <header className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-4 pb-2 lg:pt-8 lg:pb-3 flex items-center justify-between z-20 relative shrink-0">
      {/* Brand logo: circular black SI badge + STUDENT INCLUSION stacked uppercase */}
      <div
        className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer select-none group"
        onClick={() => setActiveView('submit')}
        id="brand-header-link"
      >
        <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full bg-[#0D1527] text-white flex items-center justify-center font-black text-xs sm:text-sm tracking-tight shadow-xs group-hover:scale-105 transition-transform shrink-0">
          SI
        </div>
        <div className="flex flex-col leading-[1.05]">
          <span className="text-[11px] sm:text-[13px] lg:text-[14px] font-black tracking-[0.16em] text-[#0D1527] uppercase">
            Student
          </span>
          <span className="text-[11px] sm:text-[13px] lg:text-[14px] font-black tracking-[0.16em] text-[#0D1527] uppercase">
            Inclusion
          </span>
        </div>
      </div>

      {/* Right controls: Pill button 'Public Q&A ↗' */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {activeView !== 'submit' && (
          <button
            id="nav-ask-btn"
            onClick={() => setActiveView('submit')}
            className="px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-bold text-stone-700 hover:text-[#0D1527] transition-colors cursor-pointer"
          >
            Say It
          </button>
        )}

        <button
          id="nav-public-feed-btn"
          onClick={() => setActiveView('public_feed')}
          className={`px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-2.5 rounded-full text-xs sm:text-sm lg:text-base font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer border-2 ${
            activeView === 'public_feed'
              ? 'bg-[#0D1527] text-white border-[#0D1527] shadow-xs'
              : 'bg-white hover:bg-stone-50 text-[#0D1527] border-[#0D1527] shadow-[2px_2px_0_#0D1527]'
          }`}
        >
          <span>Public Q&A</span>
          <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
        </button>

        {isModerator && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-stone-300">
            <button
              id="nav-moderator-view-btn"
              onClick={() => setActiveView('moderation')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeView === 'moderation'
                  ? 'bg-[#FF5030] text-white'
                  : 'bg-orange-100 text-orange-900 hover:bg-orange-200'
              }`}
            >
              <Lock className="w-3 h-3" />
              <span>Moderator</span>
            </button>
            <button
              id="nav-moderator-logout-btn"
              onClick={onLogoutModerator}
              title="Exit Moderator Mode"
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
