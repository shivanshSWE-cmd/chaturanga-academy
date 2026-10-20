import { Bot, ChevronDown, Sparkles, Swords } from 'lucide-react';
import React, { useMemo } from 'react';
import { BOT_CONFIGS } from '../../lib/chaturanga/ai';
import { BotTier, PieceColor } from '../../lib/chaturanga/types';
import { useGameStore } from '../../store/gameStore';

export const BotPanel: React.FC = () => {
  const {
    botTier,
    setBotTier,
    playerColor,
    setPlayerColor,
    isBotThinking,
    gameState,
    startNewGame,
  } = useGameStore();

  const currentBot = BOT_CONFIGS[botTier];

  // Dynamic dialogue speech bubble based on game state
  const botDialogue = useMemo(() => {
    if (gameState.status === 'checkmate') {
      return gameState.winner === playerColor
        ? 'A brilliant victory! Your mastery of the Ashtāpada honors the ancient rishis.'
        : 'The royal Raja is cornered. Study the formations of the army and challenge me again!';
    }
    if (gameState.status === 'bare_king_win') {
      return gameState.winner === playerColor
        ? 'Nirvriddhi! You have stripped my army down to a solitary Raja. Well played!'
        : 'Your Raja stands alone without soldiers or chariots. Bare King victory is mine!';
    }
    if (gameState.status === 'stalemate') {
      return 'The ancient law honors the trapped Raja! Stalemate grants victory to the cornered player!';
    }
    if (isBotThinking) {
      return 'Contemplating the geometry of the four limbs of the army...';
    }
    if (gameState.isCheck) {
      return 'Guard your Raja! The line of attack is direct!';
    }
    if (gameState.moveHistory.length === 0) {
      return currentBot.quote;
    }
    if (gameState.moveHistory.length > 20) {
      return 'The endgame draws near. Guard your minor pieces; a Bare King loss can arrive in a single stroke!';
    }
    return 'The Ashtāpada rewards patience and coordination between Chariots and Cavalry.';
  }, [gameState, isBotThinking, playerColor, currentBot]);

  const tiers: BotTier[] = ['novice', 'scholar', 'ancient_master'];

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 shadow-lg text-neutral-100 flex flex-col gap-3">
      {/* Bot Header Card */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-900/60 to-amber-700/40 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner">
              {currentBot.avatar}
            </div>
            {isBotThinking && (
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-sm text-amber-200">{currentBot.name}</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {currentBot.tier.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-neutral-400">{currentBot.title}</p>
          </div>
        </div>

        {/* Turn indicator pill */}
        <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-neutral-950 border border-neutral-800">
          <div
            className={`w-2 h-2 rounded-full ${
              gameState.turn === playerColor ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
            }`}
          />
          <span className="text-neutral-300 text-[11px] font-medium">
            {gameState.turn === playerColor ? 'Your turn' : 'Bot thinking'}
          </span>
        </div>
      </div>

      {/* Dynamic Dialogue Speech Bubble */}
      <div className="relative bg-neutral-950/80 border border-amber-500/20 rounded-xl p-2.5 text-xs text-neutral-300 italic shadow-inner">
        <div className="flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-snug">"{botDialogue}"</p>
        </div>
      </div>

      {/* Bot Difficulty Tier Selector */}
      <div>
        <div className="text-[11px] text-neutral-400 font-medium mb-1.5 flex items-center justify-between">
          <span>Choose Opponent</span>
          <span className="text-neutral-500 text-[10px]">Minimax Depth {currentBot.depth}</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {tiers.map(t => {
            const b = BOT_CONFIGS[t];
            const isSelected = botTier === t;
            return (
              <button
                key={t}
                onClick={() => {
                  setBotTier(t);
                  startNewGame(playerColor, t);
                }}
                className={`py-1.5 px-2 rounded-lg text-center transition-all border text-xs font-medium flex flex-col items-center gap-0.5 ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 shadow-sm'
                    : 'bg-neutral-800/60 border-neutral-700/60 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                }`}
              >
                <span className="text-sm">{b.avatar}</span>
                <span className="text-[11px] capitalize">{t.replace('_', ' ')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Play as White / Black toggle */}
      <div className="flex items-center justify-between pt-1 border-t border-neutral-800/80 text-xs">
        <span className="text-neutral-400 text-[11px]">Your Army Color:</span>
        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => {
              if (playerColor !== 'w') {
                setPlayerColor('w');
                startNewGame('w', botTier);
              }
            }}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
              playerColor === 'w'
                ? 'bg-amber-100 text-neutral-900 shadow'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            White (Ivory)
          </button>
          <button
            onClick={() => {
              if (playerColor !== 'b') {
                setPlayerColor('b');
                startNewGame('b', botTier);
              }
            }}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
              playerColor === 'b'
                ? 'bg-amber-900 text-amber-100 shadow'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Black (Obsidian)
          </button>
        </div>
      </div>
    </div>
  );
};
