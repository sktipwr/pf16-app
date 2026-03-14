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

const MILESTONES = [
  { at: 5,   emoji: "🎬", msg: "And... you're off! First 5 done." },
  { at: 10,  emoji: "👏", msg: "Great start! You're finding your rhythm." },
  { at: 15,  emoji: "🧩", msg: "Each answer adds a piece to your personality puzzle." },
  { at: 20,  emoji: "🎵", msg: "You're in the zone — keep that flow going!" },
  { at: 25,  emoji: "💡", msg: "Fun fact: 16PF measures traits most people aren't aware of." },
  { at: 30,  emoji: "🌊", msg: "30 down — you're riding the wave now." },
  { at: 35,  emoji: "🔍", msg: "Your personality patterns are starting to emerge..." },
  { at: 40,  emoji: "🎨", msg: "Every answer paints a stroke on your unique portrait." },
  { at: 47,  emoji: "🎯", msg: "25% done — a quarter of the way!" },
  { at: 50,  emoji: "⭐", msg: "Half a century of answers! That's commitment." },
  { at: 55,  emoji: "🧬", msg: "Fun fact: No two 16PF profiles are exactly alike." },
  { at: 60,  emoji: "🌱", msg: "60 done — your profile is growing beautifully." },
  { at: 65,  emoji: "🧠", msg: "Your answers are shaping a unique personality profile." },
  { at: 70,  emoji: "💎", msg: "70 answers in — you're a diamond in the rough!" },
  { at: 75,  emoji: "🎭", msg: "Fun fact: 16PF reveals both your public and private self." },
  { at: 80,  emoji: "💪", msg: "80 strong! You're doing amazing." },
  { at: 85,  emoji: "🌟", msg: "The picture of who you are is getting clearer..." },
  { at: 94,  emoji: "🔥", msg: "Halfway there! The finish line is in sight." },
  { at: 100, emoji: "💯", msg: "100 questions done! Triple digits — legend status." },
  { at: 105, emoji: "🧭", msg: "Your inner compass is revealing its direction." },
  { at: 110, emoji: "🏔️", msg: "Over 110 done — most people don't get this far!" },
  { at: 115, emoji: "⚡", msg: "You're on fire! Keep trusting your gut." },
  { at: 120, emoji: "🎪", msg: "Fun fact: Cattell spent 20+ years perfecting these questions." },
  { at: 125, emoji: "🌈", msg: "125 down — your personality rainbow is nearly complete." },
  { at: 130, emoji: "🚀", msg: "Your profile is really taking shape now." },
  { at: 135, emoji: "🎶", msg: "Almost like a symphony — every answer harmonizes." },
  { at: 140, emoji: "🏅", msg: "75% complete — you're in the home stretch!" },
  { at: 145, emoji: "💫", msg: "Only 42 left — you can almost taste the results." },
  { at: 150, emoji: "🎆", msg: "150! That's serious dedication to self-discovery." },
  { at: 155, emoji: "🔮", msg: "Your results are going to be fascinating..." },
  { at: 160, emoji: "🏆", msg: "Only 27 to go — you've got this!" },
  { at: 165, emoji: "🌠", msg: "The stars are aligning on your personality map." },
  { at: 170, emoji: "🎊", msg: "17 left! The finish line is right there." },
  { at: 175, emoji: "🎉", msg: "Almost there — just 12 more questions!" },
  { at: 180, emoji: "🥇", msg: "Single digits away from your full profile!" },
  { at: 185, emoji: "✨", msg: "2 more! Your results are nearly ready." },
];

const SWIPE_THRESHOLD = 80;   // px needed to trigger navigation
const SWIPE_FLY_OUT = 400;    // px the card flies off screen

