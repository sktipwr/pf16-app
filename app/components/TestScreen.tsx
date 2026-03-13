"use client";
import { useState, useEffect } from "react";
import { QUESTIONS } from "../lib/questions";

interface TestScreenProps {
  answers: (number | null)[];
  initialQuestion: number;
  onAnswer: (questionIndex: number, answerIndex: number) => void;
  onNavigate: (idx: number) => void;
  onComplete: () => void;
}

const OPTION_LABELS = ["A", "B", "C"];
const OPTION_COLORS = [
  { bg: "#fef9ec", border: "#d4a843", text: "#7a5a0a", dot: "#c8861a" },
  { bg: "#f0f4ff", border: "#7b9cf0", text: "#2a4090", dot: "#4a6dd4" },
  { bg: "#f0faf4", border: "#6db88a", text: "#1f6b3e", dot: "#4a7c59" },
];

export default function TestScreen({ answers, initialQuestion, onAnswer, onNavigate, onComplete }: TestScreenProps) {
  const [current, setCurrent] = useState(initialQuestion);
  const [key, setKey] = useState(0); // for re-animation

  const q = QUESTIONS[current];
  const answeredCount = answers.filter((a) => a !== null).length;
  const pct = Math.round((answeredCount / 187) * 100);
  const isLast = current === 186;
  const selectedAnswer = answers[current];

  useEffect(() => {
    setKey((k) => k + 1);
  }, [current]);

  const goNext = () => {
    if (selectedAnswer === null) return;
    if (isLast) { onComplete(); return; }
    const next = current + 1;
    setCurrent(next);
    onNavigate(next);
  };

  const goPrev = () => {
    if (current === 0) return;
    const prev = current - 1;
    setCurrent(prev);
    onNavigate(prev);
  };

  const selectAnswer = (idx: number) => {
    onAnswer(current, idx);
  };

  // Jump to question by clicking progress dots (chunked)
  const chunk = Math.floor(current / 25);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-10 px-4 py-3 border-b"
           style={{ background: 'rgba(250,246,238,0.95)', backdropFilter: 'blur(8px)', borderColor: '#e2d8c8' }}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[90px]">
              Q {current + 1} / 187
            </span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#e8dfc8' }}>
              <div className="progress-fill h-full rounded-full"
                   style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #c8861a, #d4a843)' }} />
            </div>
            <span className="text-xs font-semibold min-w-[36px] text-right" style={{ color: '#c8861a' }}>
              {pct}%
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>{answeredCount} answered</span>
            <span>{187 - answeredCount} remaining</span>
          </div>
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="max-w-2xl w-full">

          {/* Question card */}
          <div key={key} className="animate-fade-up rounded-2xl p-8 mb-6 border"
               style={{ background: 'white', borderColor: '#e2d8c8', boxShadow: '0 4px 24px rgba(15,27,45,0.07)' }}>
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
                    style={{ background: '#f5e6c8', color: '#c8861a' }}>
                Question {String(current + 1).padStart(3, "0")}
              </span>
            </div>
            <p className="font-serif text-xl md:text-2xl leading-relaxed mb-8"
               style={{ fontFamily: 'Lora, Georgia, serif', color: '#0f1b2d' }}>
              {q.text}
            </p>

            {/* Options */}
            <div className="space-y-3">
              {q.options.map((opt, i) => {
                const selected = selectedAnswer === i;
                const col = OPTION_COLORS[i];
                return (
                  <button
                    key={i}
                    onClick={() => selectAnswer(i)}
                    className="option-btn w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left"
                    style={{
                      background: selected ? col.bg : "white",
                      borderColor: selected ? col.border : "#e2d8c8",
                      boxShadow: selected ? `0 4px 16px ${col.border}33` : "none",
                    }}>
                    <div className="flex-shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold"
                         style={{
                           borderColor: selected ? col.dot : "#d0c8b8",
                           background: selected ? col.dot : "transparent",
                           color: selected ? "white" : "#8a7f6e",
                         }}>
                      {OPTION_LABELS[i]}
                    </div>
                    <span className="text-sm md:text-base leading-snug"
                          style={{ color: selected ? col.text : "#334155" }}>
                      {opt}
                    </span>
                    {selected && (
                      <span className="ml-auto text-lg">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <button onClick={goPrev} disabled={current === 0}
                    className="px-6 py-3 rounded-xl border text-sm font-medium transition-all disabled:opacity-30 hover:border-slate-400"
                    style={{ borderColor: '#e2d8c8', color: '#334155', background: 'white' }}>
              ← Back
            </button>
            <button onClick={goNext} disabled={selectedAnswer === null}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-30 hover:opacity-90 hover:-translate-y-0.5"
                    style={{
                      background: isLast
                        ? 'linear-gradient(135deg, #4a7c59, #2d6b3e)'
                        : 'linear-gradient(135deg, #0f1b2d, #1a2d45)',
                      color: 'white',
                      boxShadow: selectedAnswer !== null ? '0 4px 16px rgba(15,27,45,0.2)' : 'none'
                    }}>
              {isLast ? "Complete & View Report ✓" : "Next Question →"}
            </button>
          </div>

          {/* Quick jump */}
          <div className="mt-6 flex flex-wrap gap-1 justify-center">
            {QUESTIONS.map((_, i) => {
              const ans = answers[i];
              const isCurrent = i === current;
              return (
                <button key={i} onClick={() => { setCurrent(i); onNavigate(i); }}
                        className="w-4 h-4 rounded-sm transition-all hover:scale-125"
                        title={`Q${i + 1}`}
                        style={{
                          background: isCurrent ? '#c8861a' : ans !== null ? '#4a7c59' : '#e2d8c8',
                          opacity: isCurrent ? 1 : 0.7,
                        }} />
              );
            })}
          </div>
          <p className="text-center text-xs text-slate-400 mt-2">Click any square to jump to that question</p>
        </div>
      </div>
    </div>
  );
}
