import {
  coordsToSquare,
  getAllLegalMoves,
  isAshtapadaMarked,
  isKingInCheck,
  makeMove,
  pieceNotationSymbol,
} from './engine';
import {
  BotConfig,
  BotTier,
  EvaluationWeights,
  GameState,
  Move,
  MoveEvaluation,
  MoveQuality,
  Piece,
  PieceColor,
  PieceType,
  Square,
} from './types';

// Standard base evaluation weights for Chaturanga
export const DEFAULT_WEIGHTS: EvaluationWeights = {
  material: {
    padati: 100,
    mantri: 320,
    gaja: 310,
    ashva: 330,
    ratha: 550,
    raja: 20000,
  },
  ashtapadaControl: 35,
  mobility: 6,
  rajaSafety: 40,
  bareKingDrive: 250,
  pst: {
    padati: [
      [ 0,  0,  0,  0,  0,  0,  0,  0],
      [ 5, 10, 10,-20,-20, 10, 10,  5],
      [ 5, -5,-10,  0,  0,-10, -5,  5],
      [ 0,  0,  0, 25, 25,  0,  0,  0],
      [ 5,  5, 10, 30, 30, 10,  5,  5],
      [10, 10, 20, 35, 35, 20, 10, 10],
      [50, 50, 50, 60, 60, 50, 50, 50],
      [ 0,  0,  0,  0,  0,  0,  0,  0],
    ],
    mantri: [
      [-10, -5, -5, -5, -5, -5, -5,-10],
      [ -5,  5,  5,  5,  5,  5,  5, -5],
      [ -5,  5, 15, 20, 20, 15,  5, -5],
      [ -5,  5, 20, 30, 30, 20,  5, -5],
      [ -5,  5, 20, 30, 30, 20,  5, -5],
      [ -5,  5, 15, 20, 20, 15,  5, -5],
      [ -5,  5,  5,  5,  5,  5,  5, -5],
      [-10, -5, -5, -5, -5, -5, -5,-10],
    ],
    // Gaja can only visit 8 specific squares!
    // Give large bonuses to reachable central Ashtāpada squares
    gaja: [
      [-10,  0, 15,  0,  0, 15,  0,-10],
      [  0,  0,  0,  0,  0,  0,  0,  0],
      [ 15,  0, 25,  0,  0, 25,  0, 15],
      [  0,  0,  0,  0,  0,  0,  0,  0],
      [  0,  0,  0,  0,  0,  0,  0,  0],
      [ 15,  0, 25,  0,  0, 25,  0, 15],
      [  0,  0,  0,  0,  0,  0,  0,  0],
      [-10,  0, 15,  0,  0, 15,  0,-10],
    ],
    ashva: [
      [-20,-10,-10,-10,-10,-10,-10,-20],
      [-10,  0,  5,  5,  5,  5,  0,-10],
      [-10,  5, 15, 20, 20, 15,  5,-10],
      [-10,  5, 20, 30, 30, 20,  5,-10],
      [-10,  5, 20, 30, 30, 20,  5,-10],
      [-10,  5, 15, 20, 20, 15,  5,-10],
      [-10,  0,  5,  5,  5,  5,  0,-10],
      [-20,-10,-10,-10,-10,-10,-10,-20],
    ],
    ratha: [
      [  0,  0,  0,  5,  5,  0,  0,  0],
      [ -5,  0,  0,  0,  0,  0,  0, -5],
      [ -5,  0,  0,  0,  0,  0,  0, -5],
      [ -5,  0,  0,  0,  0,  0,  0, -5],
      [ -5,  0,  0,  0,  0,  0,  0, -5],
      [ -5,  0,  0,  0,  0,  0,  0, -5],
      [  5, 15, 15, 15, 15, 15, 15,  5],
      [  0,  0,  0,  5,  5,  0,  0,  0],
    ],
    raja: [
      [ 20, 30, 10,  0,  0, 10, 30, 20],
      [ 20, 20,  0,  0,  0,  0, 20, 20],
      [-10,-20,-20,-20,-20,-20,-20,-10],
      [-20,-30,-30,-40,-40,-30,-30,-20],
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-30,-40,-40,-50,-50,-40,-40,-30],
    ],
  },
};

