import { create } from 'zustand';
import {
  evaluatePosition,
  evaluateUserMove,
  getBotMove,
} from '../lib/chaturanga/ai';
import {
  coordsToSquare,
  createInitialGameState,
  getAllLegalMoves,
  getPseudoLegalMoves,
  isKingInCheck,
  makeMove,
  parseFen,
} from '../lib/chaturanga/engine';
import { ACADEMY_MODULES } from '../lib/chaturanga/lessons';
import {
  loadLearnedWeights,
  updateWeightsFromGame,
} from '../lib/chaturanga/rl';
import { soundFx } from '../lib/sound';
import {
  BotTier,
  EvaluationWeights,
  GameState,
  LessonStep,
  Move,
  MoveEvaluation,
  PieceColor,
  Square,
} from '../lib/chaturanga/types';

export interface CoachSettings {
  enabled: boolean;
  triggerOnInaccuracy: boolean;
  autoShowArrow: boolean;
}

interface GameStore {
  // Game session
  gameState: GameState;
  gameHistoryStates: GameState[]; // For undo/take back
  playerColor: PieceColor;
  botTier: BotTier;
  isBotThinking: boolean;
  isBoardFlipped: boolean;
  selectedSquare: Square | null;
  legalMovesForSelected: Move[];

  // Real-time evaluation & Coach
  currentEvaluation: number; // In centipawns (from White's perspective)
  moveEvaluations: MoveEvaluation[];
  activeCoachFeedback: MoveEvaluation | null;
  showCoachArrow: boolean;
  coachSettings: CoachSettings;

  // Active weights (updated dynamically or via TD-learning)
  weights: EvaluationWeights;

  // App Navigation & Modes
  activeTab: 'play' | 'academy' | 'selfplay' | 'rules';
  activeLesson: LessonStep | null;
  lessonCompleted: boolean;
  lessonError: string | null;

  // Audio & UI
  soundEnabled: boolean;

  // Actions
  startNewGame: (color?: PieceColor, tier?: BotTier) => void;
  selectSquare: (sq: Square | null) => void;
  playMove: (move: Move) => void;
  executeBotTurn: () => void;
  takeBackMove: () => void;
  applyBestMoveCorrection: () => void;
  dismissCoachFeedback: () => void;
  toggleCoachArrow: () => void;
  updateCoachSettings: (settings: Partial<CoachSettings>) => void;
  setBotTier: (tier: BotTier) => void;
  setPlayerColor: (color: PieceColor) => void;
  flipBoard: () => void;
  toggleSound: () => void;
  setActiveTab: (tab: 'play' | 'academy' | 'selfplay' | 'rules') => void;
  startLesson: (lesson: LessonStep) => void;
  resetActiveLesson: () => void;
  nextLesson: () => void;
  resignGame: () => void;
  setCustomWeights: (w: EvaluationWeights) => void;
}

