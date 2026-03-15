"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import type { Gender } from "./norms";

const STORAGE_KEY = "16pf_progress_v2";

export interface UserInfo {
  name: string;
  age: number;
  gender: Gender;
}

export interface TestProgress {
  answers: (number | null)[];   // index 0-186, value 0/1/2 or null
  currentQuestion: number;
  startedAt: string;
  completedAt?: string;
  userInfo?: UserInfo;
}

const DEFAULT_PROGRESS: TestProgress = {
  answers: new Array(187).fill(null),
  currentQuestion: 0,
  startedAt: new Date().toISOString(),
};

export function useTestProgress() {
  const [progress, setProgress] = useState<TestProgress>(DEFAULT_PROGRESS);
  const [loaded, setLoaded] = useState(false);
  const progressRef = useRef<TestProgress>(DEFAULT_PROGRESS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProgress(parsed);
        progressRef.current = parsed;
      }
    } catch {}
    setLoaded(true);
  }, []);

  const saveProgress = useCallback((p: TestProgress) => {
    progressRef.current = p;
    setProgress(p);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch {}
  }, []);

  const setAnswer = useCallback((questionIndex: number, answerIndex: number) => {
    const latest = progressRef.current;
    const next = { ...latest, answers: [...latest.answers] };
    next.answers[questionIndex] = answerIndex;
    saveProgress(next);
  }, [saveProgress]);

  const setCurrentQuestion = useCallback((idx: number) => {
    const latest = progressRef.current;
    saveProgress({ ...latest, currentQuestion: idx });
  }, [saveProgress]);

  const completeTest = useCallback(() => {
    const latest = progressRef.current;
    saveProgress({ ...latest, completedAt: new Date().toISOString() });
  }, [saveProgress]);

  const setUserInfo = useCallback((info: UserInfo) => {
    const latest = progressRef.current;
    saveProgress({ ...latest, userInfo: info });
  }, [saveProgress]);

  const resetProgress = useCallback(() => {
    const fresh: TestProgress = {
      answers: new Array(187).fill(null),
      currentQuestion: 0,
      startedAt: new Date().toISOString(),
    };
    saveProgress(fresh);
  }, [saveProgress]);

  const answeredCount = progress.answers.filter((a) => a !== null).length;
  const isComplete = answeredCount === 187;

  return {
    progress,
    loaded,
    setAnswer,
    setCurrentQuestion,
    setUserInfo,
    completeTest,
    resetProgress,
    answeredCount,
    isComplete,
  };
}
