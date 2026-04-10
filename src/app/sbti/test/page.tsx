'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { questions, specialQuestions, type Question } from '@/data/questions';
import { encodeResult, computeResult, encodeShareUrl } from '@/data/scoring';

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
    const result = computeResult(answers);
    const shareCode = encodeShareUrl(result);
    router.push(`/sbti/result?r=${encodeURIComponent(shareCode)}`);
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
    <div className="min-h-dvh flex flex-col bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={handleBack}
              disabled={currentIndex === 0}
              className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1 min-h-[44px] min-w-[44px] justify-center"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              上一题
            </button>
            <span className="text-sm text-muted-foreground font-mono">
              {currentIndex + 1} / {totalQuestions}
            </span>
            <span className="text-sm text-secondary font-medium">{Math.round(progress)}%</span>
          </div>
          {/* Progress bar with glow */}
          <div className="h-1.5 bg-muted rounded-full overflow-hidden relative">
            <div
              className="h-full progress-shimmer rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`,
                boxShadow: '0 0 10px rgba(124, 58, 237, 0.5), 0 0 20px rgba(124, 58, 237, 0.2)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className={`w-full max-w-2xl ${animClass}`}>
          {/* Question badge */}
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
              第 {currentIndex + 1} 题
            </span>
            {currentQuestion.special && (
              <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                补充题
              </span>
            )}
          </div>

          {/* Question text */}
          <h2 className="text-xl md:text-2xl font-semibold text-foreground leading-relaxed mb-10">
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
                  className={`w-full flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 text-left min-h-[48px] btn-press
                    ${
                      isSelected
                        ? 'border-primary/60 bg-primary/10 text-foreground shadow-[0_0_15px_rgba(124,58,237,0.2)]'
                        : 'border-border/30 bg-card/30 hover:border-primary/30 hover:bg-card/50 text-card-foreground'
                    }`}
                >
                  <span
                    className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors
                      ${
                        isSelected
                          ? 'bg-primary text-white'
                          : 'bg-muted text-muted-foreground'
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
        <div className="sticky bottom-0 bg-background/80 backdrop-blur-xl border-t border-border/30 p-4 animate-fade-in-up">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleSubmit}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-lg transition-all duration-300 glow-primary btn-press"
            >
              查看我的人格结果
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
