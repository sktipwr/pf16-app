"use client";
import { useState } from "react";

const QUOTES = [
  { text: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle" },
  { text: "Who looks outside, dreams; who looks inside, awakes.", author: "Carl Jung" },
  { text: "The privilege of a lifetime is to become who you truly are.", author: "Carl Jung" },
  { text: "Character is destiny.", author: "Heraclitus" },
  { text: "What lies behind us and what lies before us are small matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
  { text: "The curious paradox is that when I accept myself just as I am, then I can change.", author: "Carl Rogers" },
  { text: "Man's main task is to give birth to himself.", author: "Erich Fromm" },
  { text: "The greatest thing in the world is to know how to belong to oneself.", author: "Michel de Montaigne" },
  { text: "We know what we are, but know not what we may be.", author: "William Shakespeare" },
  { text: "Everything that irritates us about others can lead us to an understanding of ourselves.", author: "Carl Jung" },
  { text: "He who knows others is wise; he who knows himself is enlightened.", author: "Lao Tzu" },
  { text: "Personality is the original personal property.", author: "Norman O. Brown" },
  { text: "There is nothing noble in being superior to your fellow man; true nobility is being superior to your former self.", author: "Ernest Hemingway" },
  { text: "Your vision will become clear only when you look into your heart.", author: "Carl Jung" },
];

interface Props {
  visitCount?: number | null;
  attemptCount?: number | null;
}

export default function SiteFooter({ visitCount, attemptCount }: Props) {
  const [quote] = useState(
    () => QUOTES[Math.floor(Math.random() * QUOTES.length)]
  );
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="text-center px-4 pb-10 pt-4 space-y-5">
      {/* Live stats */}
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-slate-400">
        <span>📅 {today}</span>
        {visitCount != null && (
          <span>👁 {visitCount.toLocaleString()} visitors</span>
        )}
        {attemptCount != null && (
          <span>✏️ {attemptCount.toLocaleString()} assessments taken</span>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 max-w-xs mx-auto">
        <div className="flex-1 h-px" style={{ background: "#e2d8c8" }} />
        <span style={{ color: "#c8861a", fontSize: "10px" }}>✦</span>
        <div className="flex-1 h-px" style={{ background: "#e2d8c8" }} />
      </div>

      {/* Quote */}
      <blockquote className="max-w-md mx-auto">
        <p className="text-sm text-slate-500 italic leading-relaxed">
          &ldquo;{quote.text}&rdquo;
        </p>
        <footer
          className="text-xs font-semibold mt-1"
          style={{ color: "#c8861a" }}
        >
          — {quote.author}
        </footer>
      </blockquote>

      {/* Author credit */}
      <p className="text-xs text-slate-400">
        Created with ♥ by{" "}
        <a
          href="https://softles.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold hover:underline"
          style={{ color: "#c8861a" }}
        >
          softles.com
        </a>
      </p>
    </div>
  );
}
