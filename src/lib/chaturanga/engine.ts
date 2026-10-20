import { GameState, Move, Piece, PieceColor, PieceType, Square } from './types';

export const ASHTAPADA_MARKED_SQUARES: { file: number; rank: number; label: string }[] = [
  { file: 0, rank: 0, label: 'a1' },
  { file: 7, rank: 0, label: 'h1' },
  { file: 3, rank: 3, label: 'd4' },
  { file: 4, rank: 3, label: 'e4' },
  { file: 3, rank: 4, label: 'd5' },
  { file: 4, rank: 4, label: 'e5' },
  { file: 0, rank: 7, label: 'a8' },
  { file: 7, rank: 7, label: 'h8' },
];

export const INITIAL_CHATURANGA_FEN = 'ragmkgar/pppppppp/8/8/8/8/PPPPPPPP/RAGMKGAR w - - 0 1';

export function isAshtapadaMarked(file: number, rank: number): boolean {
  return (
    (file === 0 && rank === 0) ||
    (file === 7 && rank === 0) ||
    (file === 3 && rank === 3) ||
    (file === 4 && rank === 3) ||
    (file === 3 && rank === 4) ||
    (file === 4 && rank === 4) ||
    (file === 0 && rank === 7) ||
    (file === 7 && rank === 7)
  );
}

export function squareToCoords(squareStr: string): Square {
  const file = squareStr.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = parseInt(squareStr[1], 10) - 1;
  return { file, rank };
}

export function coordsToSquare(sq: Square): string {
  const fileChar = String.fromCharCode('a'.charCodeAt(0) + sq.file);
  const rankChar = (sq.rank + 1).toString();
  return `${fileChar}${rankChar}`;
}

export function isWithinBoard(file: number, rank: number): boolean {
  return file >= 0 && file < 8 && rank >= 0 && rank < 8;
}

export function pieceNotationSymbol(type: PieceType): string {
  switch (type) {
    case 'raja': return 'R';
    case 'mantri': return 'M';
    case 'gaja': return 'G';
    case 'ashva': return 'A';
    case 'ratha': return 'Rh';
    case 'padati': return '';
  }
}

let pieceCounter = 1;
export function createPiece(type: PieceType, color: PieceColor): Piece {
  return {
    type,
    color,
    id: `${color}-${type}-${pieceCounter++}`,
  };
}

export function parseFen(fen: string): GameState {
  const parts = fen.trim().split(' ');
  const boardStr = parts[0];
  const turn = (parts[1] === 'b' ? 'b' : 'w') as PieceColor;

  const board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  const ranks = boardStr.split('/');

  // FEN ranks are listed from 8 down to 1
  for (let r = 0; r < 8; r++) {
    const rankIndex = 7 - r;
    const rankStr = ranks[r] || '8';
    let fileIndex = 0;

    for (let i = 0; i < rankStr.length; i++) {
      const char = rankStr[i];
      if (char >= '1' && char <= '8') {
        fileIndex += parseInt(char, 10);
      } else {
        const isUpper = char === char.toUpperCase();
        const color: PieceColor = isUpper ? 'w' : 'b';
        const lowerChar = char.toLowerCase();

        let type: PieceType = 'padati';
        if (lowerChar === 'r') type = 'ratha';
        else if (lowerChar === 'a') type = 'ashva';
        else if (lowerChar === 'g') type = 'gaja';
        else if (lowerChar === 'm') type = 'mantri';
        else if (lowerChar === 'k') type = 'raja';
        else if (lowerChar === 'p') type = 'padati';

        board[rankIndex][fileIndex] = createPiece(type, color);
        fileIndex++;
      }
    }
  }

  const initialCheck = isKingInCheck(board, turn);

  return {
    board,
    turn,
    moveHistory: [],
    capturedPieces: { w: [], b: [] },
    status: 'active',
    winner: null,
    isCheck: initialCheck.inCheck,
    checkingSquare: initialCheck.checkingSquare,
    lastMove: null,
    halfMoves: 0,
  };
}

export function createInitialGameState(): GameState {
  return parseFen(INITIAL_CHATURANGA_FEN);
}

export function cloneBoard(board: (Piece | null)[][]): (Piece | null)[][] {
  return board.map(row => row.map(p => p ? { ...p } : null));
}

