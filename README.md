# Chaturanga Academy (चतुरङ्ग विद्यालय)

> An interactive, production-ready web platform modeled after Chess.com, dedicated to preserving and teaching the ancient Indian game of **Chaturanga** — the 6th-century Gupta Empire ancestor of modern chess.

---

## 🌟 Key Features

### 1. Authentic Historical Engine & Ashtāpada Rules
- **Ashtāpada Board**: Uncheckered 8×8 grid with the 8 sacred cross-cut markings on `a1, h1, d4, e4, d5, e5, a8, h8`.
- **Raja (King)**: 1 step in any direction. No castling.
- **Mantri (Minister / General)**: Strictly 1 step diagonally in any direction. No orthogonal slides.
- **Gaja (Elephant / Alfil)**: Exactly 2 steps diagonally, hopping cleanly over intervening pieces. Can only ever visit 8 squares on the board.
- **Ashva (Horse / Cavalry)**: Standard Knight L-leap.
- **Ratha (Chariot)**: Standard Rook orthogonal slider.
- **Padati (Foot Soldier / Pawn)**: Strictly 1 step forward, captures 1 step diagonally forward. No initial 2-square double step, no en passant. Promotes strictly to a **Mantri** upon reaching the 8th rank.
- **Victory Conditions**:
  - **Checkmate / Raja Capture**.
  - **Bare King (Nirvriddhi)**: Stripping the opponent down to only their Raja grants an instant victory (drawn if both kings are bared sequentially).
  - **Stalemate**: In Chaturanga, a player with no legal moves who is not in check **wins the game**.

### 2. "The Guru" — Real-Time Interactive Coach
- Real-time move evaluation pipeline on every user ply.
- Centipawn delta calculation comparing the user's move to the minimax optimal line.
- Classification into **Best (!)**, **Good**, **Inaccuracy (?!)**, **Mistake (?)**, and **Blunder (??)**.
- Floating coach card featuring:
  - Severity badge and centipawn loss readout.
  - Plain-language tactical explanations referencing ancient quirks (e.g. Gaja blind spots, Mantri limited diagonals, Bare King threats).
  - **Show Arrow** overlay pointing from source to destination square.
  - **Take Back & Try Best Move** instant correction.

### 3. Self-Learning Adaptive Bots (Reinforcement Learning)
- **Minimax Search** with Alpha-Beta pruning, Transposition Tables (Zobrist hashing), Quiescence search, and MVV-LVA move ordering.
- **Dynamic Bot Tiers**:
  - **Novice** (*Sadhaka Arjun*): Depth 2, random blunder jitter, gentle introduction.
  - **Scholar** (*Pandit Varahamihira*): Depth 4, standard evaluation, solid tactical play.
  - **Ancient Master** (*Acharya Chanakya*): Depth 6, iterative deepening, aggressive Ashtāpada control and Bare King hunting.
- **Temporal Difference (TD) Weight Adaptation**:
  $$W_{t+1} = W_t + \alpha (R - V(s)) \nabla W$$
  Updates material weights, Ashtāpada control bonuses, and piece-square tables after every completed game and stores them in browser storage.
- **Self-Play Arena**: Simulate batches of 5 or 20 background games to inspect evolving win rates and policy weights live.

### 4. Interactive Academy Mode & Drills
- Curated curriculum across 3 modules:
  1. *The Four Wings of the Army* (Padati, Ashva, Gaja, Ratha).
  2. *The Power of the Mantri & Gaja* (Mantri reach, Gaja blind spots, promotion).
  3. *Ancient Endgames & Win Conditions* (Bare King victory, Stalemate triumph).
- Step-by-step interactive sandbox with confetti fanfare upon drill mastery.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, Framer Motion
- **Icons**: Lucide React
- **State Management**: Zustand
- **Audio**: Web Audio API (Zero-dependency real-time sound synthesizer)
- **Engine**: Pure TypeScript deterministic Chaturanga bitboard/array engine

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18 (Node 24 recommended)
- npm >= 9

### Installation
```bash
git clone https://github.com/your-username/chaturanga-academy.git
cd chaturanga-academy
npm install
```

### Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to experience the application.

### Running Engine Tests
```bash
npm run test:rules
```

### Production Build
```bash
npm run build
npm run start
```
