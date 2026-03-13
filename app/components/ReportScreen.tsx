"use client";
import { useMemo } from "react";
import { computeScores, FactorScore } from "../lib/scoring";
import { QUESTIONS } from "../lib/questions";
import SiteFooter from "./SiteFooter";

interface ReportProps {
  answers: (number | null)[];
  onRetake: () => void;
  visitCount?: number | null;
  attemptCount?: number | null;
}

const LEVEL_COLORS = {
  low:  { bg: "#fef0f0", border: "#e07070", text: "#8b2020", bar: "#e07070", label: "Low" },
  mid:  { bg: "#fef9ec", border: "#d4a843", text: "#7a5a0a", bar: "#d4a843", label: "Mid" },
  high: { bg: "#f0f9f4", border: "#6db88a", text: "#1f6b3e", bar: "#6db88a", label: "High" },
};

export default function ReportScreen({ answers, onRetake, visitCount, attemptCount }: ReportProps) {
  const scores = useMemo(() => computeScores(answers), [answers]);
  const answeredCount = answers.filter((a) => a !== null).length;
  const skippedCount = 187 - answeredCount;

  const downloadJSON = () => {
    const data = QUESTIONS.map((q, i) => ({
      question_id: q.id,
      question: q.text,
      options: q.options,
      answer_index: answers[i],
      answer_label: answers[i] !== null ? ["a", "b", "c"][answers[i]!] : null,
      answer_text: answers[i] !== null ? q.options[answers[i]!] : null,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "16pf_responses.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const highScores = scores.filter((s) => s.level === "high");
  const lowScores = scores.filter((s) => s.level === "low");

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12 animate-fade-up">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
               style={{ background: '#f5e6c8' }}>
            📊
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3"
              style={{ fontFamily: 'Lora, Georgia, serif', color: '#0f1b2d' }}>
            Your Personality Report
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            Based on your responses to the 16PF questionnaire. Scores reflect relative tendencies — there are no good or bad results.
          </p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mb-10 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          {[
            { v: answeredCount, l: "Questions Answered", c: "#4a7c59" },
            { v: skippedCount, l: "Skipped", c: skippedCount > 0 ? "#b94040" : "#4a7c59" },
            { v: `${Math.round((answeredCount / 187) * 100)}%`, l: "Completion", c: "#c8861a" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl p-5 text-center border"
                 style={{ background: 'white', borderColor: '#e2d8c8' }}>
              <div className="font-serif text-3xl font-bold mb-1" style={{ color: s.c, fontFamily: 'Lora, serif' }}>{s.v}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wide">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Notable traits */}
        {(highScores.length > 0 || lowScores.length > 0) && (
          <div className="rounded-2xl p-7 mb-8 border animate-fade-up"
               style={{ background: 'white', borderColor: '#e2d8c8', animationDelay: '0.15s' }}>
            <h2 className="font-serif text-xl font-semibold mb-5" style={{ fontFamily: 'Lora, serif', color: '#0f1b2d' }}>
              Your Strongest Traits
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {highScores.map((s) => (
                <div key={s.factor.id} className="flex gap-3 p-3 rounded-xl"
                     style={{ background: '#f0f9f4', border: '1px solid #a8d5b0' }}>
                  <span className="text-xl">↑</span>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: '#1f6b3e' }}>
                      High {s.factor.label}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{s.factor.highPole}</div>
                  </div>
                </div>
              ))}
              {lowScores.map((s) => (
                <div key={s.factor.id} className="flex gap-3 p-3 rounded-xl"
                     style={{ background: '#fef9ec', border: '1px solid #e8d090' }}>
                  <span className="text-xl">↓</span>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: '#7a5a0a' }}>
                      Low {s.factor.label}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{s.factor.lowPole}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All 16 factors */}
        <div className="mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="font-serif text-xl font-semibold mb-5" style={{ fontFamily: 'Lora, serif', color: '#0f1b2d' }}>
            All 16 Factor Scores
          </h2>
          <div className="space-y-4">
            {scores.map((s, idx) => {
              const col = LEVEL_COLORS[s.level];
              return (
                <div key={s.factor.id} className="rounded-2xl p-6 border animate-fade-up"
                     style={{ background: 'white', borderColor: '#e2d8c8', animationDelay: `${0.2 + idx * 0.03}s` }}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded"
                              style={{ background: '#f5e6c8', color: '#c8861a' }}>
                          Factor {s.factor.id}
                        </span>
                        <span className="font-serif font-semibold text-lg" style={{ fontFamily: 'Lora, serif', color: '#0f1b2d' }}>
                          {s.factor.label}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {s.factor.lowPole} ←→ {s.factor.highPole}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-serif text-2xl font-bold" style={{ fontFamily: 'Lora, serif', color: col.bar }}>
                        {s.percentage}%
                      </div>
                      <div className="text-xs font-semibold px-2 py-0.5 rounded-full"
                           style={{ background: col.bg, color: col.text, border: `1px solid ${col.border}` }}>
                        {col.label}
                      </div>
                    </div>
                  </div>

                  {/* Score bar */}
                  <div className="h-2.5 rounded-full overflow-hidden mb-3" style={{ background: '#f0e8d8' }}>
                    <div className="score-bar-fill h-full rounded-full"
                         style={{ width: `${s.percentage}%`, background: col.bar }} />
                  </div>

                  {/* Interpretation */}
                  <p className="text-sm text-slate-600 leading-relaxed">{s.interpretation}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Download + Retake */}
        <div className="space-y-3 no-print animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <button onClick={downloadJSON}
                  className="w-full py-4 rounded-xl font-semibold text-sm transition-all hover:opacity-90 border-2"
                  style={{ background: 'white', borderColor: '#c8861a', color: '#c8861a' }}>
            ⬇ Download Responses as JSON
          </button>
          <button onClick={() => window.print()}
                  className="w-full py-4 rounded-xl font-semibold text-sm transition-all hover:opacity-90 border"
                  style={{ background: 'white', borderColor: '#e2d8c8', color: '#334155' }}>
            🖨 Print / Save as PDF
          </button>
          <button onClick={onRetake}
                  className="w-full py-4 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #0f1b2d, #1a2d45)', color: 'white' }}>
            ↺ Retake the Test
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-slate-400 mt-8 leading-relaxed">
          This report is for educational and self-reflection purposes only. Scores are based on a simplified
          scoring approximation and should not be used for clinical diagnosis. For professional interpretation,
          consult a qualified psychologist.
        </p>
      </div>

      <SiteFooter visitCount={visitCount} attemptCount={attemptCount} />
    </div>
  );
}