export function cloneGameState(state: GameState): GameState {
  return {
    board: cloneBoard(state.board),
    turn: state.turn,
    moveHistory: [...state.moveHistory],
    capturedPieces: {
      w: [...state.capturedPieces.w],
      b: [...state.capturedPieces.b],
    },
    status: state.status,
    winner: state.winner,
    isCheck: state.isCheck,
    checkingSquare: state.checkingSquare ? { ...state.checkingSquare } : null,
    lastMove: state.lastMove ? { ...state.lastMove } : null,
    halfMoves: state.halfMoves,
  };
}

/**
 * Finds the Raja position for the given color.
 */
export function findRaja(board: (Piece | null)[][], color: PieceColor): Square | null {
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (piece && piece.type === 'raja' && piece.color === color) {
        return { file: f, rank: r };
      }
    }
  }
  return null;
}

/**
 * Generates pseudo-legal moves for a specific piece at (fromFile, fromRank).
 * Does not check if the move leaves the own Raja in check.
 */
export function getPseudoLegalMoves(
  board: (Piece | null)[][],
  fromFile: number,
  fromRank: number
): Move[] {
  const piece = board[fromRank][fromFile];
  if (!piece) return [];

  const moves: Move[] = [];
  const from: Square = { file: fromFile, rank: fromRank };
  const color = piece.color;
  const opponentColor: PieceColor = color === 'w' ? 'b' : 'w';

  switch (piece.type) {
    case 'raja': {
      // 1 step in any 8 directions (orthogonal or diagonal)
      const deltas = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
      ];
      for (const [df, dr] of deltas) {
        const tf = fromFile + df;
        const tr = fromRank + dr;
        if (isWithinBoard(tf, tr)) {
          const target = board[tr][tf];
          if (!target || target.color === opponentColor) {
            moves.push({
              from,
              to: { file: tf, rank: tr },
              piece,
              captured: target || undefined,
            });
          }
        }
      }
      break;
    }

    case 'mantri': {
      // 1 step diagonally in any direction (4 diagonal steps)
      const deltas = [
        [-1, -1], [-1, 1],
        [1, -1],  [1, 1]
      ];
      for (const [df, dr] of deltas) {
        const tf = fromFile + df;
        const tr = fromRank + dr;
        if (isWithinBoard(tf, tr)) {
          const target = board[tr][tf];
          if (!target || target.color === opponentColor) {
            moves.push({
              from,
              to: { file: tf, rank: tr },
              piece,
              captured: target || undefined,
            });
          }
        }
      }
      break;
    }

    case 'gaja': {
      // 2 steps diagonally, jumping over any intervening piece!
      const deltas = [
        [-2, -2], [-2, 2],
        [2, -2],  [2, 2]
      ];
      for (const [df, dr] of deltas) {
        const tf = fromFile + df;
        const tr = fromRank + dr;
        if (isWithinBoard(tf, tr)) {
          const target = board[tr][tf];
          if (!target || target.color === opponentColor) {
            moves.push({
              from,
              to: { file: tf, rank: tr },
              piece,
              captured: target || undefined,
            });
          }
        }
      }
      break;
    }

    case 'ashva': {
      // Standard Knight leap (2 and 1)
      const deltas = [
        [-2, -1], [-2, 1],
        [-1, -2], [-1, 2],
        [1, -2],  [1, 2],
        [2, -1],  [2, 1]
      ];
      for (const [df, dr] of deltas) {
        const tf = fromFile + df;
        const tr = fromRank + dr;
        if (isWithinBoard(tf, tr)) {
          const target = board[tr][tf];
          if (!target || target.color === opponentColor) {
            moves.push({
              from,
              to: { file: tf, rank: tr },
              piece,
              captured: target || undefined,
            });
          }
        }
      }
      break;
    }

    case 'ratha': {
      // Orthogonal slider
      const directions = [
        [0, 1], [0, -1], [1, 0], [-1, 0]
      ];
      for (const [df, dr] of directions) {
        let tf = fromFile + df;
        let tr = fromRank + dr;
        while (isWithinBoard(tf, tr)) {
          const target = board[tr][tf];
          if (!target) {
            moves.push({
              from,
              to: { file: tf, rank: tr },
              piece,
            });
          } else {
            if (target.color === opponentColor) {
              moves.push({
                from,
                to: { file: tf, rank: tr },
                piece,
                captured: target,
              });
            }
            break; // Slider stopped by piece
          }
          tf += df;
          tr += dr;
        }
      }
      break;
    }

    case 'padati': {
      // Moves 1 step forward without capture. No double step!
      const forwardDir = color === 'w' ? 1 : -1;
      const promotionRank = color === 'w' ? 7 : 0;

      const forwardRank = fromRank + forwardDir;
      if (isWithinBoard(fromFile, forwardRank) && !board[forwardRank][fromFile]) {
        const isPromotion = forwardRank === promotionRank;
        moves.push({
          from,
          to: { file: fromFile, rank: forwardRank },
          piece,
          isPromotion,
          promotionPiece: isPromotion ? 'mantri' : undefined,
        });
      }

      // Captures 1 step diagonally forward
      const captureFiles = [fromFile - 1, fromFile + 1];
      for (const cf of captureFiles) {
        if (isWithinBoard(cf, forwardRank)) {
          const target = board[forwardRank][cf];
          if (target && target.color === opponentColor) {
            const isPromotion = forwardRank === promotionRank;
            moves.push({
              from,
              to: { file: cf, rank: forwardRank },
              piece,
              captured: target,
              isPromotion,
              promotionPiece: isPromotion ? 'mantri' : undefined,
            });
          }
        }
      }
      break;
    }
  }

  return moves;
}