export const BOT_CONFIGS: Record<BotTier, BotConfig> = {
  novice: {
    name: 'Sadhaka Arjun',
    title: 'The Novice Seeker',
    avatar: '🧘‍♂️',
    tier: 'novice',
    depth: 2,
    blunderProbability: 0.28,
    description: 'A beginner meditating on the movements of the Ashtāpada.',
    quote: 'The Gaja still confounds my eyes! Let us learn together.',
  },
  scholar: {
    name: 'Pandit Varahamihira',
    title: 'The Court Astrologer & Tactician',
    avatar: '📜',
    tier: 'scholar',
    depth: 4,
    blunderProbability: 0.04,
    description: 'A seasoned scholar of geometry and tactical army maneuvers.',
    quote: 'He who controls the sacred crosses commands the kingdom.',
  },
  ancient_master: {
    name: 'Acharya Chanakya',
    title: 'Grand Strategist of Magadha',
    avatar: '👑',
    tier: 'ancient_master',
    depth: 6,
    blunderProbability: 0.0,
    description: 'Legendary author of Arthashastra. Relentlessly hunts the Bare King.',
    quote: 'An army without chariots is blind; an isolated Raja is doomed.',
  },
};

// Zobrist Hashing Setup for Transposition Table
const ZOBRIST_TABLE: number[][][] = Array(8)
  .fill(0)
  .map(() =>
    Array(8)
      .fill(0)
      .map(() => Array(12).fill(0))
  );

let seed = 123456789;
function randomUint32(): number {
  seed = (seed ^ (seed << 13)) >>> 0;
  seed = (seed ^ (seed >>> 17)) >>> 0;
  seed = (seed ^ (seed << 5)) >>> 0;
  return seed;
}

for (let r = 0; r < 8; r++) {
  for (let f = 0; f < 8; f++) {
    for (let p = 0; p < 12; p++) {
      ZOBRIST_TABLE[r][f][p] = randomUint32();
    }
  }
}
const ZOBRIST_BLACK_TURN = randomUint32();

function pieceToIndex(piece: Piece): number {
  const typeMap: Record<PieceType, number> = {
    padati: 0,
    mantri: 1,
    gaja: 2,
    ashva: 3,
    ratha: 4,
    raja: 5,
  };
  const base = typeMap[piece.type];
  return piece.color === 'w' ? base : base + 6;
}

export function computeZobristHash(state: GameState): number {
  let hash = 0;
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = state.board[r][f];
      if (piece) {
        hash = (hash ^ ZOBRIST_TABLE[r][f][pieceToIndex(piece)]) >>> 0;
      }
    }
  }
  if (state.turn === 'b') {
    hash = (hash ^ ZOBRIST_BLACK_TURN) >>> 0;
  }
  return hash;
}

interface TTEntry {
  depth: number;
  score: number;
  bestMove: Move;
  flag: 'exact' | 'lower' | 'upper';
}

const transpositionTable = new Map<number, TTEntry>();

/**
 * Static Position Evaluator factored with custom or self-learned weights.
 */
export function evaluatePosition(state: GameState, weights: EvaluationWeights = DEFAULT_WEIGHTS): number {
  if (state.status === 'checkmate') {
    return state.winner === 'w' ? 100000 : -100000;
  }
  if (state.status === 'stalemate') {
    // In Chaturanga, stalemated player WINS!
    return state.winner === 'w' ? 90000 : -90000;
  }
  if (state.status === 'bare_king_win') {
    return state.winner === 'w' ? 95000 : -95000;
  }
  if (state.status === 'bare_king_draw') {
    return 0;
  }

  let whiteScore = 0;
  let blackScore = 0;
  let whiteNonKingCount = 0;
  let blackNonKingCount = 0;

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = state.board[r][f];
      if (!piece) continue;

      const mat = weights.material[piece.type];
      const isWhite = piece.color === 'w';

      // Piece-Square table reading
      // PSTs are oriented from White's perspective (rank 0 bottom, rank 7 top)
      const pstRank = isWhite ? r : 7 - r;
      const pstScore = weights.pst[piece.type][pstRank][f];

      // Ashtāpada marked square occupancy
      let ashtapadaBonus = 0;
      if (isAshtapadaMarked(f, r)) {
        ashtapadaBonus = weights.ashtapadaControl;
      }

      if (isWhite) {
        whiteScore += mat + pstScore + ashtapadaBonus;
        if (piece.type !== 'raja') whiteNonKingCount++;
      } else {
        blackScore += mat + pstScore + ashtapadaBonus;
        if (piece.type !== 'raja') blackNonKingCount++;
      }
    }
  }

  // Bare King Drive: If opponent is down to 1 or 2 pieces, heavily incentivize Bare King hunt
  if (blackNonKingCount <= 2) {
    whiteScore += (3 - blackNonKingCount) * weights.bareKingDrive;
  }
  if (whiteNonKingCount <= 2) {
    blackScore += (3 - whiteNonKingCount) * weights.bareKingDrive;
  }

  const netScore = whiteScore - blackScore;
  return netScore;
}

