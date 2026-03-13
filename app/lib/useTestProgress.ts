"use client";
import { useState, useEffect } from "react";

const STORAGE_KEY = "16pf_progress_v1";

export interface TestProgress {
  answers: (number | null)[];   // index 0-186, value 0/1/2 or null
  currentQuestion: number;
  startedAt: string;
  completedAt?: string;
}

const DEFAULT_PROGRESS: TestProgress = {
  answers: new Array(187).fill(null),
  currentQuestion: 0,
  startedAt: new Date().toISOString(),
};

export function useTestProgress() {
  const [progress, setProgress] = useState<TestProgress>(DEFAULT_PROGRESS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProgress(JSON.parse(stored));
      }
    } catch {}
    setLoaded(true);
  }, []);

  const saveProgress = (p: TestProgress) => {
    setProgress(p);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch {}
  };

  const setAnswer = (questionIndex: number, answerIndex: number) => {
    const next = { ...progress, answers: [...progress.answers] };
    next.answers[questionIndex] = answerIndex;
    saveProgress(next);
  };

  const setCurrentQuestion = (idx: number) => {
    saveProgress({ ...progress, currentQuestion: idx });
  };

  const completeTest = () => {
    saveProgress({ ...progress, completedAt: new Date().toISOString() });
  };

  const resetProgress = () => {
    const fresh: TestProgress = {
      answers: new Array(187).fill(null),
      currentQuestion: 0,
      startedAt: new Date().toISOString(),
    };
    saveProgress(fresh);
  };

  const answeredCount = progress.answers.filter((a) => a !== null).length;
  const isComplete = answeredCount === 187;

  return {
    progress,
    loaded,
    setAnswer,
    setCurrentQuestion,
    completeTest,
    resetProgress,
    answeredCount,
    isComplete,
  };
}