/**
 * Checks if the given square is attacked by any piece of attackerColor.
 */
export function isSquareAttacked(
  board: (Piece | null)[][],
  sq: Square,
  attackerColor: PieceColor
): { attacked: boolean; attackerSquare: Square | null } {
  // Check Ratha (orthogonal sliders)
  const orthoDirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  for (const [df, dr] of orthoDirs) {
    let f = sq.file + df;
    let r = sq.rank + dr;
    while (isWithinBoard(f, r)) {
      const p = board[r][f];
      if (p) {
        if (p.color === attackerColor && (p.type === 'ratha' || (Math.abs(f - sq.file) + Math.abs(r - sq.rank) === 1 && p.type === 'raja'))) {
          return { attacked: true, attackerSquare: { file: f, rank: r } };
        }
        break;
      }
      f += df;
      r += dr;
    }
  }

  // Check Raja (adjacent 1 square)
  const rajaDeltas = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];
  for (const [df, dr] of rajaDeltas) {
    const f = sq.file + df;
    const r = sq.rank + dr;
    if (isWithinBoard(f, r)) {
      const p = board[r][f];
      if (p && p.color === attackerColor && p.type === 'raja') {
        return { attacked: true, attackerSquare: { file: f, rank: r } };
      }
    }
  }

  // Check Mantri (1 step diagonally)
  const mantriDeltas = [
    [-1, -1], [-1, 1],
    [1, -1],  [1, 1]
  ];
  for (const [df, dr] of mantriDeltas) {
    const f = sq.file + df;
    const r = sq.rank + dr;
    if (isWithinBoard(f, r)) {
      const p = board[r][f];
      if (p && p.color === attackerColor && p.type === 'mantri') {
        return { attacked: true, attackerSquare: { file: f, rank: r } };
      }
    }
  }

  // Check Gaja (2 steps diagonally leap)
  const gajaDeltas = [
    [-2, -2], [-2, 2],
    [2, -2],  [2, 2]
  ];
  for (const [df, dr] of gajaDeltas) {
    const f = sq.file + df;
    const r = sq.rank + dr;
    if (isWithinBoard(f, r)) {
      const p = board[r][f];
      if (p && p.color === attackerColor && p.type === 'gaja') {
        return { attacked: true, attackerSquare: { file: f, rank: r } };
      }
    }
  }

  // Check Ashva (Knight leap)
  const ashvaDeltas = [
    [-2, -1], [-2, 1],
    [-1, -2], [-1, 2],
    [1, -2],  [1, 2],
    [2, -1],  [2, 1]
  ];
  for (const [df, dr] of ashvaDeltas) {
    const f = sq.file + df;
    const r = sq.rank + dr;
    if (isWithinBoard(f, r)) {
      const p = board[r][f];
      if (p && p.color === attackerColor && p.type === 'ashva') {
        return { attacked: true, attackerSquare: { file: f, rank: r } };
      }
    }
  }

  // Check Padati (captures 1 step diagonally forward from pawn's perspective)
  // If sq is attacked by an enemy pawn, that pawn must be located 1 step backward relative to pawn direction
  // White pawn moves rank +1, so an attacker White pawn must be at sq.rank - 1
  // Black pawn moves rank -1, so an attacker Black pawn must be at sq.rank + 1
  const pawnPushedFromRank = attackerColor === 'w' ? sq.rank - 1 : sq.rank + 1;
  for (const f of [sq.file - 1, sq.file + 1]) {
    if (isWithinBoard(f, pawnPushedFromRank)) {
      const p = board[pawnPushedFromRank][f];
      if (p && p.color === attackerColor && p.type === 'padati') {
        return { attacked: true, attackerSquare: { file: f, rank: pawnPushedFromRank } };
      }
    }
  }

  return { attacked: false, attackerSquare: null };
}

