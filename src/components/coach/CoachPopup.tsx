import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, CheckCircle2, Eye, RotateCcw, Sparkles, X } from 'lucide-react';
import React from 'react';
import { coordsToSquare, pieceNotationSymbol } from '../../lib/chaturanga/engine';
import { useGameStore } from '../../store/gameStore';

export const CoachPopup: React.FC = () => {
  const {
    activeCoachFeedback,
    showCoachArrow,
    dismissCoachFeedback,
    toggleCoachArrow,
    applyBestMoveCorrection,
  } = useGameStore();

  if (!activeCoachFeedback) return null;

  const { quality, delta, explanation, bestMove } = activeCoachFeedback;
  const bestTo = coordsToSquare(bestMove.to);
  const bestFrom = coordsToSquare(bestMove.from);
  const bestPieceSymbol = pieceNotationSymbol(bestMove.piece.type) || 'Padati';

  // Badge configurations
  let badgeStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  let badgeIcon = <AlertTriangle className="w-4 h-4 text-amber-400" />;
  let badgeLabel = `Inaccuracy (?!) -${Math.round(delta)} cp`;

  if (quality === 'mistake') {
    badgeStyle = 'bg-orange-500/20 text-orange-300 border-orange-500/40';
    badgeIcon = <AlertTriangle className="w-4 h-4 text-orange-400" />;
    badgeLabel = `Mistake (?) -${Math.round(delta)} cp`;
  } else if (quality === 'blunder') {
    badgeStyle = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    badgeIcon = <AlertTriangle className="w-4 h-4 text-rose-400" />;
    badgeLabel = `Blunder (??) -${Math.round(delta)} cp`;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.95 }}
        className="w-full bg-neutral-900/95 backdrop-blur-md border border-amber-500/30 rounded-xl p-4 shadow-2xl relative text-neutral-100 overflow-hidden"
      >
        {/* Guru decorative ambient glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header with Coach Avatar and Close */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg">
              🧘
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-sm text-amber-200">The Guru</span>
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                  Live Coach
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={dismissCoachFeedback}
            className="text-neutral-400 hover:text-neutral-200 p-1 rounded-lg hover:bg-neutral-800 transition-colors"
            title="Dismiss coach feedback"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quality classification badge */}
        <div className="flex items-center gap-2 mb-3">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold ${badgeStyle}`}>
            {badgeIcon}
            <span>{badgeLabel}</span>
          </div>
        </div>

        {/* Plain Language Tactical Explanation */}
        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-3">
          {explanation}
        </p>

        {/* Correction Box */}
        <div className="bg-neutral-950/80 border border-neutral-800 rounded-lg p-2.5 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <span className="text-neutral-400">Optimal line: </span>
              <span className="font-mono font-bold text-emerald-300">
                {bestPieceSymbol} {bestFrom} → {bestTo}
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleCoachArrow}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors ${
              showCoachArrow
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-750'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showCoachArrow ? 'Hide Arrow' : 'Show Arrow'}</span>
          </button>

          <button
            onClick={applyBestMoveCorrection}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-600 to-amber-500 text-neutral-950 hover:brightness-110 shadow-md transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Take Back & Try Best</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
