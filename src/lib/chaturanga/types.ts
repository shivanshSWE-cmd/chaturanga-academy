export type PieceColor = 'w' | 'b';

export type PieceType = 
  | 'raja'    // King (moves 1 square any direction)
  | 'mantri'  // Minister/General/Ferz (moves 1 square diagonally)
  | 'gaja'    // Elephant/Alfil (leaps 2 squares diagonally)
  | 'ashva'   // Horse/Knight (standard Knight leap)
  | 'ratha'   // Chariot/Rook (orthogonal slider)
  | 'padati'; // Foot soldier/Pawn (moves 1 forward, captures 1 diag forward, promotes to Mantri)

export interface Piece {
  type: PieceType;
  color: PieceColor;
  id: string; // Unique piece ID for animations and tracking
}

export type Square = {
  file: number; // 0 to 7 (a to h)
  rank: number; // 0 to 7 (1 to 8)
};

export interface Move {
  from: Square;
  to: Square;
  piece: Piece;
  captured?: Piece;
  isPromotion?: boolean;
  promotionPiece?: PieceType;
  san?: string; // Standard / Chaturanga algebraic notation
}

export type GameStatus = 
  | 'active'
  | 'checkmate'
  | 'stalemate' // Stalemated player wins!
  | 'bare_king_win' // Bared opponent king
  | 'bare_king_draw' // Both kings bared sequentially
  | 'resignation';

export interface GameState {
  board: (Piece | null)[][]; // 8x8 grid [rank][file], rank 0 is 1st rank, rank 7 is 8th rank
  turn: PieceColor;
  moveHistory: Move[];
  capturedPieces: {
    w: Piece[]; // Captured by white
    b: Piece[]; // Captured by black
  };
  status: GameStatus;
  winner: PieceColor | 'draw' | null;
  isCheck: boolean;
  checkingSquare: Square | null;
  lastMove: Move | null;
  halfMoves: number;
}

export type MoveQuality = 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';

export interface MoveEvaluation {
  move: Move;
  score: number; // Centipawns from current player's perspective
  delta: number; // Score loss compared to best move
  quality: MoveQuality;
  bestMove: Move;
  bestScore: number;
  explanation: string;
}

export type BotTier = 'novice' | 'scholar' | 'ancient_master';

export interface BotConfig {
  name: string;
  title: string;
  avatar: string;
  tier: BotTier;
  depth: number;
  blunderProbability: number;
  description: string;
  quote: string;
}

export interface LessonStep {
  id: string;
  title: string;
  module: string;
  instructions: string;
  historicalContext: string;
  initialFen: string;
  playerColor: PieceColor;
  expectedMoves: { from: string; to: string }[];
  hint: string;
  successMessage: string;
}

export interface EvaluationWeights {
  material: {
    padati: number;
    mantri: number;
    gaja: number;
    ashva: number;
    ratha: number;
    raja: number;
  };
  ashtapadaControl: number; // Bonus for controlling marked Ashtāpada squares
  mobility: number;
  rajaSafety: number;
  bareKingDrive: number; // Bonus for reducing opponent to only Raja
  pst: Record<PieceType, number[][]>; // 8x8 piece square tables
}
