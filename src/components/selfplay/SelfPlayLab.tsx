import {
  Activity,
  Brain,
  Download,
  Flame,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import React, { useState } from 'react';
import { DEFAULT_WEIGHTS } from '../../lib/chaturanga/ai';
import {
  loadLearnedWeights,
  loadTrainingStats,
  resetWeightsToDefault,
  runSelfPlayBatch,
  saveLearnedWeights,
  TrainingStats,
} from '../../lib/chaturanga/rl';
import { EvaluationWeights, PieceType } from '../../lib/chaturanga/types';
import { useGameStore } from '../../store/gameStore';

export const SelfPlayLab: React.FC = () => {
  const { weights, setCustomWeights } = useGameStore();
  const [stats, setStats] = useState<TrainingStats>(loadTrainingStats());
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; latestWinner: string } | null>(null);

  const pieceNames: { type: PieceType; label: string; icon: string }[] = [
    { type: 'padati', label: 'Padati (Foot Soldier)', icon: '🛡️' },
    { type: 'mantri', label: 'Mantri (Minister)', icon: '📜' },
    { type: 'gaja', label: 'Gaja (Elephant)', icon: '🐘' },
    { type: 'ashva', label: 'Ashva (Cavalry)', icon: '🐎' },
    { type: 'ratha', label: 'Ratha (Chariot)', icon: '🏰' },
  ];

  const handleStartTraining = (count: number) => {
    setIsRunning(true);
    setBatchProgress({ current: 0, total: count, latestWinner: 'starting' });

    // Run asynchronously in chunks to keep UI responsive
    setTimeout(() => {
      const { updatedWeights, stats: newStats } = runSelfPlayBatch(count, (completed, total, latestWinner) => {
        setBatchProgress({ current: completed, total, latestWinner });
      });

      setCustomWeights(updatedWeights);
      setStats(newStats);
      setIsRunning(false);
      setBatchProgress(null);
    }, 100);
  };

  const handleResetWeights = () => {
    if (confirm('Reset all learned policy weights to ancient defaults?')) {
      const reset = resetWeightsToDefault();
      setCustomWeights(reset);
      setStats(loadTrainingStats());
    }
  };

  const handleExportWeights = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(weights, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `chaturanga-weights-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const totalGames = stats.gamesPlayed || 1;
  const whiteWinRate = Math.round((stats.whiteWins / totalGames) * 100);
  const blackWinRate = Math.round((stats.blackWins / totalGames) * 100);
  const drawRate = Math.round((stats.draws / totalGames) * 100);

  return (
    <div className="flex flex-col gap-4 text-neutral-100">
      {/* Header Info */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
              <Brain className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-300">
              Self-Learning RL Lab
            </span>
          </div>
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Online TD(0) Adaptation Active
          </span>
        </div>

        <h2 className="text-lg font-serif font-bold text-amber-100 mb-1">
          Adaptive Bot Heuristics & Self-Play
        </h2>
        <p className="text-xs text-neutral-300 leading-relaxed">
          The AI engine continuously tunes its evaluation weights after every played match using Temporal Difference Reinforcement Learning:
        </p>

        {/* KaTeX / Math Formula representation */}
        <div className="mt-3 p-3 bg-neutral-950/80 border border-neutral-800 rounded-lg text-center font-mono text-xs sm:text-sm text-amber-300">
          W_{'{'}t+1{'}'} = W_t + α (R - V(s)) ∇W
        </div>
      </div>

      {/* Real-time Weight Matrix Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif font-bold text-sm text-amber-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Learned Material & Positional Weights</span>
          </h3>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportWeights}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs transition-colors flex items-center gap-1"
              title="Export weights JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
            <button
              onClick={handleResetWeights}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs transition-colors flex items-center gap-1"
              title="Reset weights to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {pieceNames.map(p => {
            const currentVal = Math.round(weights.material[p.type]);
            const defaultVal = DEFAULT_WEIGHTS.material[p.type];
            const diff = currentVal - defaultVal;

            return (
              <div
                key={p.type}
                className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{p.icon}</span>
                  <span className="font-medium text-neutral-300">{p.label}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-amber-200">{currentVal}</span>
                  {diff !== 0 && (
                    <span
                      className={`text-[10px] ${
                        diff > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {diff > 0 ? `+${diff}` : diff}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">☸️</span>
              <span className="font-medium text-neutral-300">Ashtāpada Control</span>
            </div>
            <div className="font-mono font-bold text-amber-200">
              {Math.round(weights.ashtapadaControl)}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">👑</span>
              <span className="font-medium text-neutral-300">Bare King Drive</span>
            </div>
            <div className="font-mono font-bold text-amber-200">
              {Math.round(weights.bareKingDrive)}
            </div>
          </div>
        </div>
      </div>

      {/* Self-Play Arena & Batch Simulator */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-lg">
        <h3 className="font-serif font-bold text-sm text-amber-200 mb-2 flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          <span>Self-Play Simulation Arena</span>
        </h3>
        <p className="text-xs text-neutral-400 mb-3">
          Simulate background bot-vs-bot games to explore variations and optimize policy weights via TD updates.
        </p>

        {/* Training Stats Bar */}
        <div className="grid grid-cols-4 gap-2 mb-4 text-center">
          <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800">
            <div className="text-neutral-500 text-[10px] uppercase font-bold">Total Games</div>
            <div className="font-mono font-bold text-sm text-neutral-200">{stats.gamesPlayed}</div>
          </div>
          <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800">
            <div className="text-neutral-500 text-[10px] uppercase font-bold">White Wins</div>
            <div className="font-mono font-bold text-sm text-amber-300">
              {stats.whiteWins} ({whiteWinRate}%)
            </div>
          </div>
          <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800">
            <div className="text-neutral-500 text-[10px] uppercase font-bold">Black Wins</div>
            <div className="font-mono font-bold text-sm text-amber-500">
              {stats.blackWins} ({blackWinRate}%)
            </div>
          </div>
          <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800">
            <div className="text-neutral-500 text-[10px] uppercase font-bold">Draws</div>
            <div className="font-mono font-bold text-sm text-neutral-400">
              {stats.draws} ({drawRate}%)
            </div>
          </div>
        </div>

        {/* Batch Progress Bar */}
        {isRunning && batchProgress && (
          <div className="mb-4 p-3 bg-neutral-950 border border-amber-500/30 rounded-lg">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="text-amber-300">Simulating match {batchProgress.current} / {batchProgress.total}...</span>
              <span className="text-neutral-400 text-[11px]">Latest outcome: {batchProgress.latestWinner}</span>
            </div>
            <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-200"
                style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Run Batch Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStartTraining(5)}
            disabled={isRunning}
            className="flex-1 py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-semibold border border-neutral-700 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate 5 Matches</span>
          </button>

          <button
            onClick={() => handleStartTraining(20)}
            disabled={isRunning}
            className="flex-1 py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-neutral-950 text-xs font-bold shadow flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate 20 Matches</span>
          </button>
        </div>
      </div>
    </div>
  );
};
