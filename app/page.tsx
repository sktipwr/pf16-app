"use client";
import { useState, useEffect } from "react";
import { useTestProgress } from "./lib/useTestProgress";
import WelcomeScreen from "./components/WelcomeScreen";
import TestScreen from "./components/TestScreen";
import ReportScreen from "./components/ReportScreen";

type Screen = "welcome" | "test" | "report";

export default function Home() {
  const {
    progress,
    loaded,
    setAnswer,
    setCurrentQuestion,
    completeTest,
    resetProgress,
    answeredCount,
    isComplete,
  } = useTestProgress();

  const [screen, setScreen] = useState<Screen>("welcome");
  const [visitCount, setVisitCount] = useState<number | null>(null);
  const [attemptCount, setAttemptCount] = useState<number | null>(null);
  const [testStartTime, setTestStartTime] = useState<number | null>(null);

  // If test was already completed last session, go straight to report
  useEffect(() => {
    if (loaded && progress.completedAt) {
      setScreen("report");
    }
  }, [loaded]);

  // On mount: increment visit counter, read attempt count
  useEffect(() => {
    if (!loaded) return;
    fetch("/api/counter/visits", { method: "POST" })
      .then((r) => r.json())
      .then((d) => setVisitCount(d.value ?? null))
      .catch(() => {});

    fetch("/api/counter/attempts")
      .then((r) => r.json())
      .then((d) => setAttemptCount(d.value ?? null))
      .catch(() => {});
  }, [loaded]);

  const handleStart = () => {
    resetProgress();
    setTestStartTime(Date.now());
    setScreen("test");
    // Increment attempt counter
    fetch("/api/counter/attempts", { method: "POST" })
      .then((r) => r.json())
      .then((d) => setAttemptCount(d.value ?? null))
      .catch(() => {});
  };

  const handleResume = () => {
    if (!testStartTime) setTestStartTime(Date.now());
    setScreen("test");
  };

  const handleComplete = () => {
    completeTest();
    setScreen("report");
  };

  const handleRetake = () => {
    resetProgress();
    setTestStartTime(null);
    setScreen("welcome");
  };

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <>
      {screen === "welcome" && (
        <WelcomeScreen
          onStart={handleStart}
          onResume={handleResume}
          hasProgress={answeredCount > 0}
          answeredCount={answeredCount}
          visitCount={visitCount}
          attemptCount={attemptCount}
        />
      )}
      {screen === "test" && (
        <TestScreen
          answers={progress.answers}
          initialQuestion={progress.currentQuestion}
          onAnswer={(qi, ai) => setAnswer(qi, ai)}
          onNavigate={(idx) => setCurrentQuestion(idx)}
          onComplete={handleComplete}
          startTime={testStartTime}
        />
      )}
      {screen === "report" && (
        <ReportScreen
          answers={progress.answers}
          onRetake={handleRetake}
          visitCount={visitCount}
          attemptCount={attemptCount}
        />
      )}
    </>
  );
}
