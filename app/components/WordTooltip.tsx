"use client";
import { useState } from "react";
import { GLOSSARY } from "../lib/glossary";

interface TooltipProps {
  word: string;
  definition: string;
}

function Tooltip({ word, definition }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const cleanWord = word.replace(/[^a-zA-Z]/g, "");

  return (
    <span style={{ position: "relative", display: "inline" }}>
      <span
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={() => setVisible((v) => !v)}
        style={{
          borderBottom: "1.5px dotted #c8861a",
          cursor: "help",
        }}
      >
        {word}
      </span>
      {visible && (
        <span
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#0f1b2d",
            color: "#f0e8d8",
            fontSize: "12px",
            lineHeight: "1.5",
            padding: "8px 12px",
            borderRadius: "8px",
            width: "200px",
            zIndex: 200,
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            pointerEvents: "none",
            display: "block",
          }}
        >
          <span
            style={{
              fontWeight: 700,
              color: "#d4a843",
              display: "block",
              marginBottom: "3px",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {cleanWord}
          </span>
          {definition}
          {/* Arrow */}
          <span
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid #0f1b2d",
            }}
          />
        </span>
      )}
    </span>
  );
}

// Renders text with glossary tooltips on matched words
export function QuestionText({ text }: { text: string }) {
  const parts = text.split(/(\s+)/);
  return (
    <>
      {parts.map((part, i) => {
        const clean = part.toLowerCase().replace(/[^a-z]/g, "");
        if (clean && GLOSSARY[clean]) {
          return <Tooltip key={i} word={part} definition={GLOSSARY[clean]} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