/**
 * Checks if the Raja of the specified color is currently in check.
 */
export function isKingInCheck(
  board: (Piece | null)[][],
  color: PieceColor
): { inCheck: boolean; checkingSquare: Square | null } {
  const rajaPos = findRaja(board, color);
  if (!rajaPos) {
    // Raja was captured (terminal state)
    return { inCheck: true, checkingSquare: null };
  }
  const opponent: PieceColor = color === 'w' ? 'b' : 'w';
  const attackInfo = isSquareAttacked(board, rajaPos, opponent);
  return {
    inCheck: attackInfo.attacked,
    checkingSquare: attackInfo.attackerSquare,
  };
}

/**
 * Returns all strictly legal moves for the given side.
 * A move is legal if executing it leaves the side's Raja safe (not in check).
 */
export function getAllLegalMoves(state: GameState): Move[] {
  const moves: Move[] = [];
  const color = state.turn;

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = state.board[r][f];
      if (piece && piece.color === color) {
        const pseudoMoves = getPseudoLegalMoves(state.board, f, r);
        for (const move of pseudoMoves) {
          // Simulate the move
          const nextBoard = cloneBoard(state.board);
          nextBoard[move.to.rank][move.to.file] = move.isPromotion
            ? createPiece('mantri', color)
            : { ...piece };
          nextBoard[move.from.rank][move.from.file] = null;

          // Check if own king is in check
          const checkState = isKingInCheck(nextBoard, color);
          if (!checkState.inCheck) {
            // Annotate standard algebraic notation (SAN)
            const san = generateSan(state.board, move, checkState.inCheck);
            moves.push({
              ...move,
              san,
            });
          }
        }
      }
    }
  }

  return moves;
}

/**
 * Generates Chaturanga algebraic notation string for a move.
 */
export function generateSan(
  board: (Piece | null)[][],
  move: Move,
  causesCheck: boolean
): string {
  const piece = move.piece;
  const isCapture = !!move.captured;
  const toStr = coordsToSquare(move.to);
  const fromStr = coordsToSquare(move.from);

  let prefix = pieceNotationSymbol(piece.type);

  if (piece.type === 'padati') {
    if (isCapture) {
      prefix = fromStr[0]; // e.g., 'd' in dxe4
    }
  }

  let notation = `${prefix}${isCapture ? 'x' : ''}${toStr}`;

  if (move.isPromotion) {
    notation += '=M';
  }

  if (causesCheck) {
    notation += '+';
  }

  return notation;
}

/**
 * Counts non-Raja pieces for a given color.
 */
export function countNonRajaPieces(board: (Piece | null)[][], color: PieceColor): number {
  let count = 0;
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const p = board[r][f];
      if (p && p.color === color && p.type !== 'raja') {
        count++;
      }
    }
  }
  return count;
}

/**
 * Applies a move to the game state and evaluates win conditions strictly per Chaturanga rules.
 */
