import { motion } from 'framer-motion';
import React from 'react';

interface EvalBarProps {
  evaluation: number; // In centipawns from White's perspective
  isFlipped: boolean;
}

export const EvalBar: React.FC<EvalBarProps> = ({ evaluation, isFlipped }) => {
  // Convert centipawns to percentage (sigmoid/tanh mapping)
  // 0 -> 50%
  // +500 cp -> ~75%
  // -500 cp -> ~25%
  // +2000 cp -> 98%
  const normalized = Math.max(-1500, Math.min(1500, evaluation));
  const whitePercent = 50 + (normalized / 1500) * 45;
  const clampedPercent = Math.max(3, Math.min(97, whitePercent));

  // If flipped, top is Black, bottom is White
  const displayPercent = isFlipped ? 100 - clampedPercent : clampedPercent;

  const displayScore = (Math.abs(evaluation) / 100).toFixed(1);
  const scorePrefix = evaluation > 0 ? '+' : evaluation < 0 ? '-' : '';

  return (
    <div className="relative flex flex-col items-center h-full w-8 bg-neutral-900 border border-neutral-700/80 rounded-lg overflow-hidden shadow-inner select-none">
      {/* Black's portion (dark bar) */}
      <div className="absolute top-0 w-full bg-neutral-900 transition-all duration-300" style={{ height: `${100 - displayPercent}%` }}>
        {evaluation < -60 && (
          <span className="absolute top-2 w-full text-center text-[10px] font-mono font-bold text-amber-200/90">
            {scorePrefix}{displayScore}
          </span>
        )}
      </div>

      {/* White's portion (light bar) */}
      <motion.div
        className="absolute bottom-0 w-full bg-amber-100 transition-all duration-300"
        style={{ height: `${displayPercent}%` }}
        initial={false}
        animate={{ height: `${displayPercent}%` }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
      >
        {evaluation >= -60 && (
          <span className="absolute bottom-2 w-full text-center text-[10px] font-mono font-bold text-neutral-900">
            {scorePrefix}{displayScore}
          </span>
        )}
      </motion.div>

      {/* Center 0.0 Equilibrium Marker */}
      <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-amber-500/60 z-10 pointer-events-none" />
    </div>
  );
};
