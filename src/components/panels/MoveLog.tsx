import { Flag, Play, RefreshCw, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { pieceNotationSymbol } from '../../lib/chaturanga/engine';
import { Piece, PieceColor, PieceType } from '../../lib/chaturanga/types';
import { useGameStore } from '../../store/gameStore';
import { PieceIcon } from '../pieces/PieceIcon';

export const MoveLog: React.FC = () => {
  const {
    gameState,
    playerColor,
    flipBoard,
    takeBackMove,
    startNewGame,
    resignGame,
    soundEnabled,
    toggleSound,
    moveEvaluations,
  } = useGameStore();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [gameState.moveHistory]);

  // Calculate captured material difference
  const pieceValues: Record<PieceType, number> = {
    padati: 1,
    mantri: 3,
    gaja: 3,
    ashva: 3,
    ratha: 5,
    raja: 0,
  };

  const whiteCapturedVal = gameState.capturedPieces.w.reduce((sum, p) => sum + pieceValues[p.type], 0);
  const blackCapturedVal = gameState.capturedPieces.b.reduce((sum, p) => sum + pieceValues[p.type], 0);

  const whiteDiff = whiteCapturedVal - blackCapturedVal;
  const blackDiff = blackCapturedVal - whiteCapturedVal;

  // Group moves into pairs (White & Black)
  const movePairs: { num: number; white?: { san: string; evalQuality?: string }; black?: { san: string; evalQuality?: string } }[] = [];
  for (let i = 0; i < gameState.moveHistory.length; i += 2) {
    const whiteMove = gameState.moveHistory[i];
    const blackMove = gameState.moveHistory[i + 1];

    const whiteEval = moveEvaluations[i]?.quality;
    const blackEval = moveEvaluations[i + 1]?.quality;

    movePairs.push({
      num: Math.floor(i / 2) + 1,
      white: whiteMove ? { san: whiteMove.san || '—', evalQuality: whiteEval } : undefined,
      black: blackMove ? { san: blackMove.san || '—', evalQuality: blackEval } : undefined,
    });
  }

  const renderEvalBadge = (quality?: string) => {
    if (!quality) return null;
    switch (quality) {
      case 'best':
        return <span className="text-[10px] font-bold text-emerald-400 ml-1">!</span>;
      case 'inaccuracy':
        return <span className="text-[10px] font-bold text-amber-400 ml-1">?!</span>;
      case 'mistake':
        return <span className="text-[10px] font-bold text-orange-400 ml-1">?</span>;
      case 'blunder':
        return <span className="text-[10px] font-bold text-rose-400 ml-1">??</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg text-neutral-200">
      {/* Captured Pieces Bar: Opponent's Captures */}
      <div className="px-3 py-2 bg-neutral-950/60 border-b border-neutral-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 overflow-x-auto max-w-[200px]">
          {gameState.capturedPieces.b.map((p, idx) => (
            <div key={idx} className="w-5 h-5 shrink-0 opacity-80">
              <PieceIcon piece={p} />
            </div>
          ))}
          {blackDiff > 0 && (
            <span className="text-amber-400 font-mono text-[11px] font-bold ml-1">
              +{blackDiff}
            </span>
          )}
        </div>
        <span className="text-[11px] text-neutral-400 font-medium">Opponent Captures</span>
      </div>

      {/* Move History Table */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-xs max-h-56">
        {movePairs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-28 text-neutral-500 italic text-xs">
            <span>No moves yet played</span>
            <span className="text-[11px] text-neutral-600 mt-1">Make a move to begin the ancient duel</span>
          </div>
        ) : (
          movePairs.map(pair => (
            <div key={pair.num} className="grid grid-cols-12 py-1 px-2 rounded hover:bg-neutral-800/60 items-center">
              <span className="col-span-2 text-neutral-500 text-[11px]">{pair.num}.</span>
              <span className="col-span-5 font-semibold text-amber-200 flex items-center">
                {pair.white?.san}
                {renderEvalBadge(pair.white?.evalQuality)}
              </span>
              <span className="col-span-5 font-semibold text-neutral-300 flex items-center">
                {pair.black?.san}
                {renderEvalBadge(pair.black?.evalQuality)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Captured Pieces Bar: Player's Captures */}
      <div className="px-3 py-2 bg-neutral-950/60 border-t border-b border-neutral-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 overflow-x-auto max-w-[200px]">
          {gameState.capturedPieces.w.map((p, idx) => (
            <div key={idx} className="w-5 h-5 shrink-0 opacity-80">
              <PieceIcon piece={p} />
            </div>
          ))}
          {whiteDiff > 0 && (
            <span className="text-amber-400 font-mono text-[11px] font-bold ml-1">
              +{whiteDiff}
            </span>
          )}
        </div>
        <span className="text-[11px] text-neutral-400 font-medium">Your Captures</span>
      </div>

      {/* Game Status Banner if ended */}
      {gameState.status !== 'active' && (
        <div className="p-3 bg-amber-500/10 border-t border-amber-500/30 text-center">
          <div className="text-xs font-serif font-bold text-amber-300 uppercase tracking-wider mb-0.5">
            {gameState.status === 'checkmate' && 'Checkmate!'}
            {gameState.status === 'stalemate' && 'Stalemate! (Stalemated Player Wins!)'}
            {gameState.status === 'bare_king_win' && 'Bare King Victory (Nirvriddhi)!'}
            {gameState.status === 'bare_king_draw' && 'Bare King Sequential Draw!'}
            {gameState.status === 'resignation' && 'Resignation'}
          </div>
          <p className="text-[11px] text-neutral-300">
            {gameState.winner === 'draw'
              ? 'The battle concluded in an honorable draw.'
              : `${gameState.winner === 'w' ? 'White' : 'Black'} claims glorious triumph.`}
          </p>
        </div>
      )}

      {/* Action Controls Bar */}
      <div className="p-2.5 bg-neutral-950/80 flex items-center justify-between gap-1 border-t border-neutral-800">
        <button
          onClick={() => startNewGame(playerColor)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs font-medium transition-colors"
          title="Start a new game"
        >
          <Play className="w-3.5 h-3.5 text-amber-400" />
          <span>New</span>
        </button>

        <button
          onClick={takeBackMove}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs font-medium transition-colors"
          title="Take back last move"
        >
          <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
          <span>Undo</span>
        </button>

        <button
          onClick={flipBoard}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs font-medium transition-colors"
          title="Flip board perspective"
        >
          <RefreshCw className="w-3.5 h-3.5 text-neutral-400" />
          <span>Flip</span>
        </button>

        <button
          onClick={toggleSound}
          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs font-medium transition-colors"
          title="Toggle sound"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-neutral-500" />
          )}
        </button>

        <button
          onClick={resignGame}
          disabled={gameState.status !== 'active'}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-medium transition-colors disabled:opacity-30 disabled:pointer-events-none"
          title="Resign this match"
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Resign</span>
        </button>
      </div>
    </div>
  );
};
