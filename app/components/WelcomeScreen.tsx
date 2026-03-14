"use client";
import { useEffect, useState } from "react";

interface WelcomeProps {
  onStart: () => void;
  onResume: () => void;
  hasProgress: boolean;
  answeredCount: number;
}

function useCountUp(target: number, duration = 850) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [target, duration]);
  return count;
}

export default function WelcomeScreen({ onStart, onResume, hasProgress, answeredCount }: WelcomeProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const c187 = useCountUp(mounted ? 187 : 0, 900);
  const c35  = useCountUp(mounted ? 35  : 0, 700);
  const c16  = useCountUp(mounted ? 16  : 0, 550);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 pb-24">
      <div className="max-w-xl w-full">

        {/* Badge + Title */}
        <div className="text-center mb-8 animate-fade-up" style={{ animationDelay: "0s" }}>
          <div
            className="inline-flex items-center gap-2 border text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-6"
            style={{ background: "#fdf4e3", borderColor: "#e8c97a", color: "#9a6e1f" }}
          >
            <span>◆</span> Personality Assessment <span>◆</span>
          </div>
          <h1
            className="font-serif text-4xl sm:text-5xl font-bold leading-tight mb-4"
            style={{ fontFamily: "Lora, Georgia, serif", color: "#0f1b2d" }}
          >
            16 Personality<br />
            <span style={{ color: "#c8861a" }}>Factors</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-500 max-w-md mx-auto leading-relaxed">
            A comprehensive psychological assessment measuring 16 core dimensions of your personality, developed by Raymond Cattell.
          </p>
        </div>

        {/* Animated stats */}
        <div className="grid grid-cols-3 gap-3 mb-7">
          {[
            { icon: "📋", value: c187,          label: "Questions", delay: "0.08s" },
            { icon: "⏱",  value: `~${c35}`,    label: "Minutes",   delay: "0.14s" },
            { icon: "🔬", value: c16,           label: "Factors",   delay: "0.20s" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-4 text-center border animate-fade-up"
              style={{
                background: "white",
                borderColor: "#e2d8c8",
                boxShadow: "0 2px 14px rgba(15,27,45,0.05)",
                animationDelay: s.delay,
              }}
            >
              <div className="text-xl sm:text-2xl mb-1">{s.icon}</div>
              <div
                className="font-serif text-2xl sm:text-3xl font-bold mb-0.5 tabular-nums"
                style={{ color: "#c8861a", fontFamily: "Lora, serif" }}
              >
                {s.value}
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wide font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div
          className="rounded-2xl p-5 sm:p-6 mb-6 border animate-fade-up"
          style={{ background: "white", borderColor: "#e2d8c8", animationDelay: "0.22s" }}
        >
          <h3
            className="font-serif font-semibold text-base mb-4"
            style={{ color: "#0f1b2d", fontFamily: "Lora, serif" }}
          >
            Before you begin
          </h3>
          <ol className="space-y-3">
            {[
              "Give your first, natural answer — don't overthink. Aim for 5–6 questions per minute.",
              "Avoid the middle \"uncertain\" option except when truly necessary.",
              "Answer every question, even if it doesn't perfectly apply — give your best guess.",
              "Be honest. There are no right or wrong answers.",
            ].map((tip, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5"
                  style={{ background: "#f5e6c8", color: "#c8861a" }}
                >
                  {i + 1}
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Resume banner */}
        {hasProgress && answeredCount > 0 && (
          <div
            className="rounded-xl p-4 mb-4 flex items-center justify-between gap-3 border animate-scale-in"
            style={{ background: "#f0f9f0", borderColor: "#a8d5b0", animationDelay: "0.28s" }}
          >
            <div className="text-sm" style={{ color: "#2d6b3e" }}>
              <span className="font-semibold">Progress saved</span> — {answeredCount} of 187 answered
            </div>
            <button
              onClick={onResume}
              className="text-sm font-semibold px-4 py-2 rounded-lg transition-all active:scale-95 flex-shrink-0"
              style={{ background: "#4a7c59", color: "white" }}
            >
              Resume →
            </button>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={onStart}
          className="w-full py-4 sm:py-5 rounded-2xl text-base sm:text-lg font-semibold transition-all hover:opacity-90 active:scale-[0.98] animate-fade-up"
          style={{
            background: "linear-gradient(135deg, #0f1b2d, #1a2d45)",
            color: "white",
            animationDelay: "0.30s",
            boxShadow: "0 8px 32px rgba(15,27,45,0.25)",
          }}
        >
          {hasProgress && answeredCount > 0 ? "Start Fresh" : "Begin Assessment →"}
        </button>

        <p className="text-center text-xs text-slate-400 mt-4">
          Your progress is automatically saved to your browser
        </p>
      </div>
    </div>
  );
}
