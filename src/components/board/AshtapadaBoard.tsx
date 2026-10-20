import { motion } from 'framer-motion';
import React, { useRef, useState } from 'react';
import { coordsToSquare, isAshtapadaMarked } from '../../lib/chaturanga/engine';
import { Move, Piece, Square } from '../../lib/chaturanga/types';
import { useGameStore } from '../../store/gameStore';
import { PieceIcon } from '../pieces/PieceIcon';

export const AshtapadaBoard: React.FC = () => {
  const {
    gameState,
    isBoardFlipped,
    selectedSquare,
    legalMovesForSelected,
    selectSquare,
    playMove,
    showCoachArrow,
    activeCoachFeedback,
  } = useGameStore();

  const [draggedSquare, setDraggedSquare] = useState<Square | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Determine ranks & files order based on board orientation
  const ranks = isBoardFlipped ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const files = isBoardFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  const handleSquareClick = (file: number, rank: number) => {
    // If a square is already selected, check if clicked square is a legal move
    if (selectedSquare) {
      const matchedMove = legalMovesForSelected.find(
        m => m.to.file === file && m.to.rank === rank
      );
      if (matchedMove) {
        playMove(matchedMove);
        return;
      }
    }

    // Otherwise, select the clicked piece (if friendly)
    const clickedPiece = gameState.board[rank][file];
    if (clickedPiece && clickedPiece.color === gameState.turn) {
      selectSquare({ file, rank });
    } else {
      selectSquare(null);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, file: number, rank: number) => {
    const piece = gameState.board[rank][file];
    if (!piece || piece.color !== gameState.turn) {
      e.preventDefault();
      return;
    }
    setDraggedSquare({ file, rank });
    selectSquare({ file, rank });
    e.dataTransfer.setData('text/plain', `${file},${rank}`);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, file: number, rank: number) => {
    e.preventDefault();
    if (!draggedSquare) return;

    const matchedMove = legalMovesForSelected.find(
      m => m.from.file === draggedSquare.file &&
           m.from.rank === draggedSquare.rank &&
           m.to.file === file &&
           m.to.rank === rank
    );

    if (matchedMove) {
      playMove(matchedMove);
    }
    setDraggedSquare(null);
  };

  // Coordinates helper for drawing SVG arrows
  const getSquareCenter = (file: number, rank: number) => {
    const colIdx = files.indexOf(file);
    const rowIdx = ranks.indexOf(rank);
    // Board is 8x8, each square is 12.5% x 12.5%
    const x = (colIdx + 0.5) * 12.5;
    const y = (rowIdx + 0.5) * 12.5;
    return { x, y };
  };

  const arrowMove = showCoachArrow && activeCoachFeedback ? activeCoachFeedback.bestMove : null;

  return (
    <div className="relative select-none aspect-square w-full max-w-[620px] rounded-xl overflow-hidden shadow-2xl border-4 border-amber-950/80 bg-[#b28b67] p-2 sm:p-3">
      {/* Board Frame / Inset */}
      <div
        ref={boardRef}
        className="relative grid grid-cols-8 grid-rows-8 w-full h-full rounded-lg overflow-hidden border-2 border-amber-900/40 bg-[#dfb88e]"
        style={{
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)',
        }}
      >
        {ranks.map(rank =>
          files.map(file => {
            const piece = gameState.board[rank][file];
            const isMarked = isAshtapadaMarked(file, rank);
            const isSelected = selectedSquare?.file === file && selectedSquare?.rank === rank;
            const isLastMoveFrom = gameState.lastMove?.from.file === file && gameState.lastMove?.from.rank === rank;
            const isLastMoveTo = gameState.lastMove?.to.file === file && gameState.lastMove?.to.rank === rank;
            const legalMove = legalMovesForSelected.find(m => m.to.file === file && m.to.rank === rank);
            const isKingInCheckSquare = gameState.isCheck && piece?.type === 'raja' && piece?.color === gameState.turn;

            // Ashtāpada is historically uncheckered, but subtle alternating grain helps depth
            const isAlternating = (file + rank) % 2 === 0;

            return (
              <div
                key={`${file}-${rank}`}
                onClick={() => handleSquareClick(file, rank)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, file, rank)}
                className={`relative flex items-center justify-center cursor-pointer transition-colors duration-150 border-[0.5px] border-amber-900/20 ${
                  isAlternating ? 'bg-[#dfb88e]/95' : 'bg-[#d6aa7c]/95'
                } ${isSelected ? 'bg-amber-400/50' : ''} ${
                  isLastMoveFrom || isLastMoveTo ? 'bg-amber-300/40' : ''
                } ${isKingInCheckSquare ? 'bg-rose-500/60 ring-4 ring-rose-600/80' : ''}`}
              >
                {/* Authentic Sacred Ashtāpada Diagonal Cross Marker */}
                {isMarked && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
                    <svg viewBox="0 0 40 40" className="w-full h-full p-1 stroke-amber-950" strokeWidth="2">
                      <line x1="4" y1="4" x2="36" y2="36" strokeLinecap="round" />
                      <line x1="36" y1="4" x2="4" y2="36" strokeLinecap="round" />
                      <circle cx="20" cy="20" r="3" fill="currentColor" className="text-amber-950" />
                    </svg>
                  </div>
                )}

                {/* Coordinate Markers on borders */}
                {file === files[0] && (
                  <span className="absolute top-0.5 left-1 text-[10px] sm:text-xs font-serif font-bold text-amber-950/70 pointer-events-none">
                    {rank + 1}
                  </span>
                )}
                {rank === ranks[7] && (
                  <span className="absolute bottom-0.5 right-1 text-[10px] sm:text-xs font-serif font-bold text-amber-950/70 pointer-events-none">
                    {String.fromCharCode('a'.charCodeAt(0) + file)}
                  </span>
                )}

                {/* Legal Move Indicators */}
                {legalMove && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    {piece ? (
                      // Capture ring
                      <div className="w-full h-full border-4 border-rose-500/70 rounded-full animate-pulse" />
                    ) : (
                      // Empty square movement dot
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-700/60 shadow-md ring-2 ring-emerald-300/60" />
                    )}
                  </div>
                )}

                {/* Piece Rendering */}
                {piece && (
                  <motion.div
                    layoutId={piece.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, file, rank)}
                    className="relative w-[82%] h-[82%] z-10 flex items-center justify-center filter drop-shadow-md cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <PieceIcon piece={piece} />
                  </motion.div>
                )}
              </div>
            );
          })
        )}

        {/* Coach Recommendation Arrow Overlay */}
        {arrowMove && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
            <defs>
              <marker
                id="coach-arrowhead"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="4"
                orient="auto"
              >
                <polygon points="0 0, 8 4, 0 8" fill="#10b981" />
              </marker>
            </defs>
            {(() => {
              const start = getSquareCenter(arrowMove.from.file, arrowMove.from.rank);
              const end = getSquareCenter(arrowMove.to.file, arrowMove.to.rank);
              return (
                <line
                  x1={`${start.x}%`}
                  y1={`${start.y}%`}
                  x2={`${end.x}%`}
                  y2={`${end.y}%`}
                  stroke="#10b981"
                  strokeWidth="5"
                  strokeLinecap="round"
                  markerEnd="url(#coach-arrowhead)"
                  opacity="0.9"
                  strokeDasharray="6 4"
                  className="animate-pulse"
                />
              );
            })()}
          </svg>
        )}
      </div>
    </div>
  );
};
