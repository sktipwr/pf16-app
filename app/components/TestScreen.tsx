"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { QUESTIONS } from "../lib/questions";
import { QuestionText } from "./WordTooltip";

function useTimer(startTime: number | null) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startTime) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [startTime]);
  return elapsed;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatMinutes(seconds: number) {
  const m = Math.round(seconds / 60);
  return m <= 1 ? "~1 min" : `~${m} min`;
}

interface TestScreenProps {
  answers: (number | null)[];
  initialQuestion: number;
  onAnswer: (questionIndex: number, answerIndex: number) => void;
  onNavigate: (idx: number) => void;
  onComplete: () => void;
  onHome: () => void;
  startTime?: number | null;
}

const OPTION_LABELS = ["A", "B", "C"];
const OPTION_COLORS = [
  { bg: "#fef9ec", border: "#d4a843", text: "#7a5a0a", dot: "#c8861a", glow: "rgba(200,134,26,0.18)" },
  { bg: "#f0f4ff", border: "#7b9cf0", text: "#2a4090", dot: "#4a6dd4", glow: "rgba(74,109,212,0.18)" },
  { bg: "#f0faf4", border: "#6db88a", text: "#1f6b3e", dot: "#4a7c59", glow: "rgba(74,124,89,0.18)" },
];

/*
 * Rich milestone system — varied messages at thoughtful intervals.
 * Mix of: encouragements, personality fun-facts, progress celebrations.
 * Spread so they never feel repetitive.
 */
const MILESTONES = [
  { at: 10,  emoji: "👏", msg: "Great start! You're finding your rhythm." },
  { at: 25,  emoji: "💡", msg: "Fun fact: 16PF measures traits most people aren't aware of." },
  { at: 47,  emoji: "🎯", msg: "25% done — a quarter of the way!" },
  { at: 65,  emoji: "🧠", msg: "Your answers are shaping a unique personality profile." },
  { at: 80,  emoji: "💪", msg: "You're doing great — trust your instincts." },
  { at: 94,  emoji: "🔥", msg: "Halfway there! The finish line is in sight." },
  { at: 110, emoji: "🌟", msg: "Over 110 done — most people don't get this far!" },
  { at: 130, emoji: "🚀", msg: "Your profile is really taking shape now." },
  { at: 140, emoji: "⚡", msg: "75% complete — you're in the home stretch!" },
  { at: 160, emoji: "🏆", msg: "Only 27 to go — you've got this!" },
  { at: 175, emoji: "🎉", msg: "Almost there — just 12 more questions!" },
  { at: 185, emoji: "✨", msg: "2 more! Your results are nearly ready." },
];

