import {
  BookOpen,
  Brain,
  HelpCircle,
  GraduationCap,
  Settings,
  Sparkles,
  Swords,
  Volume2,
  VolumeX,
} from 'lucide-react';
import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    coachSettings,
    updateCoachSettings,
    soundEnabled,
    toggleSound,
  } = useGameStore();

  const [showCoachSettingsModal, setShowCoachSettingsModal] = useState<boolean>(false);

  return (
    <header className="w-full bg-neutral-950/90 backdrop-blur-md border-b border-amber-900/30 sticky top-0 z-40 text-neutral-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer" onClick={() => setActiveTab('play')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-800 to-amber-600 border border-amber-400/50 flex items-center justify-center text-xl shadow-lg">
            ☸️
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-serif font-black text-base sm:text-lg tracking-wide text-amber-200">
                Chaturanga <span className="text-amber-500">Academy</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Ancient Chess
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 hidden sm:block">
              चतुरङ्ग विद्यालय — Master the Ancestral Strategy of the Ashtāpada
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800">
          <button
            onClick={() => setActiveTab('play')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'play'
                ? 'bg-amber-600 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Play</span>
          </button>

          <button
            onClick={() => setActiveTab('academy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'academy'
                ? 'bg-amber-600 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Academy</span>
          </button>

          <button
            onClick={() => setActiveTab('selfplay')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'selfplay'
                ? 'bg-amber-600 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">RL Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'rules'
                ? 'bg-amber-600 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rules</span>
          </button>
        </nav>

        {/* Right Utility Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Coach Settings Pill */}
          <button
            onClick={() => setShowCoachSettingsModal(prev => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-xs text-neutral-300 transition-colors"
            title="Guru Coach Settings"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline font-medium">Coach</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 transition-colors"
            title="Toggle Sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-neutral-500" />
            )}
          </button>
        </div>
      </div>

      {/* Coach Settings Modal Drawer */}
      {showCoachSettingsModal && (
        <div className="border-t border-neutral-800 bg-neutral-950/95 p-4 animate-in slide-in-from-top duration-200">
          <div className="max-w-xl mx-auto flex flex-col gap-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-sm text-amber-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>The Guru Coach Settings</span>
              </span>
              <button
                onClick={() => setShowCoachSettingsModal(false)}
                className="text-neutral-400 hover:text-neutral-200"
              >
                Done
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-neutral-900 border border-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={coachSettings.enabled}
                  onChange={(e) => updateCoachSettings({ enabled: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span className="text-neutral-200">Coach Enabled</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-neutral-900 border border-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={coachSettings.triggerOnInaccuracy}
                  onChange={(e) => updateCoachSettings({ triggerOnInaccuracy: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span className="text-neutral-200">Alert Inaccuracies</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-neutral-900 border border-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={coachSettings.autoShowArrow}
                  onChange={(e) => updateCoachSettings({ autoShowArrow: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span className="text-neutral-200">Auto Show Arrows</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
