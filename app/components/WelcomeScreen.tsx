"use client";

interface WelcomeProps {
  onStart: () => void;
  onResume: () => void;
  hasProgress: boolean;
  answeredCount: number;
}

export default function WelcomeScreen({ onStart, onResume, hasProgress, answeredCount }: WelcomeProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">

        {/* Header */}
        <div className="text-center mb-12 animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-6">
            <span>◆</span> Personality Assessment <span>◆</span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-navy-900 leading-tight mb-4"
              style={{ fontFamily: 'Lora, Georgia, serif', color: '#0f1b2d' }}>
            16 Personality<br />
            <span style={{ color: '#c8861a' }}>Factors</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed" style={{ fontFamily: 'Instrument Sans, sans-serif' }}>
            A comprehensive psychological assessment measuring 16 core dimensions of your personality, developed by Raymond Cattell.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          {[
            { icon: "📋", value: "187", label: "Questions" },
            { icon: "⏱", value: "~35", label: "Minutes" },
            { icon: "🔬", value: "16", label: "Factors" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-5 text-center border"
                 style={{ background: 'white', borderColor: '#e2d8c8', boxShadow: '0 2px 12px rgba(15,27,45,0.05)' }}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="font-serif text-3xl font-bold mb-1" style={{ color: '#c8861a', fontFamily: 'Lora, serif' }}>{s.value}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wide font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="rounded-2xl p-7 mb-8 border animate-fade-up"
             style={{ background: 'white', borderColor: '#e2d8c8', animationDelay: '0.2s' }}>
          <h3 className="font-serif font-semibold text-lg mb-4" style={{ color: '#0f1b2d', fontFamily: 'Lora, serif' }}>
            Before you begin
          </h3>
          <ol className="space-y-3">
            {[
              "Give your first, natural answer — don't overthink. Aim for 5–6 questions per minute.",
              "Avoid the middle \"uncertain\" option except when truly necessary (roughly 1 in 5 questions).",
              "Answer every question, even if it doesn't perfectly apply — give your best guess.",
              "Be honest. There are no right or wrong answers, and responses are kept confidential.",
            ].map((tip, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5"
                      style={{ background: '#f5e6c8', color: '#c8861a' }}>{i + 1}</span>
                <span>{tip}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Resume banner */}
        {hasProgress && answeredCount > 0 && (
          <div className="rounded-xl p-4 mb-4 flex items-center justify-between border animate-fade-in"
               style={{ background: '#f0f9f0', borderColor: '#a8d5b0' }}>
            <div className="text-sm" style={{ color: '#2d6b3e' }}>
              <span className="font-semibold">Progress saved</span> — you've answered {answeredCount} of 187 questions
            </div>
            <button onClick={onResume}
                    className="text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:opacity-90"
                    style={{ background: '#4a7c59', color: 'white' }}>
              Resume →
            </button>
          </div>
        )}

        {/* CTA */}
        <button onClick={onStart}
                className="w-full py-5 rounded-2xl text-lg font-semibold transition-all hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 animate-fade-up"
                style={{ background: 'linear-gradient(135deg, #0f1b2d, #1a2d45)', color: 'white', animationDelay: '0.3s',
                         boxShadow: '0 8px 32px rgba(15,27,45,0.25)' }}>
          {hasProgress && answeredCount > 0 ? "Start Fresh" : "Begin Assessment →"}
        </button>

        <p className="text-center text-xs text-slate-400 mt-4">
          Your progress is automatically saved to your browser
        </p>
      </div>
    </div>
  );
}