export default function TestScreen({
  answers, initialQuestion, onAnswer, onNavigate, onComplete, onHome, startTime
}: TestScreenProps) {
  const [current, setCurrent]     = useState(initialQuestion);
  const [animKey, setAnimKey]     = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [justSelected, setJustSelected] = useState<number | null>(null);
  const [milestone, setMilestone] = useState<typeof MILESTONES[0] | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const prevAnsweredRef  = useRef(answers.filter((a) => a !== null).length);
  const autoAdvTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX      = useRef<number | null>(null);
  const touchStartY      = useRef<number | null>(null);

  const elapsed        = useTimer(startTime ?? null);
  const q              = QUESTIONS[current];
  const answeredCount  = answers.filter((a) => a !== null).length;
  const pct            = Math.round((answeredCount / 187) * 100);
  const isLast         = current === 186;
  const selectedAnswer = answers[current];
  const questionsLeft  = 187 - answeredCount;
  const avgSecsPerQ    = answeredCount > 4 ? elapsed / answeredCount : 11;
  const estimatedSecsLeft = Math.round(avgSecsPerQ * questionsLeft);

  // Scroll to top when entering the test screen (e.g. from "Begin Assessment")
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Milestone detection
  useEffect(() => {
    const prev = prevAnsweredRef.current;
    const curr = answers.filter((a) => a !== null).length;
    prevAnsweredRef.current = curr;
    const hit = MILESTONES.find((m) => curr >= m.at && prev < m.at);
    if (hit) {
      setMilestone(hit);
      setTimeout(() => setMilestone(null), 3200);
    }
  }, [answers]);

  // Cleanup on unmount
  useEffect(() => () => {
    if (autoAdvTimer.current) clearTimeout(autoAdvTimer.current);
  }, []);

  const navigate = useCallback((to: number, dir: "next" | "prev") => {
    if (autoAdvTimer.current) clearTimeout(autoAdvTimer.current);
    setTransitioning(false);
    setDirection(dir);
    setCurrent(to);
    setAnimKey((k) => k + 1);
    onNavigate(to);
    setJustSelected(null);
  }, [onNavigate]);

  const goNext = useCallback(() => {
    if (selectedAnswer === null) return;
    if (isLast) { onComplete(); return; }
    navigate(current + 1, "next");
  }, [selectedAnswer, isLast, current, navigate, onComplete]);

  const goPrev = useCallback(() => {
    if (current === 0) return;
    navigate(current - 1, "prev");
  }, [current, navigate]);

  const selectAnswer = (idx: number) => {
    // Block taps during transition to prevent double-firing
    if (transitioning) return;

    onAnswer(current, idx);
    setJustSelected(idx);

    // Gentle auto-advance: user sees their selection for 1300ms, then slides to next
    if (!isLast) {
      setTransitioning(true);
      autoAdvTimer.current = setTimeout(() => {
        setTransitioning(false);
        navigate(current + 1, "next");
      }, 1300);
    }
  };

  // Swipe gesture support
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) < 55 || Math.abs(dy) > Math.abs(dx) * 0.9) return;
    if (dx < 0 && answers[current] !== null && !isLast) {
      navigate(current + 1, "next");
    } else if (dx > 0 && current > 0) {
      navigate(current - 1, "prev");
    }
  };

  const animClass = direction === "next" ? "animate-slide-in-right" : "animate-slide-in-left";

  return (
    <div
      className="min-h-screen flex flex-col pb-16"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Milestone toast */}
      {milestone && (
        <div
          className="fixed z-50 pointer-events-none animate-milestone-pop"
          style={{ top: "80px", left: "50%" }}
        >
          <div
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold text-white whitespace-nowrap"
            style={{
              background: "linear-gradient(135deg, #c8861a, #e8b84b)",
              boxShadow: "0 8px 32px rgba(200,134,26,0.5)",
            }}
          >
            <span className="text-base">{milestone.emoji}</span>
            {milestone.msg}
          </div>
        </div>
      )}

      {/* Sticky top bar */}
      <div
        className="sticky top-0 z-10 border-b"
        style={{ background: "rgba(250,246,238,0.97)", backdropFilter: "blur(10px)", borderColor: "#e2d8c8" }}
      >
        <div className="max-w-2xl mx-auto px-5 py-4">
          {/* Row 1: Home icon + question badge + percentage */}
          <div className="flex items-center gap-3 mb-2.5">
            <button
              onClick={onHome}
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90"
              style={{ background: "#f0e8d8" }}
              title="Home"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5a4a32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </button>
            <span
              className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full"
              style={{ background: "#0f1b2d", color: "#e8dfc8" }}
            >
              Q {current + 1} of 187
            </span>
            <span className="ml-auto text-sm font-bold tabular-nums" style={{ color: "#0f1b2d" }}>
              {pct}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-3 rounded-full overflow-hidden mb-3" style={{ background: "#e0d6c2" }}>
            <div
              className="progress-fill h-full rounded-full"
              style={{ width: `${pct}%`, background: "linear-gradient(90deg, #c8861a, #e8b84b)" }}
            />
          </div>

          {/* Stats row — dark readable text */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs" style={{ color: "#5a4a32" }}>
            <span className="font-semibold">{answeredCount} answered</span>
            <span style={{ color: "#c4b89a" }}>|</span>
            <span>{questionsLeft} left</span>
            {startTime && elapsed > 0 && (
              <>
                <span style={{ color: "#c4b89a" }}>|</span>
                <span>⏱ {formatTime(elapsed)}</span>
                {questionsLeft > 0 && (
                  <>
                    <span style={{ color: "#c4b89a" }}>|</span>
                    <span className="font-semibold" style={{ color: "#9a6e1f" }}>
                      {answeredCount > 4 ? formatMinutes(estimatedSecsLeft) : "~35 min"} est.
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 flex items-start justify-center px-4 py-5 sm:py-10">
        <div className="max-w-2xl w-full">

          {/* Question card stack */}
          <div className="relative mb-4">
            {/* Stack card 2 (deepest) */}
            <div
              className="absolute inset-x-3 top-3 h-full rounded-2xl border"
              style={{
                background: "#f5efe3",
                borderColor: "#ddd2c0",
                boxShadow: "0 2px 8px rgba(15,27,45,0.04)",
              }}
            />
            {/* Stack card 1 (middle) */}
            <div
              className="absolute inset-x-1.5 top-1.5 h-full rounded-2xl border"
              style={{
                background: "#faf5eb",
                borderColor: "#e2d8c8",
                boxShadow: "0 2px 12px rgba(15,27,45,0.05)",
              }}
            />
            {/* Active card — direction-aware slide animation */}
            <div
              key={animKey}
              className={`${animClass} relative rounded-2xl p-5 sm:p-8 border`}
              style={{ background: "white", borderColor: "#e2d8c8", boxShadow: "0 4px 28px rgba(15,27,45,0.08)" }}
            >
            <div className="flex items-center gap-2 mb-4">
              <span
                className="text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
                style={{ background: "#f5e6c8", color: "#c8861a" }}
              >
                Question {String(current + 1).padStart(3, "0")}
              </span>
            </div>

            <p
              className="font-serif text-lg sm:text-xl leading-relaxed mb-6"
              style={{ fontFamily: "Lora, Georgia, serif", color: "#0f1b2d" }}
            >
              <QuestionText text={q.text} />
            </p>

            {/* Answer options */}
            <div className="space-y-2.5">
              {q.options.map((opt, i) => {
                const selected   = selectedAnswer === i;
                const justTapped = justSelected === i;
                const col        = OPTION_COLORS[i];
                return (
                  <button
                    key={i}
                    onClick={() => selectAnswer(i)}
                    disabled={transitioning}
                    className={`option-btn w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left${justTapped ? " animate-option-pop" : ""}`}
                    style={{
                      background:  selected ? col.bg : "white",
                      borderColor: selected ? col.border : "#e8e0d0",
                      boxShadow:   selected ? `0 6px 22px ${col.glow}` : "0 1px 4px rgba(0,0,0,0.04)",
                      transform:   selected ? "scale(1.012)" : "scale(1)",
                      transition:  "all 0.22s cubic-bezier(0.34, 1.3, 0.64, 1)",
                      opacity:     transitioning && !selected ? 0.5 : 1,
                    }}
                  >
                    {/* Circle letter / checkmark */}
                    <div
                      className="flex-shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold"
                      style={{
                        borderColor: selected ? col.dot : "#d0c8b8",
                        background:  selected ? col.dot : "transparent",
                        color:       selected ? "white" : "#8a7f6e",
                        transition:  "all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      }}
                    >
                      {selected
                        ? <span className="animate-check-bounce">✓</span>
                        : OPTION_LABELS[i]
                      }
                    </div>
                    <span
                      className="text-sm leading-snug flex-1 font-medium"
                      style={{ color: selected ? col.text : "#334155" }}
                    >
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          </div>

          {/* Transition progress bar — visible during auto-advance */}
          <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: transitioning ? "#e0d6c2" : "transparent" }}>
            {transitioning && (
              <div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #c8861a, #e8b84b)",
                  animation: "transitionFill 1300ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
                }}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 mb-5">
            <button
              onClick={goPrev}
              disabled={current === 0 || transitioning}
              className="px-5 py-3.5 rounded-xl border text-sm font-semibold transition-all disabled:opacity-25 active:scale-95"
              style={{ borderColor: "#e2d8c8", color: "#334155", background: "white" }}
            >
              ← Back
            </button>
            <button
              onClick={goNext}
              disabled={selectedAnswer === null}
              className="flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30 active:scale-[0.98]"
              style={{
                background: isLast
                  ? "linear-gradient(135deg, #4a7c59, #2d6b3e)"
                  : "linear-gradient(135deg, #0f1b2d, #1a2d45)",
                color: "white",
                boxShadow: selectedAnswer !== null ? "0 4px 18px rgba(15,27,45,0.22)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              {isLast ? "Complete & View Report ✓" : "Next →"}
            </button>
          </div>

          {/* Quick-jump dot grid */}
          <div className="flex flex-wrap gap-1 justify-center">
            {QUESTIONS.map((_, i) => {
              const ans = answers[i];
              const isCurrent = i === current;
              return (
                <button
                  key={i}
                  onClick={() => navigate(i, i > current ? "next" : "prev")}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm transition-all hover:scale-125 active:scale-110"
                  title={`Q${i + 1}`}
                  style={{
                    background: isCurrent ? "#c8861a" : ans !== null ? "#4a7c59" : "#e2d8c8",
                    opacity: isCurrent ? 1 : 0.7,
                  }}
                />
              );
            })}
          </div>
          <p className="text-center text-xs text-slate-400 mt-2">
            Tap to jump · Swipe left / right to navigate
          </p>
        </div>
      </div>
    </div>
  );
}