export const useGameStore = create<GameStore>((set, get) => {
  const initialWeights = loadLearnedWeights();
  const initialGame = createInitialGameState();

  return {
    gameState: initialGame,
    gameHistoryStates: [initialGame],
    playerColor: 'w',
    botTier: 'scholar',
    isBotThinking: false,
    isBoardFlipped: false,
    selectedSquare: null,
    legalMovesForSelected: [],

    currentEvaluation: 0,
    moveEvaluations: [],
    activeCoachFeedback: null,
    showCoachArrow: false,
    coachSettings: {
      enabled: true,
      triggerOnInaccuracy: true,
      autoShowArrow: true,
    },

    weights: initialWeights,

    activeTab: 'play',
    activeLesson: null,
    lessonCompleted: false,
    lessonError: null,

    soundEnabled: true,

    startNewGame: (color = 'w', tier) => {
      const newGame = createInitialGameState();
      const currentTier = tier || get().botTier;

      set({
        gameState: newGame,
        gameHistoryStates: [newGame],
        playerColor: color,
        botTier: currentTier,
        isBotThinking: false,
        isBoardFlipped: color === 'b',
        selectedSquare: null,
        legalMovesForSelected: [],
        currentEvaluation: 0,
        moveEvaluations: [],
        activeCoachFeedback: null,
        showCoachArrow: false,
      });

      // If user chose to play as Black, trigger bot's opening move for White
      if (color === 'b') {
        setTimeout(() => {
          get().executeBotTurn();
        }, 500);
      }
    },

    selectSquare: (sq: Square | null) => {
      const { gameState, isBotThinking } = get();
      if (isBotThinking || gameState.status !== 'active') {
        set({ selectedSquare: null, legalMovesForSelected: [] });
        return;
      }

      if (!sq) {
        set({ selectedSquare: null, legalMovesForSelected: [] });
        return;
      }

      const piece = gameState.board[sq.rank][sq.file];
      if (!piece || piece.color !== gameState.turn) {
        set({ selectedSquare: null, legalMovesForSelected: [] });
        return;
      }

      // Filter all legal moves originating from this square
      const allLegal = getAllLegalMoves(gameState);
      const filtered = allLegal.filter(
        m => m.from.file === sq.file && m.from.rank === sq.rank
      );

      set({
        selectedSquare: sq,
        legalMovesForSelected: filtered,
      });
    },

    playMove: (move: Move) => {
      const {
        gameState,
        gameHistoryStates,
        playerColor,
        activeTab,
        activeLesson,
        coachSettings,
        weights,
        soundEnabled,
      } = get();

      // Audio feedback
      if (soundEnabled) {
        if (move.captured) {
          soundFx.playCapture();
        } else {
          soundFx.playMove();
        }
      }

      // Academy Mode validation logic
      if (activeTab === 'academy' && activeLesson) {
        const fromCoord = coordsToSquare(move.from);
        const toCoord = coordsToSquare(move.to);

        const expected = activeLesson.expectedMoves[0];
        const isMatch = expected && expected.from === fromCoord && expected.to === toCoord;

        if (isMatch) {
          const nextState = makeMove(gameState, move);
          if (soundEnabled) soundFx.playVictory();
          set({
            gameState: nextState,
            lessonCompleted: true,
            lessonError: null,
            selectedSquare: null,
            legalMovesForSelected: [],
          });
          return;
        } else {
          if (soundEnabled) soundFx.playMistake();
          set({
            lessonError: `Not quite! Expected ${expected ? `${expected.from} to ${expected.to}` : 'another move'}. ${activeLesson.hint}`,
            selectedSquare: null,
            legalMovesForSelected: [],
          });
          return;
        }
      }

      // Standard Match Move execution
      const isPlayerTurn = gameState.turn === playerColor;

      // Real-time evaluation pipeline for human player
      let evaluationInfo: MoveEvaluation | null = null;
      if (isPlayerTurn) {
        evaluationInfo = evaluateUserMove(gameState, move, 4, weights);
      }

      const nextState = makeMove(gameState, move);
      const newHistory = [...gameHistoryStates, nextState];

      // Check audio
      if (soundEnabled && nextState.isCheck) {
        soundFx.playCheck();
      }

      // Centipawn evaluation update for evaluation bar
      const newScore = evaluatePosition(nextState, weights);

      // Handle Coach feedback popup trigger
      let coachPopup: MoveEvaluation | null = null;
      let showArrow = false;

      if (
        isPlayerTurn &&
        coachSettings.enabled &&
        evaluationInfo &&
        (evaluationInfo.quality === 'mistake' ||
          evaluationInfo.quality === 'blunder' ||
          (coachSettings.triggerOnInaccuracy && evaluationInfo.quality === 'inaccuracy'))
      ) {
        coachPopup = evaluationInfo;
        showArrow = coachSettings.autoShowArrow;
        if (soundEnabled) soundFx.playMistake();
      }

      // Check if match finished -> Trigger TD-Learning update
      if (nextState.status !== 'active') {
        if (soundEnabled && nextState.winner === playerColor) {
          soundFx.playVictory();
        }
        let endWinner: 'w' | 'b' | 'draw' = 'draw';
        if (nextState.winner === 'w' || nextState.winner === 'b') {
          endWinner = nextState.winner;
        }
        const updatedWeights = updateWeightsFromGame(newHistory, endWinner, weights);
        set({ weights: updatedWeights });
      }

      set(state => ({
        gameState: nextState,
        gameHistoryStates: newHistory,
        selectedSquare: null,
        legalMovesForSelected: [],
        currentEvaluation: newScore,
        moveEvaluations: evaluationInfo
          ? [...state.moveEvaluations, evaluationInfo]
          : state.moveEvaluations,
        activeCoachFeedback: coachPopup,
        showCoachArrow: showArrow,
      }));

      // Trigger Bot turn if game is still active and it is bot's turn
      if (nextState.status === 'active' && nextState.turn !== playerColor) {
        set({ isBotThinking: true });
        // Realistic thinking pause (350ms - 750ms)
        setTimeout(() => {
          get().executeBotTurn();
        }, 450);
      }
    },

    executeBotTurn: () => {
      const { gameState, botTier, weights, soundEnabled } = get();
      if (gameState.status !== 'active') {
        set({ isBotThinking: false });
        return;
      }

      const { move } = getBotMove(gameState, botTier, weights);
      if (!move) {
        set({ isBotThinking: false });
        return;
      }

      // Audio
      if (soundEnabled) {
        if (move.captured) soundFx.playCapture();
        else soundFx.playMove();
      }

      const nextState = makeMove(gameState, move);
      const newHistory = [...get().gameHistoryStates, nextState];
      const newScore = evaluatePosition(nextState, weights);

      if (soundEnabled && nextState.isCheck) {
        soundFx.playCheck();
      }

      if (nextState.status !== 'active') {
        let endWinner: 'w' | 'b' | 'draw' = 'draw';
        if (nextState.winner === 'w' || nextState.winner === 'b') {
          endWinner = nextState.winner;
        }
        const updatedWeights = updateWeightsFromGame(newHistory, endWinner, weights);
        set({ weights: updatedWeights });
      }

      set({
        gameState: nextState,
        gameHistoryStates: newHistory,
        isBotThinking: false,
        currentEvaluation: newScore,
      });
    },

    takeBackMove: () => {
      const { gameHistoryStates, playerColor } = get();
      if (gameHistoryStates.length <= 1) return;

      // Revert 2 plies if playing vs bot, or 1 ply if it's currently bot's turn
      let targetIndex = gameHistoryStates.length - 1;
      const currentState = gameHistoryStates[targetIndex];

      if (currentState.turn === playerColor) {
        targetIndex = Math.max(0, targetIndex - 2);
      } else {
        targetIndex = Math.max(0, targetIndex - 1);
      }

      const revertedState = gameHistoryStates[targetIndex];
      const revertedHistory = gameHistoryStates.slice(0, targetIndex + 1);

      set({
        gameState: revertedState,
        gameHistoryStates: revertedHistory,
        selectedSquare: null,
        legalMovesForSelected: [],
        activeCoachFeedback: null,
        showCoachArrow: false,
        isBotThinking: false,
      });
    },

    applyBestMoveCorrection: () => {
      const { activeCoachFeedback, takeBackMove, playMove } = get();
      if (!activeCoachFeedback) return;

      const best = activeCoachFeedback.bestMove;
      takeBackMove();

      setTimeout(() => {
        playMove(best);
        set({ activeCoachFeedback: null, showCoachArrow: false });
      }, 150);
    },

    dismissCoachFeedback: () => {
      set({ activeCoachFeedback: null, showCoachArrow: false });
    },

    toggleCoachArrow: () => {
      set(state => ({ showCoachArrow: !state.showCoachArrow }));
    },

    updateCoachSettings: (newSettings: Partial<CoachSettings>) => {
      set(state => ({
        coachSettings: { ...state.coachSettings, ...newSettings },
      }));
    },

    setBotTier: (tier: BotTier) => {
      set({ botTier: tier });
    },

    setPlayerColor: (color: PieceColor) => {
      set({ playerColor: color, isBoardFlipped: color === 'b' });
    },

    flipBoard: () => {
      set(state => ({ isBoardFlipped: !state.isBoardFlipped }));
    },

    toggleSound: () => {
      const nextSound = !get().soundEnabled;
      soundFx.setMuted(!nextSound);
      set({ soundEnabled: nextSound });
    },

    setActiveTab: (tab: 'play' | 'academy' | 'selfplay' | 'rules') => {
      set({ activeTab: tab });
    },

    startLesson: (lesson: LessonStep) => {
      const lessonState = parseFen(lesson.initialFen);
      set({
        activeLesson: lesson,
        gameState: lessonState,
        gameHistoryStates: [lessonState],
        lessonCompleted: false,
        lessonError: null,
        selectedSquare: null,
        legalMovesForSelected: [],
        activeCoachFeedback: null,
        showCoachArrow: false,
        isBoardFlipped: lesson.playerColor === 'b',
      });
    },

    resetActiveLesson: () => {
      const { activeLesson } = get();
      if (activeLesson) {
        get().startLesson(activeLesson);
      }
    },

    nextLesson: () => {
      const { activeLesson } = get();
      if (!activeLesson) return;

      const allLessons = ACADEMY_MODULES.flatMap(m => m.lessons);
      const currentIndex = allLessons.findIndex(l => l.id === activeLesson.id);
      if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
        get().startLesson(allLessons[currentIndex + 1]);
      }
    },

    resignGame: () => {
      const { gameState, playerColor } = get();
      if (gameState.status !== 'active') return;

      const opponent: PieceColor = playerColor === 'w' ? 'b' : 'w';
      set(state => ({
        gameState: {
          ...state.gameState,
          status: 'resignation',
          winner: opponent,
        },
      }));
    },

    setCustomWeights: (w: EvaluationWeights) => {
      set({ weights: w });
    },
  };
});
