'use client';

import React from 'react';
import { AcademyView } from '../components/academy/AcademyView';
import { AshtapadaBoard } from '../components/board/AshtapadaBoard';
import { EvalBar } from '../components/board/EvalBar';
import { CoachPopup } from '../components/coach/CoachPopup';
import { Header } from '../components/layout/Header';
import { BotPanel } from '../components/panels/BotPanel';
import { MoveLog } from '../components/panels/MoveLog';
import { RulesModal } from '../components/rules/RulesModal';
import { SelfPlayLab } from '../components/selfplay/SelfPlayLab';
import { useGameStore } from '../store/gameStore';

export default function Home() {
  const {
    activeTab,
    currentEvaluation,
    isBoardFlipped,
    activeCoachFeedback,
  } = useGameStore();

  return (
    <div className="min-h-screen bg-[#0e0d0c] text-neutral-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Application Header */}
      <Header />

      {/* Main Chess.com-Style Split Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col lg:flex-row gap-5 items-start justify-center">
        {/* Left / Center: Board & Coach Container */}
        <section className="w-full lg:w-[640px] flex flex-col items-center gap-3 shrink-0">
          <div className="flex items-center justify-center gap-3 w-full">
            {/* Live Evaluation Bar (visible in match play mode) */}
            {activeTab === 'play' && (
              <div className="h-[400px] sm:h-[500px] md:h-[560px] shrink-0 py-2">
                <EvalBar evaluation={currentEvaluation} isFlipped={isBoardFlipped} />
              </div>
            )}

            {/* Ashtāpada Board */}
            <div className="flex-1 max-w-[560px]">
              <AshtapadaBoard />
            </div>
          </div>

          {/* Real-time "The Guru" Coach Pop-Up Floating Card */}
          {activeCoachFeedback && (
            <div className="w-full max-w-[560px]">
              <CoachPopup />
            </div>
          )}
        </section>

        {/* Right Column: Context Panels depending on active tab */}
        <section className="w-full lg:flex-1 max-w-xl flex flex-col gap-4">
          {activeTab === 'play' && (
            <>
              <BotPanel />
              <MoveLog />
            </>
          )}

          {activeTab === 'academy' && <AcademyView />}

          {activeTab === 'selfplay' && <SelfPlayLab />}

          {activeTab === 'rules' && <RulesModal />}
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-900 bg-neutral-950 py-3 px-4 text-center text-xs text-neutral-500">
        <p>
          Chaturanga Academy — Historical rules engine enforcing authentic 6th-century Gupta mechanics, Ashtāpada geometry, and self-learning TD heuristics.
        </p>
      </footer>
    </div>
  );
}
