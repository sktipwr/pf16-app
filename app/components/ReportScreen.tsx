"use client";
import { useMemo, useEffect, useState } from "react";
import { computeScores } from "../lib/scoring";
import { QUESTIONS } from "../lib/questions";
import type { UserInfo } from "../lib/useTestProgress";

interface ReportProps {
  answers: (number | null)[];
  onRetake: () => void;
  userInfo?: UserInfo;
}

const LEVEL_COLORS = {
  low:  { bg: "#fef0f0", border: "#e07070", text: "#8b2020", bar: "#e07070", label: "Low" },
  mid:  { bg: "#fef9ec", border: "#d4a843", text: "#7a5a0a", bar: "#d4a843", label: "Average" },
  high: { bg: "#f0f9f4", border: "#6db88a", text: "#1f6b3e", bar: "#6db88a", label: "High" },
};

function useCountUp(target: number, duration = 800, delayMs = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      if (!target) return;
      let start: number | null = null;
      const step = (ts: number) => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(ease * target));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delayMs);
    return () => clearTimeout(t);
  }, [target, duration, delayMs]);
  return count;
}

function AnimatedSten({ value, delay }: { value: number; delay: number }) {
  const n = useCountUp(value, 700, delay);
  return <>{n}</>;
}

export default function ReportScreen({ answers, onRetake, userInfo }: ReportProps) {
  const scores        = useMemo(() => computeScores(answers, userInfo?.gender), [answers, userInfo]);
  const answeredCount = answers.filter((a) => a !== null).length;
  const skippedCount  = 187 - answeredCount;
  const completion    = Math.round((answeredCount / 187) * 100);

  const cAnswered   = useCountUp(answeredCount, 700, 100);
  const cSkipped    = useCountUp(skippedCount,  600, 200);
  const cCompletion = useCountUp(completion,    800, 150);

  const highScores = scores.filter((s) => s.level === "high");
  const lowScores  = scores.filter((s) => s.level === "low");

  const downloadJSON = () => {
    const data = QUESTIONS.map((q, i) => ({
      question_id:  q.id,
      question:     q.text,
      options:      q.options,
      answer_index: answers[i],
      answer_label: answers[i] !== null ? ["a", "b", "c"][answers[i]!] : null,
      answer_text:  answers[i] !== null ? q.options[answers[i]!] : null,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "16pf_responses.json"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen px-4 py-8 pb-24">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10 animate-fade-up">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 animate-scale-in"
            style={{ background: "#f5e6c8", animationDelay: "0.05s" }}
          >
            📊
          </div>
          <h1
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-3"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: "#0f1b2d" }}
          >
            {userInfo ? `${userInfo.name}'s Report` : "Your Personality Report"}
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            {userInfo
              ? `Scored using ${userInfo.gender === "male" ? "male" : "female"} population norms (age ${userInfo.age}). Sten scores range from 1 (low) to 10 (high).`
              : "Based on your responses to the 16PF questionnaire. Scores reflect relative tendencies — there are no good or bad results."
            }
          </p>
        </div>

        {/* Summary stats — animated */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          {[
            { v: cAnswered,        l: "Answered",   c: "#4a7c59" },
            { v: cSkipped,         l: "Skipped",    c: skippedCount > 0 ? "#b94040" : "#4a7c59" },
            { v: `${cCompletion}%`, l: "Completion", c: "#c8861a" },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-2xl p-4 sm:p-5 text-center border"
              style={{ background: "white", borderColor: "#e2d8c8", boxShadow: "0 2px 12px rgba(15,27,45,0.05)" }}
            >
              <div
                className="font-serif text-2xl sm:text-3xl font-bold mb-1 tabular-nums"
                style={{ color: s.c, fontFamily: "'DM Serif Display', serif" }}
              >
                {s.v}
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wide">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Strongest traits */}
        {(highScores.length > 0 || lowScores.length > 0) && (
          <div
            className="rounded-2xl p-5 sm:p-7 mb-7 border animate-fade-up"
            style={{ background: "white", borderColor: "#e2d8c8", animationDelay: "0.15s" }}
          >
            <h2
              className="font-serif text-lg sm:text-xl font-semibold mb-5"
              style={{ fontFamily: "'DM Serif Display', serif", color: "#0f1b2d" }}
            >
              Your Strongest Traits
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {highScores.map((s) => (
                <div key={s.factor.id} className="flex gap-3 p-3 rounded-xl" style={{ background: "#f0f9f4", border: "1px solid #a8d5b0" }}>
                  <span className="text-lg">↑</span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm" style={{ color: "#1f6b3e" }}>High {s.factor.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{s.factor.highPole} · Sten {s.stenScore}/10</div>
                  </div>
                </div>
              ))}
              {lowScores.map((s) => (
                <div key={s.factor.id} className="flex gap-3 p-3 rounded-xl" style={{ background: "#fef9ec", border: "1px solid #e8d090" }}>
                  <span className="text-lg">↓</span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm" style={{ color: "#7a5a0a" }}>Low {s.factor.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{s.factor.lowPole} · Sten {s.stenScore}/10</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All 16 factors — staggered reveal */}
        <div className="mb-8">
          <h2
            className="font-serif text-lg sm:text-xl font-semibold mb-5 animate-fade-up"
            style={{ fontFamily: "'DM Serif Display', serif", color: "#0f1b2d", animationDelay: "0.2s" }}
          >
            All 16 Factor Scores
          </h2>
          <div className="space-y-3 sm:space-y-4">
            {scores.map((s, idx) => {
              const col   = LEVEL_COLORS[s.level];
              const delay = 0.22 + idx * 0.03;
              // Map sten 1-10 to percentage for bar width
              const barPct = ((s.stenScore - 1) / 9) * 100;
              return (
                <div
                  key={s.factor.id}
                  className="rounded-2xl p-5 sm:p-6 border animate-fade-up"
                  style={{
                    background: "white",
                    borderColor: "#e2d8c8",
                    animationDelay: `${delay}s`,
                    boxShadow: "0 2px 12px rgba(15,27,45,0.04)",
                  }}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded flex-shrink-0"
                          style={{ background: "#f5e6c8", color: "#c8861a" }}
                        >
                          Factor {s.factor.id}
                        </span>
                        <span
                          className="font-serif font-semibold text-base sm:text-lg"
                          style={{ fontFamily: "'DM Serif Display', serif", color: "#0f1b2d" }}
                        >
                          {s.factor.label}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {s.factor.lowPole} ←→ {s.factor.highPole}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div
                        className="font-serif text-xl sm:text-2xl font-bold tabular-nums"
                        style={{ fontFamily: "'DM Serif Display', serif", color: col.bar }}
                      >
                        <AnimatedSten value={s.stenScore} delay={delay * 1000} />
                        <span className="text-sm font-normal text-slate-400">/10</span>
                      </div>
                      <div
                        className="text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5 inline-block"
                        style={{ background: col.bg, color: col.text, border: `1px solid ${col.border}` }}
                      >
                        {col.label}
                      </div>
                    </div>
                  </div>

                  {/* Sten scale bar with numbered marks */}
                  <div className="mb-3">
                    <div className="relative h-2.5 rounded-full overflow-hidden" style={{ background: "#f0e8d8" }}>
                      <div
                        className="score-bar-fill h-full rounded-full"
                        style={{ width: `${barPct}%`, background: col.bar, animationDelay: `${delay}s` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 px-0.5">
                      {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                        <span
                          key={n}
                          className="text-[9px] tabular-nums"
                          style={{
                            color: n === s.stenScore ? col.bar : "#c0b8a8",
                            fontWeight: n === s.stenScore ? 700 : 400,
                          }}
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">{s.interpretation}</p>

                  {/* Raw score footnote */}
                  <p className="text-[10px] text-slate-300 mt-2">
                    Raw: {s.rawScore}/{s.maxScore}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 no-print animate-fade-up" style={{ animationDelay: "0.8s" }}>
          <button
            onClick={downloadJSON}
            className="w-full py-4 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] border-2"
            style={{ background: "white", borderColor: "#c8861a", color: "#c8861a" }}
          >
            ⬇ Download Responses as JSON
          </button>
          <button
            onClick={() => window.print()}
            className="w-full py-4 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] border"
            style={{ background: "white", borderColor: "#e2d8c8", color: "#334155" }}
          >
            🖨 Print / Save as PDF
          </button>
          <button
            onClick={onRetake}
            className="w-full py-4 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #0f1b2d, #1a2d45)", color: "white" }}
          >
            ↺ Retake the Test
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8 leading-relaxed">
          This report is for educational and self-reflection purposes only.
          {userInfo && " Sten scores are standardized against general population norms."}
          {" "}For professional interpretation, consult a qualified psychologist.
        </p>
      </div>
    </div>
  );
}
