import { BookOpen, Check, ShieldAlert, Sparkles, Trophy } from 'lucide-react';
import React from 'react';

export const RulesModal: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 text-neutral-100 max-h-[85vh] overflow-y-auto pr-1">
      {/* Historical Origin Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
            <BookOpen className="w-4 h-4" />
          </span>
          <span className="text-xs uppercase tracking-wider font-semibold text-amber-300">
            Historical Origins
          </span>
        </div>
        <h2 className="text-lg font-serif font-bold text-amber-100 mb-2">
          Chaturanga (चतुरङ्ग) & The Sacred Ashtāpada
        </h2>
        <p className="text-xs text-neutral-300 leading-relaxed mb-3">
          Invented during the Gupta Empire in northern India around the 6th century CE, <strong>Chaturanga</strong> is the venerated ancestor of all modern chess variants (including Persian Shatranj, Western Chess, Chinese Xiangqi, and Japanese Shogi). The Sanskrit word <em>Chaturanga</em> translates to &ldquo;four limbs,&rdquo; symbolizing the quadrupartite division of the ancient Indian imperial army:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 bg-neutral-950/60 rounded-lg border border-neutral-800">
            <div className="text-base mb-0.5">🛡️</div>
            <div className="font-bold text-amber-200">Padati</div>
            <div className="text-[10px] text-neutral-400">Infantry (Foot Soldiers)</div>
          </div>
          <div className="p-2 bg-neutral-950/60 rounded-lg border border-neutral-800">
            <div className="text-base mb-0.5">🐎</div>
            <div className="font-bold text-amber-200">Ashva</div>
            <div className="text-[10px] text-neutral-400">Cavalry (War Horses)</div>
          </div>
          <div className="p-2 bg-neutral-950/60 rounded-lg border border-neutral-800">
            <div className="text-base mb-0.5">🐘</div>
            <div className="font-bold text-amber-200">Gaja</div>
            <div className="text-[10px] text-neutral-400">War Elephants</div>
          </div>
          <div className="p-2 bg-neutral-950/60 rounded-lg border border-neutral-800">
            <div className="text-base mb-0.5">🏰</div>
            <div className="font-bold text-amber-200">Ratha</div>
            <div className="text-[10px] text-neutral-400">Chariots</div>
          </div>
        </div>
      </div>

      {/* The Ashtāpada Board Lore */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-lg">
        <h3 className="font-serif font-bold text-sm text-amber-200 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>The Ashtāpada (अष्टापद) Board & Sacred Crosses</span>
        </h3>
        <p className="text-xs text-neutral-300 leading-relaxed mb-3">
          Chaturanga is played on an 8x8 uncheckered grid known as the <strong>Ashtāpada</strong>. Unlike modern checkered chessboards, the Ashtāpada features sacred diagonal cross-cut markings on eight specific squares:
        </p>
        <div className="p-2.5 bg-neutral-950/70 rounded-lg border border-amber-500/30 text-xs font-mono text-amber-300 flex items-center justify-between">
          <span>Marked Squares:</span>
          <span className="font-bold">a1, h1, d4, e4, d5, e5, a8, h8</span>
        </div>
        <p className="text-[11px] text-neutral-400 mt-2 leading-relaxed">
          These squares served as traditional sanctuaries in race games played on the board before Chaturanga was codified, and remain focal tactical strongpoints for controlling the center.
        </p>
      </div>

      {/* Piece Rules Comparison */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-lg">
        <h3 className="font-serif font-bold text-sm text-amber-200 mb-3 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Piece Mechanics vs Modern Chess</span>
        </h3>

        <div className="space-y-2.5 text-xs">
          <div className="p-2.5 bg-neutral-950/60 rounded-lg border border-neutral-800">
            <div className="font-bold text-amber-300 mb-1">Raja (King) vs Modern King</div>
            <p className="text-neutral-300 leading-relaxed">
              Moves 1 step in any direction. <strong className="text-amber-200">No castling</strong> exists in Chaturanga.
            </p>
          </div>

          <div className="p-2.5 bg-neutral-950/60 rounded-lg border border-neutral-800">
            <div className="font-bold text-amber-300 mb-1">Mantri (Minister / General) vs Modern Queen</div>
            <p className="text-neutral-300 leading-relaxed">
              Moves strictly <strong className="text-amber-200">1 step diagonally</strong> in any direction. It possesses none of the Queen’s long-range sliders!
            </p>
          </div>

          <div className="p-2.5 bg-neutral-950/60 rounded-lg border border-neutral-800">
            <div className="font-bold text-amber-300 mb-1">Gaja (Elephant / Alfil) vs Modern Bishop</div>
            <p className="text-neutral-300 leading-relaxed">
              Leaps <strong className="text-amber-200">exactly 2 steps diagonally</strong>, hopping cleanly over any intermediate piece! It cannot move 1 square. Crucially, a Gaja can only ever visit 8 squares on the board.
            </p>
          </div>

          <div className="p-2.5 bg-neutral-950/60 rounded-lg border border-neutral-800">
            <div className="font-bold text-amber-300 mb-1">Ashva (Horse) & Ratha (Chariot)</div>
            <p className="text-neutral-300 leading-relaxed">
              The Ashva retains the exact knight leap (L-shape). The Ratha moves orthogonally as far as unobstructed, matching modern Rooks.
            </p>
          </div>

          <div className="p-2.5 bg-neutral-950/60 rounded-lg border border-neutral-800">
            <div className="font-bold text-amber-300 mb-1">Padati (Foot Soldier / Pawn)</div>
            <p className="text-neutral-300 leading-relaxed">
              Moves strictly 1 step forward, captures 1 step diagonally forward. <strong className="text-amber-200">No 2-step first move, no en passant</strong>. Promotes strictly to a <strong className="text-amber-200">Mantri</strong> upon reaching the 8th rank.
            </p>
          </div>
        </div>
      </div>

      {/* Ancient Victory Conditions */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-lg">
        <h3 className="font-serif font-bold text-sm text-amber-200 mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Ancient Victory Conditions</span>
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-200">Checkmate / Raja Capture: </span>
              <span className="text-neutral-300">Leaving the enemy sovereign with no legal escape route.</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-200">Bare King (Nirvriddhi): </span>
              <span className="text-neutral-300">
                Capturing all non-King enemy pieces grants immediate victory! However, if the opponent can immediately counter-bare by capturing your last non-King piece on their next turn, the match is an honorable draw.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-200">Stalemate (Stalemated Player Wins!): </span>
              <span className="text-neutral-300">
                Unlike modern chess, if a player has no legal moves and is not in check, the <strong>stalemated player is declared the winner</strong>!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
