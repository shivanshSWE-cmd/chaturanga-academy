import { DEFAULT_WEIGHTS, evaluatePosition } from './ai';
import { createInitialGameState, getAllLegalMoves, isAshtapadaMarked, makeMove } from './engine';
import { EvaluationWeights, GameState, Move, PieceType } from './types';

const STORAGE_KEY = 'chaturanga_learned_weights_v1';
const STATS_KEY = 'chaturanga_training_stats_v1';

export interface TrainingStats {
  gamesPlayed: number;
  whiteWins: number;
  blackWins: number;
  draws: number;
  lastUpdated: string;
}

export interface StateFeatures {
  materialDiff: Record<PieceType, number>;
  ashtapadaDiff: number;
  pstFeatures: Record<PieceType, number[][]>;
}

export function extractFeatures(state: GameState): StateFeatures {
  const materialDiff: Record<PieceType, number> = {
    padati: 0,
    mantri: 0,
    gaja: 0,
    ashva: 0,
    ratha: 0,
    raja: 0,
  };

  const pstFeatures: Record<PieceType, number[][]> = {
    padati: Array(8).fill(0).map(() => Array(8).fill(0)),
    mantri: Array(8).fill(0).map(() => Array(8).fill(0)),
    gaja: Array(8).fill(0).map(() => Array(8).fill(0)),
    ashva: Array(8).fill(0).map(() => Array(8).fill(0)),
    ratha: Array(8).fill(0).map(() => Array(8).fill(0)),
    raja: Array(8).fill(0).map(() => Array(8).fill(0)),
  };

  let ashtapadaDiff = 0;

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = state.board[r][f];
      if (!piece) continue;

      const sign = piece.color === 'w' ? 1 : -1;
      materialDiff[piece.type] += sign;

      const pstRank = piece.color === 'w' ? r : 7 - r;
      pstFeatures[piece.type][pstRank][f] += sign;

      if (isAshtapadaMarked(f, r)) {
        ashtapadaDiff += sign;
      }
    }
  }

  return { materialDiff, ashtapadaDiff, pstFeatures };
}

/**
 * Loads learned weights from localStorage or falls back to DEFAULT_WEIGHTS.
 */
export function loadLearnedWeights(): EvaluationWeights {
  if (typeof window === 'undefined') return DEFAULT_WEIGHTS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_WEIGHTS;
    const parsed = JSON.parse(raw);
    return parsed as EvaluationWeights;
  } catch (err) {
    console.error('Failed to load learned weights, resetting to default', err);
    return DEFAULT_WEIGHTS;
  }
}

/**
 * Saves weights to localStorage.
 */
export function saveLearnedWeights(weights: EvaluationWeights): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(weights));
  } catch (err) {
    console.error('Failed to save learned weights', err);
  }
}

/**
 * Loads training stats.
 */
export function loadTrainingStats(): TrainingStats {
  const defaultStats: TrainingStats = {
    gamesPlayed: 0,
    whiteWins: 0,
    blackWins: 0,
    draws: 0,
    lastUpdated: new Date().toISOString(),
  };

  if (typeof window === 'undefined') return defaultStats;

  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats;
    return JSON.parse(raw) as TrainingStats;
  } catch {
    return defaultStats;
  }
}

export function saveTrainingStats(stats: TrainingStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save training stats', err);
  }
}

/**
 * Temporal Difference (TD) Weight Update:
 * W_{t+1} = W_t + alpha * (R - V(s)) * grad_W
 */
