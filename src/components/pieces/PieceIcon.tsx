import React from 'react';
import { Piece, PieceColor, PieceType } from '../../lib/chaturanga/types';

interface PieceIconProps {
  piece: Piece;
  className?: string;
}

export const PieceIcon: React.FC<PieceIconProps> = ({ piece, className = 'w-full h-full' }) => {
  const isWhite = piece.color === 'w';

  // Palette: Ivory/Gold for White, Obsidian/Crimson-Bronze for Black
  const fill = isWhite ? '#fef3c7' : '#1e1b18'; // Warm Amber-50 vs Deep Obsidian
  const stroke = isWhite ? '#78350f' : '#f59e0b'; // Amber-900 vs Warm Amber-500
  const detailStroke = isWhite ? '#92400e' : '#fbbf24';
  const accentFill = isWhite ? '#fbbf24' : '#b45309';

  switch (piece.type) {
    case 'raja':
      // King with royal Indian Chhatra (canopy umbrella) and crown
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Base */}
          <path d="M22 84 H78 V88 C78 90 76 92 74 92 H26 C24 92 22 90 22 88 Z" fill={fill} stroke={stroke} strokeWidth="3" />
          {/* Robe/Body */}
          <path d="M28 84 C30 65 38 48 42 42 H58 C62 48 70 65 72 84 Z" fill={fill} stroke={stroke} strokeWidth="3" />
          {/* Royal Sash */}
          <path d="M42 42 Q50 60 58 42 Q50 75 42 84" fill={accentFill} opacity="0.6" stroke={detailStroke} strokeWidth="2" />
          {/* Royal Crown */}
          <path d="M35 42 L32 26 L42 32 L50 20 L58 32 L68 26 L65 42 Z" fill={fill} stroke={stroke} strokeWidth="3" />
          {/* Chhatra (Imperial Finial / Jewel) */}
          <circle cx="50" cy="15" r="5" fill={accentFill} stroke={stroke} strokeWidth="2.5" />
          <path d="M50 10 V5" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'mantri':
      // Minister / General with royal turban and dagger insignia
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Base */}
          <path d="M25 84 H75 V88 C75 90 73 92 71 92 H29 C27 92 25 90 25 88 Z" fill={fill} stroke={stroke} strokeWidth="3" />
          {/* Body */}
          <path d="M30 84 C33 66 40 50 44 45 H56 C60 50 67 66 70 84 Z" fill={fill} stroke={stroke} strokeWidth="3" />
          {/* Royal General Cloak V */}
          <path d="M44 45 L50 65 L56 45" stroke={detailStroke} strokeWidth="2.5" />
          {/* Turban Dome */}
          <ellipse cx="50" cy="35" rx="18" ry="14" fill={fill} stroke={stroke} strokeWidth="3" />
          <path d="M34 36 C42 42 58 42 66 36" stroke={detailStroke} strokeWidth="2.5" />
          {/* Turban Feather / Gem */}
          <path d="M50 21 Q55 12 50 8 Q45 12 50 21" fill={accentFill} stroke={stroke} strokeWidth="2" />
        </svg>
      );

    case 'gaja':
      // Elephant with distinctive tusks and battle howdah
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Base */}
          <path d="M20 84 H80 V88 C80 90 78 92 76 92 H24 C22 92 20 90 20 88 Z" fill={fill} stroke={stroke} strokeWidth="3" />
          {/* Elephant Body & Head */}
          <path
            d="M30 84 C30 68 32 54 38 42 C42 34 52 28 64 30 C72 32 78 40 78 50 C78 62 76 72 75 84 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="3"
          />
          {/* Trunk curling down */}
          <path
            d="M38 42 C34 46 26 55 27 68 C27.5 73 32 73 34 69 C36 63 36 56 42 50"
            fill={fill}
            stroke={stroke}
            strokeWidth="2.5"
          />
          {/* Battle Tusk */}
          <path d="M34 58 C32 62 23 66 18 64 C22 61 28 57 32 56 Z" fill="#fff" stroke={stroke} strokeWidth="2" />
          {/* Elephant Ear */}
          <path d="M52 36 C58 38 62 46 60 55 C57 60 52 61 48 57 Z" fill={accentFill} opacity="0.7" stroke={detailStroke} strokeWidth="2" />
          {/* Elephant Eye */}
          <circle cx="44" cy="40" r="2.5" fill={stroke} />
          {/* Howdah / Rug */}
          <path d="M46 28 H66 V35 H46 Z" fill={accentFill} stroke={stroke} strokeWidth="2" />
        </svg>
      );

    case 'ashva':
      // Horse (Cavalry)
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Base */}
          <path d="M22 84 H78 V88 C78 90 76 92 74 92 H26 C24 92 22 90 22 88 Z" fill={fill} stroke={stroke} strokeWidth="3" />
          {/* Horse Neck and Head */}
          <path
            d="M30 84 C30 68 32 55 28 46 C24 38 22 35 25 32 C28 29 36 33 40 28 C43 24 45 16 52 16 C55 16 56 19 56 22 C59 21 64 22 64 26 C64 30 58 36 62 48 C66 60 70 70 72 84 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="3"
          />
          {/* Mane spikes */}
          <path d="M56 22 L62 25 M60 32 L66 35 M62 42 L68 45 M65 52 L71 55" stroke={detailStroke} strokeWidth="2.5" strokeLinecap="round" />
          {/* Horse Eye */}
          <circle cx="36" cy="33" r="2.5" fill={stroke} />
          {/* Bridle */}
          <path d="M28 40 L38 32 M38 32 L46 45" stroke={accentFill} strokeWidth="2" />
        </svg>
      );

    case 'ratha':
      // Chariot with fortified tower & ancient spoked wheel
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Base */}
          <path d="M22 84 H78 V88 C78 90 76 92 74 92 H26 C24 92 22 90 22 88 Z" fill={fill} stroke={stroke} strokeWidth="3" />
          {/* Chariot Body */}
          <path d="M28 84 V52 H72 V84 Z" fill={fill} stroke={stroke} strokeWidth="3" />
          {/* Chariot Crenellations (Tower Turret) */}
          <path d="M26 52 V30 H36 V38 H44 V30 H56 V38 H64 V30 H74 V52 Z" fill={fill} stroke={stroke} strokeWidth="3" />
          {/* Chariot Spoked Wheel Emblem */}
          <circle cx="50" cy="68" r="11" fill="none" stroke={stroke} strokeWidth="2.5" />
          <circle cx="50" cy="68" r="3" fill={accentFill} stroke={stroke} strokeWidth="1.5" />
          <path d="M50 57 V79 M39 68 H61 M42 60 L58 76 M42 76 L58 60" stroke={detailStroke} strokeWidth="1.8" />
        </svg>
      );

    case 'padati':
      // Foot Soldier / Infantry with spear helmet and shield
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Base */}
          <path d="M28 84 H72 V88 C72 90 70 92 68 92 H32 C30 92 28 90 28 88 Z" fill={fill} stroke={stroke} strokeWidth="3" />
          {/* Body */}
          <path d="M34 84 C36 68 42 56 45 52 H55 C58 56 64 68 66 84 Z" fill={fill} stroke={stroke} strokeWidth="3" />
          {/* Shield Emblem */}
          <ellipse cx="50" cy="68" rx="8" ry="10" fill={accentFill} opacity="0.6" stroke={detailStroke} strokeWidth="2" />
          {/* Round Soldier Helmet */}
          <circle cx="50" cy="38" r="13" fill={fill} stroke={stroke} strokeWidth="3" />
          {/* Spear Tip Finial */}
          <path d="M50 25 L50 16 L53 22 L50 25 Z" fill={accentFill} stroke={stroke} strokeWidth="1.5" />
        </svg>
      );
  }
};