export function makeMove(state: GameState, move: Move): GameState {
  const next = cloneGameState(state);
  const movingPiece = next.board[move.from.rank][move.from.file];
  if (!movingPiece) return state;

  const targetSquarePiece = next.board[move.to.rank][move.to.file];

  // Capture recording
  if (targetSquarePiece) {
    if (targetSquarePiece.color === 'b') {
      next.capturedPieces.w.push(targetSquarePiece);
    } else {
      next.capturedPieces.b.push(targetSquarePiece);
    }
  }

  // Place piece on target square (handling Padati promotion to Mantri)
  if (move.isPromotion) {
    next.board[move.to.rank][move.to.file] = createPiece('mantri', state.turn);
  } else {
    next.board[move.to.rank][move.to.file] = { ...movingPiece };
  }
  next.board[move.from.rank][move.from.file] = null;

  // Next player's turn
  const nextTurn: PieceColor = state.turn === 'w' ? 'b' : 'w';
  next.turn = nextTurn;
  next.lastMove = move;
  next.halfMoves += 1;

  // Check state of next player
  const checkInfo = isKingInCheck(next.board, nextTurn);
  next.isCheck = checkInfo.inCheck;
  next.checkingSquare = checkInfo.checkingSquare;

  // Check if enemy Raja was captured directly (fallback edge-case)
  const enemyRaja = findRaja(next.board, nextTurn);
  if (!enemyRaja) {
    next.status = 'checkmate';
    next.winner = state.turn;
    next.moveHistory.push({ ...move, san: (move.san || coordsToSquare(move.to)) + '#' });
    return next;
  }

  // Check for Bare King (Nirvriddhi)
  const nextTurnNonKingCount = countNonRajaPieces(next.board, nextTurn);
  const currentTurnNonKingCount = countNonRajaPieces(next.board, state.turn);

  if (nextTurnNonKingCount === 0) {
    // Opponent has only Raja left!
    // Historical Chaturanga rule: If opponent can capture the last remaining piece on the immediate next turn,
    // resulting in both Kings bared, it is a DRAW.
    // Check if opponent can immediately capture currentTurn's last non-king piece:
    if (currentTurnNonKingCount === 1) {
      // Find that 1 remaining piece
      let lastPieceSq: Square | null = null;
      for (let r = 0; r < 8; r++) {
        for (let f = 0; f < 8; f++) {
          const p = next.board[r][f];
          if (p && p.color === state.turn && p.type !== 'raja') {
            lastPieceSq = { file: f, rank: r };
            break;
          }
        }
      }

      if (lastPieceSq) {
        // Can opponent's Raja capture this square legally?
        const oppLegalMoves = getAllLegalMoves(next);
        const canCounterBare = oppLegalMoves.some(
          m => m.to.file === lastPieceSq!.file && m.to.rank === lastPieceSq!.rank
        );

        if (!canCounterBare) {
          next.status = 'bare_king_win';
          next.winner = state.turn;
          next.moveHistory.push({ ...move, san: (move.san || coordsToSquare(move.to)) + ' (BK)' });
          return next;
        }
        // If they can counter-bare, let them play the turn to see if they do!
      }
    } else if (currentTurnNonKingCount === 0) {
      // Both Kings are bared sequentially!
      next.status = 'bare_king_draw';
      next.winner = 'draw';
      next.moveHistory.push({ ...move, san: (move.san || coordsToSquare(move.to)) + ' (=BK)' });
      return next;
    } else {
      // More than 1 non-king piece left, opponent cannot possibly bare both kings next move -> Immediate Bare King Victory!
      next.status = 'bare_king_win';
      next.winner = state.turn;
      next.moveHistory.push({ ...move, san: (move.san || coordsToSquare(move.to)) + ' (BK)' });
      return next;
    }
  }

  // Calculate legal moves for next turn
  const legalMoves = getAllLegalMoves(next);

  if (legalMoves.length === 0) {
    if (next.isCheck) {
      // Checkmate! The player who just moved wins.
      next.status = 'checkmate';
      next.winner = state.turn;
      const formattedMove = { ...move, san: (move.san || coordsToSquare(move.to)).replace('+', '#') };
      next.moveHistory.push(formattedMove);
      return next;
    } else {
      // Stalemate! In Chaturanga, the STALEMATED player WINS!
      // "Stalemate (stalemated player wins)"
      next.status = 'stalemate';
      next.winner = nextTurn; // Stalemated player wins!
      next.moveHistory.push({ ...move, san: (move.san || coordsToSquare(move.to)) + ' (Stalemate)' });
      return next;
    }
  }

  // If in check, adjust SAN to include '+'
  let finalSan = move.san || coordsToSquare(move.to);
  if (next.isCheck && !finalSan.includes('+') && !finalSan.includes('#')) {
    finalSan += '+';
  }

  next.moveHistory.push({ ...move, san: finalSan });
  return next;
}