export default function TestScreen({
  answers, initialQuestion, onAnswer, onNavigate, onComplete, onHome, startTime
}: TestScreenProps) {
  const [current, setCurrent]     = useState(initialQuestion);
  const [animKey, setAnimKey]     = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [justSelected, setJustSelected] = useState<number | null>(null);
  const [milestone, setMilestone] = useState<typeof MILESTONES[0] | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  // Drag state
  const [dragX, setDragX]         = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [flyOut, setFlyOut]       = useState<"left" | "right" | null>(null);

  const prevAnsweredRef  = useRef(answers.filter((a) => a !== null).length);
  const autoAdvTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef          = useRef<HTMLDivElement>(null);
  const dragStart        = useRef<{ x: number; y: number; locked: boolean | null } | null>(null);

  const elapsed        = useTimer(startTime ?? null);
  const q              = QUESTIONS[current];
  const answeredCount  = answers.filter((a) => a !== null).length;
  const pct            = Math.round((answeredCount / 187) * 100);
  const isLast         = current === 186;
  const selectedAnswer = answers[current];
  const questionsLeft  = 187 - answeredCount;
  const avgSecsPerQ    = answeredCount > 4 ? elapsed / answeredCount : 11;
  const estimatedSecsLeft = Math.round(avgSecsPerQ * questionsLeft);

  // Scroll to top on mount
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
    setFlyOut(null);
    setDragX(0);
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
    if (transitioning || isDragging) return;

    onAnswer(current, idx);
    setJustSelected(idx);

    if (!isLast) {
      setTransitioning(true);
      autoAdvTimer.current = setTimeout(() => {
        setTransitioning(false);
        navigate(current + 1, "next");
      }, 2000);
    }
  };

  // ── Drag / swipe handlers on the card ──
  const onCardTouchStart = (e: React.TouchEvent) => {
    if (transitioning) return;
    dragStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      locked: null,  // null = undecided, true = horizontal, false = vertical
    };
  };

  const onCardTouchMove = (e: React.TouchEvent) => {
    if (!dragStart.current) return;
    const dx = e.touches[0].clientX - dragStart.current.x;
    const dy = e.touches[0].clientY - dragStart.current.y;

    // Decide axis lock on first significant movement
    if (dragStart.current.locked === null) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        dragStart.current.locked = Math.abs(dx) > Math.abs(dy);
      }
      return;
    }

    // If vertical scroll, bail out
    if (!dragStart.current.locked) return;

    // Horizontal drag — prevent scroll and update card position
    e.preventDefault();
    setIsDragging(true);
    setDragX(dx);
  };

  const onCardTouchEnd = () => {
    if (!dragStart.current || !isDragging) {
      dragStart.current = null;
      return;
    }

    const dx = dragX;
    dragStart.current = null;

    // Check if swipe exceeded threshold
    if (dx < -SWIPE_THRESHOLD && answers[current] !== null && !isLast) {
      // Swipe left → next question — fly card out left
      setFlyOut("left");
      setTimeout(() => {
        setIsDragging(false);
        navigate(current + 1, "next");
      }, 250);
    } else if (dx > SWIPE_THRESHOLD && current > 0) {
      // Swipe right → previous question — fly card out right
      setFlyOut("right");
      setTimeout(() => {
        setIsDragging(false);
        navigate(current - 1, "prev");
      }, 250);
    } else {
      // Snap back
      setDragX(0);
      setIsDragging(false);
    }
  };

  // Compute card transform from drag state
  const getCardTransform = () => {
    if (flyOut === "left") return `translateX(${-SWIPE_FLY_OUT}px) rotate(-15deg)`;
    if (flyOut === "right") return `translateX(${SWIPE_FLY_OUT}px) rotate(15deg)`;
    if (isDragging && dragX !== 0) {
      const rotate = dragX * 0.06; // subtle rotation as you drag
      return `translateX(${dragX}px) rotate(${rotate}deg)`;
    }
    return undefined;
  };

  const getCardOpacity = () => {
    if (flyOut) return 0;
    if (isDragging && Math.abs(dragX) > 0) {
      return Math.max(0.4, 1 - Math.abs(dragX) / 400);
    }
    return 1;
  };

  const animClass = (!isDragging && !flyOut)
    ? (direction === "next" ? "animate-slide-in-right" : "animate-slide-in-left")
    : "";

  return (
    <div className="min-h-screen flex flex-col pb-16">
      {/* Milestone celebration — inline banner below header */}
      {milestone && (
        <div className="animate-milestone-slide overflow-hidden">
          <div className="max-w-2xl mx-auto px-5 py-3">
            <div
              className="flex items-center gap-3 px-5 py-4 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(200,134,26,0.1), rgba(232,184,75,0.1))",
                border: "1px solid rgba(200,134,26,0.25)",
              }}
            >
              <span className="text-3xl animate-milestone-emoji">{milestone.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: "#7a5a0a" }}>{milestone.msg}</p>
                <p className="text-xs mt-0.5" style={{ color: "#9a7a2a" }}>{answeredCount} of 187 answered</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky top bar */}
      <div
        className="sticky top-0 z-10 border-b"
        style={{ background: "rgba(250,246,238,0.97)", backdropFilter: "blur(10px)", borderColor: "#e2d8c8" }}
      >
        <div className="max-w-2xl mx-auto px-5 py-4">
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

          <div className="h-3 rounded-full overflow-hidden mb-3" style={{ background: "#e0d6c2" }}>
            <div
              className="progress-fill h-full rounded-full"
              style={{ width: `${pct}%`, background: "linear-gradient(90deg, #c8861a, #e8b84b)" }}
            />
          </div>

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

          {/* Question card stack — Tinder-style left/right fan */}
          <div className="relative mb-4" style={{ perspective: "800px" }}>
            {/* Stack card 2 (deepest — decorative fanned right) */}
            <div
              className="absolute inset-0 rounded-2xl border"
              style={{
                background: "#f2ebe0",
                borderColor: "#ddd2c0",
                transform: "translateX(8px) rotate(2.5deg)",
                transformOrigin: "center bottom",
                boxShadow: "0 2px 8px rgba(15,27,45,0.05)",
              }}
            />
            {/* Stack card 1 (middle — shows next/prev question peek) */}
            {(() => {
              const peekIdx = isDragging && dragX > 0
                ? (current > 0 ? current - 1 : null)
                : (current < 186 ? current + 1 : null);
              const peekQ = peekIdx !== null ? QUESTIONS[peekIdx] : null;
              return (
                <div
                  className="absolute inset-0 rounded-2xl border p-5 sm:p-8 overflow-hidden"
                  style={{
                    background: "#faf6ee",
                    borderColor: "#e2d8c8",
                    transform: "translateX(-3px) rotate(-1deg)",
                    transformOrigin: "center bottom",
                    boxShadow: "0 2px 12px rgba(15,27,45,0.06)",
                  }}
                >
                  {peekQ && (
                    <>
                      <div className="flex items-center gap-2 mb-4">
                        <span
                          className="text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
                          style={{ background: "#f0e6d0", color: "#b8913a" }}
                        >
                          Question {String((peekIdx ?? 0) + 1).padStart(3, "0")}
                        </span>
                      </div>
                      <p
                        className="font-serif text-lg sm:text-xl leading-relaxed mb-6"
                        style={{ fontFamily: "Lora, Georgia, serif", color: "#5a4a32", opacity: 0.7 }}
                      >
                        {peekQ.text}
                      </p>
                      <div className="space-y-2.5">
                        {peekQ.options.map((opt, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-4 rounded-2xl border-2"
                            style={{ background: "white", borderColor: "#e8e0d0", opacity: 0.5 }}
                          >
                            <div
                              className="flex-shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold"
                              style={{ borderColor: "#d0c8b8", color: "#8a7f6e" }}
                            >
                              {OPTION_LABELS[i]}
                            </div>
                            <span className="text-sm leading-snug flex-1 font-medium" style={{ color: "#8a7f6e" }}>
                              {opt}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })()}
            {/* Active card — draggable */}
            <div
              ref={cardRef}
              key={animKey}
              className={`${animClass} relative rounded-2xl p-5 sm:p-8 border touch-pan-y`}
              onTouchStart={onCardTouchStart}
              onTouchMove={onCardTouchMove}
              onTouchEnd={onCardTouchEnd}
              style={{
                background: "white",
                borderColor: "#e2d8c8",
                boxShadow: "0 4px 28px rgba(15,27,45,0.08)",
                transform: getCardTransform(),
                opacity: getCardOpacity(),
                transition: (isDragging && !flyOut) ? "none" : "transform 0.3s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.25s ease",
                willChange: "transform",
              }}
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

          {/* Swipe hint indicators */}
          {isDragging && Math.abs(dragX) > 20 && (
            <div className="flex justify-between px-4 mb-2 text-xs font-semibold" style={{ color: "#9a7a2a" }}>
              <span style={{ opacity: dragX > 20 ? Math.min(1, dragX / SWIPE_THRESHOLD) : 0 }}>← Previous</span>
              <span style={{ opacity: dragX < -20 ? Math.min(1, -dragX / SWIPE_THRESHOLD) : 0 }}>Next →</span>
            </div>
          )}

          {/* Transition progress bar — visible during auto-advance */}
          <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: transitioning ? "#e0d6c2" : "transparent" }}>
            {transitioning && (
              <div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #c8861a, #e8b84b)",
                  animation: "transitionFill 2000ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
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
            Swipe card or tap to navigate
          </p>
        </div>
      </div>
    </div>
  );
}