export function updateWeightsFromGame(
  gameStates: GameState[],
  winner: 'w' | 'b' | 'draw',
  currentWeights: EvaluationWeights = loadLearnedWeights(),
  alpha: number = 0.003
): EvaluationWeights {
  const nextWeights: EvaluationWeights = JSON.parse(JSON.stringify(currentWeights));

  // Terminal reward R: +1 for White win, -1 for Black win, 0 for draw
  const reward = winner === 'w' ? 1.0 : winner === 'b' ? -1.0 : 0.0;

  // Update weights across the trajectory
  // Sample positions to avoid overfitting opening moves
  const sampledStates = gameStates.filter((_, idx) => idx % 2 === 0);

  for (const state of sampledStates) {
    // Current state evaluation V(s) normalized between -1.0 and 1.0 (tanh scale)
    const rawEval = evaluatePosition(state, nextWeights);
    const normalizedV = Math.tanh(rawEval / 600); // maps score around ±600 cp to ±0.76

    // TD error delta = R - V(s)
    const tdError = reward - normalizedV;

    if (Math.abs(tdError) < 0.01) continue;

    const features = extractFeatures(state);

    // Update material weights within safe boundaries
    const pieceTypes: PieceType[] = ['padati', 'mantri', 'gaja', 'ashva', 'ratha'];
    for (const pt of pieceTypes) {
      const grad = features.materialDiff[pt];
      const adjustment = alpha * tdError * grad * 10;
      nextWeights.material[pt] = Math.max(
        50,
        Math.min(1200, nextWeights.material[pt] + adjustment)
      );
    }

    // Update Ashtāpada control bonus
    const ashtapadaGrad = features.ashtapadaDiff;
    nextWeights.ashtapadaControl = Math.max(
      10,
      Math.min(100, nextWeights.ashtapadaControl + alpha * tdError * ashtapadaGrad * 5)
    );

    // Update Piece-Square tables slightly
    for (const pt of pieceTypes) {
      for (let r = 0; r < 8; r++) {
        for (let f = 0; f < 8; f++) {
          const grad = features.pstFeatures[pt][r][f];
          if (grad !== 0) {
            nextWeights.pst[pt][r][f] = Math.max(
              -60,
              Math.min(80, nextWeights.pst[pt][r][f] + alpha * tdError * grad * 2)
            );
          }
        }
      }
    }
  }

  saveLearnedWeights(nextWeights);
  return nextWeights;
}

/**
 * Simulates a single self-play game for training.
 */
export function runSingleSelfPlayGame(
  depth: number = 2,
  weights: EvaluationWeights
): {
  winner: 'w' | 'b' | 'draw';
  status: string;
  plyCount: number;
  finalState: GameState;
  states: GameState[];
} {
  let state = createInitialGameState();
  const states: GameState[] = [state];
  const maxPlies = 100; // Cap to prevent infinite loops

  while (state.status === 'active' && state.halfMoves < maxPlies) {
    const legalMoves = getAllLegalMoves(state);
    if (legalMoves.length === 0) break;

    // Pick best move with shallow search + light random noise for exploration (epsilon-greedy)
    let selectedMove: Move;
    if (Math.random() < 0.15) {
      // Exploration: pick random move
      selectedMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    } else {
      // Exploitation: evaluate legal moves
      let bestScore = state.turn === 'w' ? -Infinity : Infinity;
      selectedMove = legalMoves[0];

      for (const m of legalMoves) {
        const next = makeMove(state, m);
        const evalScore = evaluatePosition(next, weights);
        if (state.turn === 'w') {
          if (evalScore > bestScore) {
            bestScore = evalScore;
            selectedMove = m;
          }
        } else {
          if (evalScore < bestScore) {
            bestScore = evalScore;
            selectedMove = m;
          }
        }
      }
    }

    state = makeMove(state, selectedMove);
    states.push(state);
  }

  let finalWinner: 'w' | 'b' | 'draw' = 'draw';
  if (state.winner === 'w' || state.winner === 'b') {
    finalWinner = state.winner;
  } else if (state.status === 'bare_king_draw') {
    finalWinner = 'draw';
  } else {
    // Game terminated by maxPlies, determine by material evaluation
    const score = evaluatePosition(state, weights);
    if (score > 150) finalWinner = 'w';
    else if (score < -150) finalWinner = 'b';
    else finalWinner = 'draw';
  }

  return {
    winner: finalWinner,
    status: state.status,
    plyCount: state.halfMoves,
    finalState: state,
    states,
  };
}

/**
 * Runs a batch of self-play matches and updates weights.
 */
export function runSelfPlayBatch(
  count: number = 5,
  onProgress?: (completed: number, total: number, latestWinner: string) => void
): { updatedWeights: EvaluationWeights; stats: TrainingStats } {
  let weights = loadLearnedWeights();
  const stats = loadTrainingStats();

  for (let i = 0; i < count; i++) {
    const gameResult = runSingleSelfPlayGame(2, weights);
    weights = updateWeightsFromGame(gameResult.states, gameResult.winner, weights);

    stats.gamesPlayed += 1;
    if (gameResult.winner === 'w') stats.whiteWins += 1;
    else if (gameResult.winner === 'b') stats.blackWins += 1;
    else stats.draws += 1;

    if (onProgress) {
      onProgress(i + 1, count, gameResult.winner);
    }
  }

  stats.lastUpdated = new Date().toISOString();
  saveTrainingStats(stats);
  saveLearnedWeights(weights);

  return { updatedWeights: weights, stats };
}

/**
 * Resets weights to historical defaults.
 */
export function resetWeightsToDefault(): EvaluationWeights {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STATS_KEY);
  }
  return DEFAULT_WEIGHTS;
}