/**
 * Move ordering for optimal Alpha-Beta pruning.
 */
function orderMoves(moves: Move[], ttBestMove: Move | null, weights: EvaluationWeights): Move[] {
  return [...moves].sort((a, b) => {
    // 1. TT Best move first
    if (ttBestMove) {
      if (
        a.from.file === ttBestMove.from.file &&
        a.from.rank === ttBestMove.from.rank &&
        a.to.file === ttBestMove.to.file &&
        a.to.rank === ttBestMove.to.rank
      ) {
        return -10000;
      }
      if (
        b.from.file === ttBestMove.from.file &&
        b.from.rank === ttBestMove.from.rank &&
        b.to.file === ttBestMove.to.file &&
        b.to.rank === ttBestMove.to.rank
      ) {
        return 10000;
      }
    }

    // 2. MVV - LVA (Most Valuable Victim - Least Valuable Attacker)
    let scoreA = 0;
    let scoreB = 0;

    if (a.captured) {
      scoreA += weights.material[a.captured.type] * 10 - weights.material[a.piece.type];
    }
    if (b.captured) {
      scoreB += weights.material[b.captured.type] * 10 - weights.material[b.piece.type];
    }

    // 3. Promotions
    if (a.isPromotion) scoreA += 300;
    if (b.isPromotion) scoreB += 300;

    // 4. Central Ashtāpada occupation
    if (isAshtapadaMarked(a.to.file, a.to.rank)) scoreA += 40;
    if (isAshtapadaMarked(b.to.file, b.to.rank)) scoreB += 40;

    return scoreB - scoreA;
  });
}

/**
 * Quiescence search to handle immediate tactical trades and avoid the horizon effect.
 */
function quiescence(
  state: GameState,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  weights: EvaluationWeights,
  depth: number = 0
): number {
  const standPat = evaluatePosition(state, weights);
  if (depth >= 3) return standPat;

  if (isMaximizing) {
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;

    const legalMoves = getAllLegalMoves(state);
    const captureMoves = legalMoves.filter(m => !!m.captured || m.isPromotion);

    for (const move of captureMoves) {
      const nextState = makeMove(state, move);
      const score = quiescence(nextState, alpha, beta, false, weights, depth + 1);
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }
    return alpha;
  } else {
    if (standPat <= alpha) return alpha;
    if (standPat < beta) beta = standPat;

    const legalMoves = getAllLegalMoves(state);
    const captureMoves = legalMoves.filter(m => !!m.captured || m.isPromotion);

    for (const move of captureMoves) {
      const nextState = makeMove(state, move);
      const score = quiescence(nextState, alpha, beta, true, weights, depth + 1);
      if (score <= alpha) return alpha;
      if (score < beta) beta = score;
    }
    return beta;
  }
}

/**
 * Minimax with Alpha-Beta Pruning, Transposition Table, and Quiescence.
 */
