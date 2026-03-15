"use client";
import { useState } from "react";
import type { UserInfo } from "../lib/useTestProgress";
import type { Gender } from "../lib/norms";

interface UserInfoFormProps {
  onSubmit: (info: UserInfo) => void;
  onBack: () => void;
}

export default function UserInfoForm({ onSubmit, onBack }: UserInfoFormProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender | "">("");

  const isValid = name.trim().length >= 2 && age && parseInt(age) >= 10 && parseInt(age) <= 100 && gender;

  const handleSubmit = () => {
    if (!isValid || !gender) return;
    onSubmit({ name: name.trim(), age: parseInt(age), gender });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 pb-24">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-up">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"
            style={{ background: "#fdf4e3", border: "2px solid #e8c97a" }}
          >
            👤
          </div>
          <h2
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: "#0f1b2d" }}
          >
            About You
          </h2>
          <p className="text-sm text-slate-400">
            This helps us score your results accurately
          </p>
        </div>

        {/* Form */}
        <div
          className="rounded-2xl p-5 sm:p-6 border animate-fade-up"
          style={{ background: "white", borderColor: "#e2d8c8", animationDelay: "0.08s" }}
        >
          {/* Name */}
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2" style={{ color: "#0f1b2d" }}>
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2"
              style={{
                borderColor: "#e2d8c8",
                background: "#faf8f4",
                color: "#0f1b2d",
              }}
              autoFocus
            />
          </div>

          {/* Age */}
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2" style={{ color: "#0f1b2d" }}>
              Your Age
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 25"
              min={10}
              max={100}
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2"
              style={{
                borderColor: "#e2d8c8",
                background: "#faf8f4",
                color: "#0f1b2d",
              }}
            />
          </div>

          {/* Gender */}
          <div className="mb-2">
            <label className="block text-sm font-semibold mb-2" style={{ color: "#0f1b2d" }}>
              Gender
            </label>
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: "male" as Gender, label: "Male", icon: "♂" },
                { value: "female" as Gender, label: "Female", icon: "♀" },
              ]).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setGender(option.value)}
                  className="py-3 px-4 rounded-xl border text-sm font-semibold transition-all active:scale-[0.98]"
                  style={{
                    borderColor: gender === option.value ? "#c8861a" : "#e2d8c8",
                    background: gender === option.value
                      ? "linear-gradient(135deg, rgba(200,134,26,0.08), rgba(232,184,75,0.08))"
                      : "#faf8f4",
                    color: gender === option.value ? "#c8861a" : "#64748b",
                    borderWidth: gender === option.value ? "2px" : "1px",
                  }}
                >
                  <span className="mr-1.5">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 space-y-3 animate-fade-up" style={{ animationDelay: "0.16s" }}>
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className="w-full py-4 rounded-2xl text-base font-semibold transition-all active:scale-[0.98]"
            style={{
              background: isValid
                ? "linear-gradient(135deg, #0f1b2d, #1a2d45)"
                : "#d1d5db",
              color: "white",
              boxShadow: isValid ? "0 8px 32px rgba(15,27,45,0.25)" : "none",
              cursor: isValid ? "pointer" : "not-allowed",
            }}
          >
            Continue →
          </button>

          <button
            onClick={onBack}
            className="w-full py-3 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
          >
            ← Back
          </button>
        </div>

        <p className="text-center text-[11px] text-slate-300 mt-4">
          Your information stays on your device and is never shared
        </p>
      </div>
    </div>
  );
}
