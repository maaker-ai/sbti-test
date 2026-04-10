'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { questions, specialQuestions, type Question } from '@/data/questions';
import { encodeResult } from '@/data/scoring';

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function TestPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animDir, setAnimDir] = useState<'in' | 'out' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Shuffle questions once on mount, insert drink_gate_q1 randomly
  const [shuffledQuestions] = useState<Question[]>(() => {
    const regularShuffled = shuffle([...questions]);
    const drinkQ1 = specialQuestions[0];
    const insertPos = Math.floor(Math.random() * (regularShuffled.length + 1));
    regularShuffled.splice(insertPos, 0, drinkQ1);
    return regularShuffled;
  });

  // Visible questions depends on answers (drink_gate_q2 shows conditionally)
  const visibleQuestions = useMemo(() => {
    const visible = [...shuffledQuestions];
    if (answers['drink_gate_q1'] === 3) {
      const gateIndex = visible.findIndex((q) => q.id === 'drink_gate_q1');
      if (gateIndex !== -1) {
        visible.splice(gateIndex + 1, 0, specialQuestions[1]);
      }
    }
    return visible;
  }, [shuffledQuestions, answers]);

  const totalQuestions = visibleQuestions.length;
  const currentQuestion = visibleQuestions[currentIndex];
  const answeredCount = visibleQuestions.filter((q) => answers[q.id] !== undefined).length;
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  const allAnswered = answeredCount === totalQuestions && totalQuestions > 0;

  const goToQuestion = useCallback(
    (newIndex: number, direction: 'forward' | 'back') => {
      if (isTransitioning) return;
      if (newIndex < 0 || newIndex >= visibleQuestions.length) return;

      setIsTransitioning(true);
      setAnimDir('out');

      setTimeout(() => {
        setCurrentIndex(newIndex);
        setAnimDir('in');
        setTimeout(() => {
          setAnimDir(null);
          setIsTransitioning(false);
        }, 300);
      }, 180);
    },
    [isTransitioning, visibleQuestions.length]
  );

  const handleSelect = useCallback(
    (questionId: string, value: number) => {
      const newAnswers = { ...answers, [questionId]: value };

      // If drink_gate_q1 changed to not 3, remove drink_gate_q2 answer
      if (questionId === 'drink_gate_q1' && value !== 3) {
        delete newAnswers['drink_gate_q2'];
      }

      setAnswers(newAnswers);

      // Auto advance after selection
      setTimeout(() => {
        if (currentIndex < visibleQuestions.length - 1) {
          // Check if we need to recalc visibleQuestions for drink gate
          if (questionId === 'drink_gate_q1') {
            // Let React re-render with new answers first, then advance
            // The useMemo will recalculate visibleQuestions
          }
          goToQuestion(currentIndex + 1, 'forward');
        }
      }, 350);
    },
    [answers, currentIndex, visibleQuestions.length, goToQuestion]
  );

  const handleSubmit = useCallback(() => {
    if (!allAnswered) return;
    const encoded = encodeResult(answers);
    router.push(`/sbti/result?d=${encoded}`);
  }, [allAnswered, answers, router]);

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      goToQuestion(currentIndex - 1, 'back');
    }
  }, [currentIndex, goToQuestion]);

  if (!currentQuestion) return null;

  const animClass =
    animDir === 'in'
      ? 'animate-slide-in'
      : animDir === 'out'
        ? 'animate-slide-out'
        : '';

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={handleBack}
              disabled={currentIndex === 0}
              className="text-sm text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              上一题
            </button>
            <span className="text-sm text-zinc-400 font-mono">
              {currentIndex + 1} / {totalQuestions}
            </span>
            <span className="text-sm text-zinc-500">{Math.round(progress)}%</span>
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full progress-shimmer rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className={`w-full max-w-2xl ${animClass}`}>
          {/* Question badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              第 {currentIndex + 1} 题
            </span>
            {currentQuestion.special && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                补充题
              </span>
            )}
          </div>

          {/* Question text */}
          <h2 className="text-lg md:text-xl font-medium text-zinc-100 leading-relaxed mb-8">
            {currentQuestion.text}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((opt, i) => {
              const isSelected = answers[currentQuestion.id] === opt.value;
              const optionCode = ['A', 'B', 'C', 'D'][i] || String(i + 1);

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(currentQuestion.id, opt.value)}
                  className={`w-full flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 text-left min-h-[48px]
                    ${
                      isSelected
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-100'
                        : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-600 hover:bg-zinc-800/50 text-zinc-300'
                    }`}
                >
                  <span
                    className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors
                      ${
                        isSelected
                          ? 'bg-emerald-500 text-white'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                  >
                    {optionCode}
                  </span>
                  <span className="pt-0.5 text-sm md:text-base leading-relaxed">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom submit */}
      {allAnswered && (
        <div className="sticky bottom-0 bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-zinc-800/50 p-4 animate-fade-in-up">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleSubmit}
              className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-lg transition-all duration-300 glow-accent"
            >
              查看我的人格结果
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
