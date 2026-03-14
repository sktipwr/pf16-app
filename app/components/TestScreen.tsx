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
  startTime?: number | null;
}

const OPTION_LABELS = ["A", "B", "C"];
const OPTION_COLORS = [
  { bg: "#fef9ec", border: "#d4a843", text: "#7a5a0a", dot: "#c8861a", glow: "rgba(200,134,26,0.18)" },
  { bg: "#f0f4ff", border: "#7b9cf0", text: "#2a4090", dot: "#4a6dd4", glow: "rgba(74,109,212,0.18)" },
  { bg: "#f0faf4", border: "#6db88a", text: "#1f6b3e", dot: "#4a7c59", glow: "rgba(74,124,89,0.18)" },
];

const MILESTONES = [
  { at: 47,  emoji: "🎯", msg: "25% done — great pace!" },
  { at: 94,  emoji: "🔥", msg: "Halfway there — keep going!" },
  { at: 140, emoji: "⚡", msg: "75% done — almost there!" },
];

export default function TestScreen({
  answers, initialQuestion, onAnswer, onNavigate, onComplete, startTime
}: TestScreenProps) {
  const [current, setCurrent]     = useState(initialQuestion);
  const [animKey, setAnimKey]     = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [justSelected, setJustSelected] = useState<number | null>(null);
  const [milestone, setMilestone] = useState<typeof MILESTONES[0] | null>(null);

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
  useEffect(() => () => { if (autoAdvTimer.current) clearTimeout(autoAdvTimer.current); }, []);

  const navigate = useCallback((to: number, dir: "next" | "prev") => {
    if (autoAdvTimer.current) clearTimeout(autoAdvTimer.current);
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
    if (autoAdvTimer.current) clearTimeout(autoAdvTimer.current);
    onAnswer(current, idx);
    setJustSelected(idx);
    // Auto-advance after a brief "confirmed" pause
    if (!isLast) {
      autoAdvTimer.current = setTimeout(() => navigate(current + 1, "next"), 380);
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
    if (dx < 0 && selectedAnswer !== null && !isLast) goNext();
    else if (dx > 0 && current > 0) goPrev();
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
          style={{ top: "68px", left: "50%" }}
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
        className="sticky top-0 z-10 px-4 py-3 border-b"
        style={{ background: "rgba(250,246,238,0.97)", backdropFilter: "blur(10px)", borderColor: "#e2d8c8" }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
              Q {current + 1} / 187
            </span>
            <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: "#e8dfc8" }}>
              <div
                className="progress-fill h-full rounded-full"
                style={{ width: `${pct}%`, background: "linear-gradient(90deg, #c8861a, #e8b84b)" }}
              />
            </div>
            <span className="text-xs font-semibold whitespace-nowrap" style={{ color: "#c8861a" }}>
              {pct}%
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-400">
            <span>{answeredCount} answered</span>
            <span className="opacity-40">·</span>
            <span>{questionsLeft} left</span>
            {startTime && elapsed > 0 && (
              <>
                <span className="opacity-40">·</span>
                <span>⏱ {formatTime(elapsed)}</span>
                {questionsLeft > 0 && (
                  <>
                    <span className="opacity-40">·</span>
                    <span style={{ color: "#c8861a" }}>
                      {answeredCount > 4 ? formatMinutes(estimatedSecsLeft) : "~35 min"} remaining
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

          {/* Question card — direction-aware slide animation */}
          <div
            key={animKey}
            className={`${animClass} rounded-2xl p-5 sm:p-8 mb-4 border`}
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
                    className={`option-btn w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left${justTapped ? " animate-option-pop" : ""}`}
                    style={{
                      background:  selected ? col.bg : "white",
                      borderColor: selected ? col.border : "#e8e0d0",
                      boxShadow:   selected ? `0 6px 22px ${col.glow}` : "0 1px 4px rgba(0,0,0,0.04)",
                      transform:   selected ? "scale(1.012)" : "scale(1)",
                      transition:  "all 0.22s cubic-bezier(0.34, 1.3, 0.64, 1)",
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

          {/* Navigation */}
          <div className="flex gap-3 mb-5">
            <button
              onClick={goPrev}
              disabled={current === 0}
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
