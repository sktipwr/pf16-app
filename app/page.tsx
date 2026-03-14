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
  } = useTestProgress();

  const [screen, setScreen] = useState<Screen>("welcome");
  const [testStartTime, setTestStartTime] = useState<number | null>(null);

  // On mount: increment visit counter
  useEffect(() => {
    if (!loaded) return;
    fetch("/api/counter/visits", { method: "POST" }).catch(() => {});
  }, [loaded]);

  const handleStart = () => {
    resetProgress();
    setTestStartTime(Date.now());
    setScreen("test");
    fetch("/api/counter/attempts", { method: "POST" }).catch(() => {});
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

  const handleHome = () => {
    setScreen("welcome");
  };

  const handleViewReport = () => {
    setScreen("report");
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
          onViewReport={handleViewReport}
          hasProgress={answeredCount > 0 && !progress.completedAt}
          isCompleted={!!progress.completedAt}
          answeredCount={answeredCount}
          answers={progress.answers}
        />
      )}
      {screen === "test" && (
        <TestScreen
          answers={progress.answers}
          initialQuestion={progress.currentQuestion}
          onAnswer={(qi, ai) => setAnswer(qi, ai)}
          onNavigate={(idx) => setCurrentQuestion(idx)}
          onComplete={handleComplete}
          onHome={handleHome}
          startTime={testStartTime}
        />
      )}
      {screen === "report" && (
        <ReportScreen
          answers={progress.answers}
          onRetake={handleRetake}
        />
      )}
    </>
  );
}