export function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  weights: EvaluationWeights = DEFAULT_WEIGHTS
): { score: number; bestMove: Move | null } {
  if (state.status !== 'active') {
    return { score: evaluatePosition(state, weights), bestMove: null };
  }

  if (depth === 0) {
    const qScore = quiescence(state, alpha, beta, isMaximizing, weights, 0);
    return { score: qScore, bestMove: null };
  }

  const hash = computeZobristHash(state);
  const ttEntry = transpositionTable.get(hash);
  let ttBestMove: Move | null = null;
  if (ttEntry && ttEntry.depth >= depth) {
    ttBestMove = ttEntry.bestMove;
    if (ttEntry.flag === 'exact') {
      return { score: ttEntry.score, bestMove: ttEntry.bestMove };
    }
  }

  const legalMoves = getAllLegalMoves(state);
  if (legalMoves.length === 0) {
    return { score: evaluatePosition(state, weights), bestMove: null };
  }

  const sortedMoves = orderMoves(legalMoves, ttBestMove, weights);
  let chosenMove: Move = sortedMoves[0];

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of sortedMoves) {
      const nextState = makeMove(state, move);
      const { score } = minimax(nextState, depth - 1, alpha, beta, false, weights);

      if (score > maxEval) {
        maxEval = score;
        chosenMove = move;
      }
      alpha = Math.max(alpha, score);
      if (beta <= alpha) {
        break; // Beta cutoff
      }
    }

    if (transpositionTable.size < 60000) {
      transpositionTable.set(hash, {
        depth,
        score: maxEval,
        bestMove: chosenMove,
        flag: maxEval <= alpha ? 'upper' : maxEval >= beta ? 'lower' : 'exact',
      });
    }

    return { score: maxEval, bestMove: chosenMove };
  } else {
    let minEval = Infinity;
    for (const move of sortedMoves) {
      const nextState = makeMove(state, move);
      const { score } = minimax(nextState, depth - 1, alpha, beta, true, weights);

      if (score < minEval) {
        minEval = score;
        chosenMove = move;
      }
      beta = Math.min(beta, score);
      if (beta <= alpha) {
        break; // Alpha cutoff
      }
    }

    if (transpositionTable.size < 60000) {
      transpositionTable.set(hash, {
        depth,
        score: minEval,
        bestMove: chosenMove,
        flag: minEval <= alpha ? 'upper' : minEval >= beta ? 'lower' : 'exact',
      });
    }

    return { score: minEval, bestMove: chosenMove };
  }
}

/**
 * Selects the bot's move based on its tier configuration.
 */
export function getBotMove(
  state: GameState,
  tier: BotTier,
  weights: EvaluationWeights = DEFAULT_WEIGHTS
): { move: Move; evaluation: number } {
  const config = BOT_CONFIGS[tier];
  const isMaximizing = state.turn === 'w';

  // Evaluate candidate moves with minimax
  const { score, bestMove } = minimax(
    state,
    config.depth,
    -Infinity,
    Infinity,
    isMaximizing,
    weights
  );

  const legalMoves = getAllLegalMoves(state);
  if (!bestMove || legalMoves.length === 1) {
    return { move: bestMove || legalMoves[0], evaluation: score };
  }

  // Blunder simulation for Novice or lower tiers
  if (Math.random() < config.blunderProbability && legalMoves.length > 1) {
    const sorted = [...legalMoves].sort(() => 0.5 - Math.random());
    const candidate = sorted.find(
      m => m.from.file !== bestMove.from.file || m.to.file !== bestMove.to.file
    );
    if (candidate) {
      return { move: candidate, evaluation: score - 150 };
    }
  }

  return { move: bestMove, evaluation: score };
}

/**
 * Generates an informative tactical explanation tailored to Chaturanga.
 */
