import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Award,
  BookOpen,
  CheckCircle,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  RefreshCw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ACADEMY_MODULES } from '../../lib/chaturanga/lessons';
import { LessonStep } from '../../lib/chaturanga/types';
import { useGameStore } from '../../store/gameStore';

export const AcademyView: React.FC = () => {
  const {
    activeLesson,
    lessonCompleted,
    lessonError,
    startLesson,
    resetActiveLesson,
    nextLesson,
  } = useGameStore();

  const [showHint, setShowHint] = useState<boolean>(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  // Initialize with the first lesson if none is active
  useEffect(() => {
    if (!activeLesson && ACADEMY_MODULES[0]?.lessons[0]) {
      startLesson(ACADEMY_MODULES[0].lessons[0]);
    }
  }, [activeLesson, startLesson]);

  // When lessonCompleted changes to true, trigger confetti and record progress
  useEffect(() => {
    if (lessonCompleted && activeLesson) {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
      });

      setCompletedLessonIds(prev => (prev.includes(activeLesson.id) ? prev : [...prev, activeLesson.id]));
      setShowHint(false);
    }
  }, [lessonCompleted, activeLesson]);

  if (!activeLesson) return null;

  return (
    <div className="flex flex-col gap-4 text-neutral-100">
      {/* Lesson Header Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
              <BookOpen className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-300">
              Interactive Academy
            </span>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            {completedLessonIds.length} / {ACADEMY_MODULES.flatMap(m => m.lessons).length} Completed
          </span>
        </div>

        <h2 className="text-lg font-serif font-bold text-amber-100 mb-1">
          {activeLesson.title}
        </h2>
        <p className="text-xs text-neutral-300 leading-relaxed">
          {activeLesson.instructions}
        </p>

        {/* Historical Context Lore Callout */}
        <div className="mt-3 p-3 bg-amber-950/20 border border-amber-500/20 rounded-lg text-xs text-amber-200/90 leading-relaxed flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-300">Historical Lore: </span>
            {activeLesson.historicalContext}
          </div>
        </div>

        {/* Error or Hint Callouts */}
        {lessonError && (
          <div className="mt-3 p-2.5 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{lessonError}</span>
          </div>
        )}

        {showHint && !lessonCompleted && (
          <div className="mt-3 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{activeLesson.hint}</span>
          </div>
        )}

        {/* Lesson Success Celebratory Banner */}
        {lessonCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-xs text-emerald-200"
          >
            <div className="flex items-center gap-2 font-bold text-emerald-300 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span>Drill Mastered!</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-200/90 mb-3">
              {activeLesson.successMessage}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={nextLesson}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs shadow transition-colors"
              >
                <span>Next Lesson</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={resetActiveLesson}
                className="py-1.5 px-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs font-medium transition-colors"
                title="Retry lesson"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Controls when not yet completed */}
        {!lessonCompleted && (
          <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-neutral-800">
            <button
              onClick={() => setShowHint(prev => !prev)}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs font-medium transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
            </button>

            <button
              onClick={resetActiveLesson}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-neutral-400" />
              <span>Reset Board</span>
            </button>
          </div>
        )}
      </div>

      {/* Curriculum Syllabus Modules List */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-lg">
        <h3 className="font-serif font-bold text-sm text-amber-200 mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Curriculum Modules</span>
        </h3>

        <div className="space-y-3">
          {ACADEMY_MODULES.map(module => (
            <div key={module.id} className="border border-neutral-800/80 rounded-lg p-2.5 bg-neutral-950/50">
              <div className="font-semibold text-xs text-neutral-200 mb-0.5">{module.title}</div>
              <p className="text-[11px] text-neutral-400 mb-2">{module.description}</p>

              <div className="space-y-1">
                {module.lessons.map(lesson => {
                  const isActive = activeLesson.id === lesson.id;
                  const isDone = completedLessonIds.includes(lesson.id);

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        startLesson(lesson);
                        setShowHint(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                        isActive
                          ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200 font-semibold'
                          : 'hover:bg-neutral-800/60 text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isDone ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-neutral-600 shrink-0" />
                        )}
                        <span className="truncate">{lesson.title}</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-neutral-500" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
