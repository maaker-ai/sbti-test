'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { questions, specialQuestions, type Question } from '@/data/questions';
import { computeResult, encodeShareUrl } from '@/data/scoring';
import { recordCompletion, warmUpSupabase } from '@/lib/supabase';

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Interpolate between two hex colors by t (0-1) */
function lerpColor(a: string, b: string, t: number): string {
  const parse = (hex: string) => {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${bl})`;
}

export default function TestPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animDir, setAnimDir] = useState<'in' | 'out' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Shuffle questions once on mount (client only to avoid hydration mismatch)
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const regularShuffled = shuffle([...questions]);
    const drinkQ1 = specialQuestions[0];
    const insertPos = Math.floor(Math.random() * (regularShuffled.length + 1));
    regularShuffled.splice(insertPos, 0, drinkQ1);
    setShuffledQuestions(regularShuffled);
    setMounted(true);
    warmUpSupabase();
  }, []);

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

  // Trigger submit button appearance animation
  useEffect(() => {
    if (allAnswered) {
      const timer = setTimeout(() => setShowSubmit(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowSubmit(false);
    }
  }, [allAnswered]);

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

  const submitWithAnswers = useCallback(
    async (answersToUse: Record<string, number>) => {
      const result = computeResult(answersToUse);
      const shareCode = encodeShareUrl(result);
      const typeCode = result.finalType.code;

      // Fire-and-await: 800ms timeout is enforced inside recordCompletion.
      // Any failure (network / RPC / timeout) returns null and does NOT block navigation.
      const completion = await recordCompletion(typeCode);
      if (completion) {
        try {
          sessionStorage.setItem(
            'sbti:completion',
            JSON.stringify({ ...completion, typeCode })
          );
        } catch {
          // sessionStorage can throw in private mode — ignore, still navigate.
        }
      }

      router.push(`/sbti/result?r=${encodeURIComponent(shareCode)}`);
    },
    [router]
  );

  const handleSelect = useCallback(
    (questionId: string, value: number) => {
      const newAnswers = { ...answers, [questionId]: value };

      // If drink_gate_q1 changed to not 3, remove drink_gate_q2 answer
      if (questionId === 'drink_gate_q1' && value !== 3) {
        delete newAnswers['drink_gate_q2'];
      }

      setAnswers(newAnswers);

      // Compute the next visible list based on the fresh answers so we can
      // reliably tell whether this selection just answered the last question.
      // drink_gate_q1 === 3 dynamically injects drink_gate_q2 into the flow.
      const nextVisible = [...shuffledQuestions];
      if (newAnswers['drink_gate_q1'] === 3) {
        const gi = nextVisible.findIndex((q) => q.id === 'drink_gate_q1');
        if (gi !== -1) {
          nextVisible.splice(gi + 1, 0, specialQuestions[1]);
        }
      }
      const willBeAllAnswered =
        nextVisible.length > 0 &&
        nextVisible.every((q) => newAnswers[q.id] !== undefined);

      // Auto advance after selection — or auto submit if this was the final answer
      setTimeout(() => {
        if (willBeAllAnswered) {
          // Slide the last card out, then show the full-screen loading overlay
          // and kick off submission.
          setIsSubmitting(true);
          submitWithAnswers(newAnswers);
          return;
        }
        if (currentIndex < visibleQuestions.length - 1) {
          goToQuestion(currentIndex + 1, 'forward');
        }
      }, 350);
    },
    [
      answers,
      currentIndex,
      visibleQuestions.length,
      shuffledQuestions,
      goToQuestion,
      submitWithAnswers,
    ]
  );

  const handleSubmit = useCallback(async () => {
    if (!allAnswered) return;
    setIsSubmitting(true);
    await submitWithAnswers(answers);
  }, [allAnswered, answers, submitWithAnswers]);

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      goToQuestion(currentIndex - 1, 'back');
    }
  }, [currentIndex, goToQuestion]);

  if (!mounted || !currentQuestion) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="text-muted-foreground">加载题目中...</div>
      </div>
    );
  }

  const animClass =
    animDir === 'in'
      ? 'animate-slide-in'
      : animDir === 'out'
        ? 'animate-slide-out'
        : '';

  // Dynamic background: purple → pink → amber → green as progress increases
  const progressT = progress / 100;
  const colorStops1 = ['#A855F7', '#EC4899', '#F59E0B', '#10B981'];
  const colorStops2 = ['#7C3AED', '#F472B6', '#FBBF24', '#34D399'];
  const segT = progressT * (colorStops1.length - 1);
  const segIdx = Math.min(Math.floor(segT), colorStops1.length - 2);
  const segFrac = segT - segIdx;
  const glowColor1 = lerpColor(colorStops1[segIdx], colorStops1[segIdx + 1], segFrac);
  const glowColor2 = lerpColor(colorStops2[segIdx], colorStops2[segIdx + 1], segFrac);
  const glowOpacity1 = 0.15;
  const glowOpacity2 = 0.1;

  // Milestone positions for progress bar (percentage)
  const milestones = [25, 50, 75];

  return (
    <div className="min-h-dvh flex flex-col bg-background relative overflow-hidden">
      {/* Dynamic background glow layers */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-1000 ease-out"
        style={{
          background: `radial-gradient(ellipse 600px 400px at 30% 20%, ${glowColor1} ${glowOpacity1 * 100}%, transparent 70%)`,
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-1000 ease-out"
        style={{
          background: `radial-gradient(ellipse 500px 500px at 70% 80%, ${glowColor2} ${glowOpacity2 * 100}%, transparent 70%)`,
        }}
      />

      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2.5">
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
            <span className="text-sm font-medium" style={{ color: glowColor1 }}>{Math.round(progress)}%</span>
          </div>
          {/* Progress bar with milestones */}
          <div className="relative h-2 bg-muted rounded-full overflow-visible">
            {/* Milestone dots */}
            {milestones.map((m) => (
              <div
                key={m}
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-border/50 z-10 transition-colors duration-300"
                style={{
                  left: `${m}%`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: progress >= m ? 'var(--accent)' : 'var(--muted)',
                }}
              />
            ))}
            {/* Bar fill */}
            <div
              className="h-full progress-shimmer rounded-full transition-all duration-500 ease-out relative"
              style={{
                width: `${progress}%`,
                boxShadow: `0 0 12px ${glowColor1}80, 0 0 24px ${glowColor1}40`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10">
        <div className={`w-full max-w-2xl ${animClass}`}>
          {/* Question number - large display, color follows progress */}
          <div className="flex items-center gap-3 mb-6">
            <span className="font-display text-3xl" style={{ color: glowColor1 }}>
              Q{currentIndex + 1}
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
                        ? 'text-foreground'
                        : 'border-border/30 bg-card/30 hover:bg-card/50 text-card-foreground'
                    }`}
                  style={isSelected ? {
                    borderColor: `${glowColor1}60`,
                    backgroundColor: `${glowColor1}15`,
                    boxShadow: `0 0 20px ${glowColor1}30`,
                  } : undefined}
                >
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200
                      ${
                        isSelected
                          ? 'text-white scale-110'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    style={isSelected ? { backgroundColor: glowColor1 } : undefined}
                  >
                    {optionCode}
                  </span>
                  <span className="pt-1 text-sm md:text-base leading-relaxed">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom submit */}
      {allAnswered && (
        <div
          className={`sticky bottom-0 bg-background/80 backdrop-blur-xl border-t border-border/30 p-4 transition-all duration-500 ease-out ${
            showSubmit ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleSubmit}
              className="w-full py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 btn-press relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #A855F7, #EC4899, #F59E0B)',
                boxShadow: '0 0 25px rgba(236,72,153,0.4), 0 0 60px rgba(168,85,247,0.2)',
              }}
            >
              {/* Shimmer overlay */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]" />
              <span className="relative flex items-center justify-center gap-2">
                查看我的人格结果
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Submitting overlay — covers everything while we compute + navigate */}
      {isSubmitting && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl animate-[fadeInUp_300ms_ease-out]"
          aria-live="polite"
          role="status"
        >
          {/* Ambient glow — mirrors the in-test palette so the transition feels continuous */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 700px 500px at 30% 30%, rgba(168,85,247,0.22), transparent 70%), radial-gradient(ellipse 600px 500px at 70% 70%, rgba(236,72,153,0.18), transparent 70%)',
            }}
          />
          <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
            {/* Pulsing gradient orb */}
            <div className="relative w-20 h-20">
              <div
                className="absolute inset-0 rounded-full animate-[spin_2.4s_linear_infinite]"
                style={{
                  background:
                    'conic-gradient(from 0deg, #A855F7, #EC4899, #F59E0B, #A855F7)',
                  filter: 'blur(2px)',
                }}
              />
              <div
                className="absolute inset-2 rounded-full bg-background"
                style={{
                  boxShadow:
                    '0 0 40px rgba(236,72,153,0.4), 0 0 80px rgba(168,85,247,0.3)',
                }}
              />
              <div
                className="absolute inset-0 rounded-full animate-[ping_1.8s_cubic-bezier(0,0,0.2,1)_infinite]"
                style={{
                  boxShadow: '0 0 30px rgba(236,72,153,0.5)',
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <p
                className="font-display text-2xl md:text-3xl"
                style={{
                  background:
                    'linear-gradient(135deg, #A855F7, #EC4899, #F59E0B)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                生成你的人格档案...
              </p>
              <p className="text-sm text-muted-foreground">
                正在匹配 26 种类型中最像你的那一款
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
