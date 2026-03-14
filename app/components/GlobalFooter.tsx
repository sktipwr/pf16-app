"use client";
import { useEffect, useState } from "react";

export default function GlobalFooter() {
  const [visitCount, setVisitCount] = useState<number | null>(null);
  const [attemptCount, setAttemptCount] = useState<number | null>(null);

  const today = new Date().toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    fetch("/api/counter/visits")
      .then((r) => r.json())
      .then((d) => setVisitCount(d.value ?? null))
      .catch(() => {});
    fetch("/api/counter/attempts")
      .then((r) => r.json())
      .then((d) => setAttemptCount(d.value ?? null))
      .catch(() => {});
  }, []);

  return (
    <>
      {/* Fixed footer bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 border-t"
        style={{
          background: "rgba(250,246,238,0.97)",
          backdropFilter: "blur(10px)",
          borderColor: "#e2d8c8",
        }}
      >
        <div className="max-w-3xl mx-auto px-3 py-1.5 flex items-center justify-between gap-2">
          {/* Left: date */}
          <span className="text-xs text-slate-400 whitespace-nowrap">
            📅 {today}
          </span>

          {/* Centre: visitor + attempt stats — pill-style highlight */}
          <div className="flex items-center gap-2">
            <span
              className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{ background: "#f0e6d0", color: "#9a6e1f" }}
            >
              👁{" "}
              {visitCount != null ? visitCount.toLocaleString("en-IN") : "—"}{" "}
              visitors
            </span>
            <span
              className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{ background: "#e8f4ec", color: "#2e7d4f" }}
            >
              ✏️{" "}
              {attemptCount != null
                ? attemptCount.toLocaleString("en-IN")
                : "—"}{" "}
              taken
            </span>
          </div>

          {/* Right: author */}
          <p className="text-xs text-slate-400 whitespace-nowrap">
            ♥{" "}
            <a
              href="https://softles.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:underline"
              style={{ color: "#c8861a" }}
            >
              softles.in
            </a>
          </p>
        </div>
      </div>

      {/* Floating WhatsApp feedback button */}
      <a
        href="https://wa.me/919540494104?text=Hi%2C%20I%20have%20feedback%2Fbug%20report%20for%20the%2016PF%20app%3A"
        target="_blank"
        rel="noopener noreferrer"
        className="wa-pulse fixed z-50 flex items-center gap-2 rounded-full transition-all hover:scale-105 active:scale-95"
        style={{
          bottom: "52px",
          right: "16px",
          background: "#25D366",
          color: "white",
          padding: "10px 16px",
          boxShadow: "0 4px 20px rgba(37,211,102,0.45)",
        }}
        title="Send Feedback or Report a Bug on WhatsApp"
      >
        {/* WhatsApp SVG icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
        <span className="text-sm font-semibold">Feedback</span>
      </a>
    </>
  );
}
