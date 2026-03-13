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

  // If test was already completed last session, go straight to report
  useEffect(() => {
    if (loaded && progress.completedAt) {
      setScreen("report");
    }
  }, [loaded]);

  const handleStart = () => {
    resetProgress();
    setScreen("test");
  };

  const handleResume = () => {
    setScreen("test");
  };

  const handleComplete = () => {
    completeTest();
    setScreen("report");
  };

  const handleRetake = () => {
    resetProgress();
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
        />
      )}
      {screen === "test" && (
        <TestScreen
          answers={progress.answers}
          initialQuestion={progress.currentQuestion}
          onAnswer={(qi, ai) => setAnswer(qi, ai)}
          onNavigate={(idx) => setCurrentQuestion(idx)}
          onComplete={handleComplete}
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