function generateTacticalExplanation(
  stateBefore: GameState,
  userMove: Move,
  bestMove: Move,
  quality: MoveQuality
): string {
  const piece = userMove.piece;
  const targetSq = coordsToSquare(userMove.to);
  const bestToSq = coordsToSquare(bestMove.to);
  const bestPieceName = pieceNotationSymbol(bestMove.piece.type) || 'Padati';

  // Specific Chaturanga tactical heuristics:
  if (piece.type === 'gaja') {
    return `The Gaja (Elephant) leaps exactly 2 squares diagonally. Moving to ${targetSq} leaves it isolated from key outpost squares. Notice that the Gaja can never defend squares adjacent to it! Consider ${bestPieceName} to ${bestToSq} instead.`;
  }

  if (piece.type === 'mantri') {
    return `The Mantri (Minister) moves only 1 diagonal step. In Chaturanga, it lacks the ranged firepower of a modern Queen. By playing ${targetSq}, you restrict its diagonal diagonal connectivity. ${bestPieceName} to ${bestToSq} provides superior defense.`;
  }

  if (userMove.captured && quality === 'blunder') {
    return `Capturing on ${targetSq} opened a deadly line of attack against your Raja. In Chaturanga, piece values require strict coordination; losing defense of the sacred center creates critical vulnerabilities.`;
  }

  if (isAshtapadaMarked(bestMove.to.file, bestMove.to.rank)) {
    return `You missed establishing an outpost on the sacred Ashtāpada cross square ${bestToSq}! Controlling these central squares gives your army superior mobility across all four wings.`;
  }

  // Bare King scenario
  const enemyNonKingCount = userMove.piece.color === 'w' 
    ? countNonRaja(stateBefore.board, 'b') 
    : countNonRaja(stateBefore.board, 'w');
  if (enemyNonKingCount <= 2) {
    return `With few enemy pieces remaining, the game is nearing a Bare King condition! Prioritize stripping the enemy's final protectors with ${bestPieceName} to ${bestToSq}.`;
  }

  if (quality === 'blunder') {
    return `This move concedes decisive material or positional advantage. Your ${piece.type.toUpperCase()} on ${targetSq} becomes a vulnerable target. ${bestPieceName} to ${bestToSq} was essential.`;
  }

  if (quality === 'mistake') {
    return `A tactical slip. ${bestPieceName} to ${bestToSq} would exert much greater pressure on the enemy army while keeping your Raja shielded.`;
  }

  return `A slight inaccuracy. Playing ${bestPieceName} to ${bestToSq} maintained tighter harmony between your Chariots and Cavalry.`;
}

function countNonRaja(board: (Piece | null)[][], color: PieceColor): number {
  let c = 0;
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const p = board[r][f];
      if (p && p.color === color && p.type !== 'raja') c++;
    }
  }
  return c;
}

/**
 * Evaluates a user's move in real-time for "The Guru" coach.
 */
export function evaluateUserMove(
  stateBefore: GameState,
  userMove: Move,
  depth: number = 4,
  weights: EvaluationWeights = DEFAULT_WEIGHTS
): MoveEvaluation {
  const isMaximizing = stateBefore.turn === 'w';

  // 1. Minimax evaluation before the move to find the optimal line
  const { score: bestRawScore, bestMove } = minimax(
    stateBefore,
    depth,
    -Infinity,
    Infinity,
    isMaximizing,
    weights
  );

  const optimalMove = bestMove || userMove;

  // 2. Evaluate resulting state after user's move
  const stateAfter = makeMove(stateBefore, userMove);
  const nextIsMaximizing = stateAfter.turn === 'w';
  const { score: userRawScore } = minimax(
    stateAfter,
    depth - 1,
    -Infinity,
    Infinity,
    nextIsMaximizing,
    weights
  );

  // Perspective scores: higher is better for current player
  const playerBestScore = isMaximizing ? bestRawScore : -bestRawScore;
  const playerUserScore = isMaximizing ? userRawScore : -userRawScore;

  // Delta loss
  const delta = Math.max(0, playerBestScore - playerUserScore);

  let quality: MoveQuality = 'good';
  if (
    userMove.from.file === optimalMove.from.file &&
    userMove.from.rank === optimalMove.from.rank &&
    userMove.to.file === optimalMove.to.file &&
    userMove.to.rank === optimalMove.to.rank
  ) {
    quality = 'best';
  } else if (delta <= 25) {
    quality = 'best';
  } else if (delta <= 75) {
    quality = 'good';
  } else if (delta <= 160) {
    quality = 'inaccuracy';
  } else if (delta <= 320) {
    quality = 'mistake';
  } else {
    quality = 'blunder';
  }

  const explanation = generateTacticalExplanation(stateBefore, userMove, optimalMove, quality);

  return {
    move: userMove,
    score: playerUserScore,
    delta,
    quality,
    bestMove: optimalMove,
    bestScore: playerBestScore,
    explanation,
  };
}
