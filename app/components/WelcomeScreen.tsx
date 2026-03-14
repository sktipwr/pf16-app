"use client";
import { useEffect, useMemo, useState } from "react";
import { computeScores } from "../lib/scoring";

interface WelcomeProps {
  onStart: () => void;
  onResume: () => void;
  onViewReport: () => void;
  hasProgress: boolean;
  isCompleted: boolean;
  answeredCount: number;
  answers: (number | null)[];
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

/* ── Completed summary sub-screen ── */
function CompletedSummary({
  answers,
  answeredCount,
  onViewReport,
  onStart,
}: {
  answers: (number | null)[];
  answeredCount: number;
  onViewReport: () => void;
  onStart: () => void;
}) {
  const scores = useMemo(() => computeScores(answers), [answers]);
  const highTraits = scores.filter((s) => s.level === "high").slice(0, 3);
  const lowTraits  = scores.filter((s) => s.level === "low").slice(0, 3);

  const shareResults = async () => {
    const traitLines = [
      ...highTraits.map((s) => `↑ High ${s.factor.label} (${s.factor.highPole})`),
      ...lowTraits.map((s) => `↓ Low ${s.factor.label} (${s.factor.lowPole})`),
    ].join("\n");

    const text = `🧠 My 16PF Personality Assessment Results\n\n${traitLines}\n\n📊 ${answeredCount}/187 questions answered\n\nTake the test: ${window.location.href}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "16PF Results", text });
        return;
      } catch {}
    }
    // Fallback: WhatsApp deep link
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 pb-24">
      <div className="max-w-xl w-full">

        {/* Header */}
        <div className="text-center mb-8 animate-fade-up">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"
            style={{ background: "#f0f9f4", border: "2px solid #a8d5b0" }}
          >
            ✅
          </div>
          <h1
            className="font-serif text-3xl sm:text-4xl font-bold mb-2"
            style={{ fontFamily: "Lora, Georgia, serif", color: "#0f1b2d" }}
          >
            Assessment Complete
          </h1>
          <p className="text-sm text-slate-500">
            You answered {answeredCount} of 187 questions
          </p>
        </div>

        {/* Top traits */}
        {(highTraits.length > 0 || lowTraits.length > 0) && (
          <div
            className="rounded-2xl p-5 mb-5 border animate-fade-up"
            style={{ background: "white", borderColor: "#e2d8c8", animationDelay: "0.1s" }}
          >
            <h3
              className="font-serif font-semibold text-base mb-4"
              style={{ fontFamily: "Lora, serif", color: "#0f1b2d" }}
            >
              Your Top Traits
            </h3>
            <div className="space-y-2">
              {highTraits.map((s) => (
                <div key={s.factor.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#f0f9f4" }}>
                  <span className="text-base">↑</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-sm" style={{ color: "#1f6b3e" }}>
                      High {s.factor.label}
                    </span>
                    <span className="text-xs text-slate-500 ml-2">{s.factor.highPole}</span>
                  </div>
                  <span className="text-sm font-bold tabular-nums" style={{ color: "#4a7c59" }}>
                    {s.percentage}%
                  </span>
                </div>
              ))}
              {lowTraits.map((s) => (
                <div key={s.factor.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#fef9ec" }}>
                  <span className="text-base">↓</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-sm" style={{ color: "#7a5a0a" }}>
                      Low {s.factor.label}
                    </span>
                    <span className="text-xs text-slate-500 ml-2">{s.factor.lowPole}</span>
                  </div>
                  <span className="text-sm font-bold tabular-nums" style={{ color: "#c8861a" }}>
                    {s.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          {/* Share on WhatsApp / Share sheet */}
          <button
            onClick={shareResults}
            className="w-full py-4 rounded-2xl text-sm font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            style={{ background: "#25D366", color: "white", boxShadow: "0 4px 16px rgba(37,211,102,0.3)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Share Results
          </button>

          {/* View full report */}
          <button
            onClick={onViewReport}
            className="w-full py-4 rounded-2xl text-sm font-semibold transition-all active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #0f1b2d, #1a2d45)", color: "white", boxShadow: "0 8px 32px rgba(15,27,45,0.25)" }}
          >
            View Full Report →
          </button>

          {/* Retake */}
          <button
            onClick={onStart}
            className="w-full py-4 rounded-2xl text-sm font-semibold transition-all active:scale-[0.98] border-2"
            style={{ background: "white", borderColor: "#e2d8c8", color: "#334155" }}
          >
            ↺ Retake the Test
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main WelcomeScreen — 3 states ── */
export default function WelcomeScreen({
  onStart, onResume, onViewReport, hasProgress, isCompleted, answeredCount, answers,
}: WelcomeProps) {

  // State 3: completed → show summary
  if (isCompleted) {
    return (
      <CompletedSummary
        answers={answers}
        answeredCount={answeredCount}
        onViewReport={onViewReport}
        onStart={onStart}
      />
    );
  }

  // State 2: mid-test → show resume-focused view
  if (hasProgress && answeredCount > 0) {
    const pct = Math.round((answeredCount / 187) * 100);
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 pb-24">
        <div className="max-w-xl w-full">

          <div className="text-center mb-8 animate-fade-up">
            <h1
              className="font-serif text-3xl sm:text-4xl font-bold mb-2"
              style={{ fontFamily: "Lora, Georgia, serif", color: "#0f1b2d" }}
            >
              Welcome Back
            </h1>
            <p className="text-sm text-slate-500">
              You have an assessment in progress
            </p>
          </div>

          {/* Progress card */}
          <div
            className="rounded-2xl p-6 mb-6 border animate-fade-up"
            style={{ background: "white", borderColor: "#e2d8c8", animationDelay: "0.08s" }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold" style={{ color: "#0f1b2d" }}>
                Your Progress
              </span>
              <span className="text-sm font-bold tabular-nums" style={{ color: "#c8861a" }}>
                {pct}%
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden mb-3" style={{ background: "#e8dfc8" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, background: "linear-gradient(90deg, #c8861a, #e8b84b)", transition: "width 0.5s" }}
              />
            </div>
            <p className="text-xs text-slate-400">
              {answeredCount} of 187 questions answered · {187 - answeredCount} remaining
            </p>
          </div>

          {/* Resume */}
          <button
            onClick={onResume}
            className="w-full py-4 sm:py-5 rounded-2xl text-base font-semibold transition-all active:scale-[0.98] mb-3 animate-fade-up"
            style={{
              background: "linear-gradient(135deg, #4a7c59, #2d6b3e)",
              color: "white",
              animationDelay: "0.16s",
              boxShadow: "0 8px 32px rgba(74,124,89,0.3)",
            }}
          >
            Resume Assessment →
          </button>

          {/* Start fresh */}
          <button
            onClick={onStart}
            className="w-full py-4 rounded-2xl text-sm font-semibold transition-all active:scale-[0.98] border-2 animate-fade-up"
            style={{ background: "white", borderColor: "#e2d8c8", color: "#334155", animationDelay: "0.22s" }}
          >
            Start Fresh
          </button>

          <p className="text-center text-xs text-slate-400 mt-4">
            Your progress is automatically saved to your browser
          </p>
        </div>
      </div>
    );
  }

  // State 1: new user → full welcome
  return <NewUserWelcome onStart={onStart} />;
}

/* ── New user welcome ── */
function NewUserWelcome({ onStart }: { onStart: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const c187 = useCountUp(mounted ? 187 : 0, 900);
  const c35  = useCountUp(mounted ? 35  : 0, 700);
  const c16  = useCountUp(mounted ? 16  : 0, 550);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 pb-24">
      <div className="max-w-xl w-full">

        <div className="text-center mb-8 animate-fade-up">
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

        <div className="grid grid-cols-3 gap-3 mb-7">
          {[
            { icon: "📋", value: c187,       label: "Questions", delay: "0.08s" },
            { icon: "⏱",  value: `~${c35}`, label: "Minutes",   delay: "0.14s" },
            { icon: "🔬", value: c16,        label: "Factors",   delay: "0.20s" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-4 text-center border animate-fade-up"
              style={{ background: "white", borderColor: "#e2d8c8", boxShadow: "0 2px 14px rgba(15,27,45,0.05)", animationDelay: s.delay }}
            >
              <div className="text-xl sm:text-2xl mb-1">{s.icon}</div>
              <div className="font-serif text-2xl sm:text-3xl font-bold mb-0.5 tabular-nums" style={{ color: "#c8861a", fontFamily: "Lora, serif" }}>
                {s.value}
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wide font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        <div
          className="rounded-2xl p-5 sm:p-6 mb-6 border animate-fade-up"
          style={{ background: "white", borderColor: "#e2d8c8", animationDelay: "0.22s" }}
        >
          <h3 className="font-serif font-semibold text-base mb-4" style={{ color: "#0f1b2d", fontFamily: "Lora, serif" }}>
            Before you begin
          </h3>
          <ol className="space-y-3">
            {[
              "Give your first, natural answer — don't overthink.",
              "Avoid the middle \"uncertain\" option except when truly necessary.",
              "Answer every question — give your best guess if unsure.",
              "Be honest. There are no right or wrong answers.",
            ].map((tip, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5" style={{ background: "#f5e6c8", color: "#c8861a" }}>
                  {i + 1}
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ol>
        </div>

        <button
          onClick={onStart}
          className="w-full py-4 sm:py-5 rounded-2xl text-base sm:text-lg font-semibold transition-all hover:opacity-90 active:scale-[0.98] animate-fade-up"
          style={{ background: "linear-gradient(135deg, #0f1b2d, #1a2d45)", color: "white", animationDelay: "0.30s", boxShadow: "0 8px 32px rgba(15,27,45,0.25)" }}
        >
          Begin Assessment →
        </button>

        <p className="text-center text-xs text-slate-400 mt-4">
          Your progress is automatically saved to your browser
        </p>
      </div>
    </div>
  );
}
