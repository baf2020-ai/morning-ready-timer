"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { CHARACTERS } from "@/lib/constants";
import Character from "@/components/svg/characters/Character";
import type { CharacterType, TaskIconType } from "@/lib/types";

const ICON_OPTIONS: { value: TaskIconType; label: string }[] = [
  { value: "blanket", label: "이불" },
  { value: "meal", label: "밥" },
  { value: "brush", label: "양치" },
  { value: "clothes", label: "옷" },
  { value: "backpack", label: "가방" },
  { value: "shoes", label: "신발" },
];

export default function SettingsPage() {
  const router = useRouter();
  const {
    settings,
    updateProfile,
    updateTaskDuration,
    removeTask,
    reorderTasks,
    addTask,
    setTargetTime,
    setPinCode,
    resetToDefaults,
  } = useSettingsStore();
  const [pinInput, setPinInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(!settings.pinCode);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskLabel, setNewTaskLabel] = useState("");
  const [newTaskIcon, setNewTaskIcon] = useState<TaskIconType>("blanket");
  const [newTaskMinutes, setNewTaskMinutes] = useState(5);

  const handlePinSubmit = () => {
    if (settings.pinCode && pinInput === settings.pinCode) {
      setIsUnlocked(true);
    }
    setPinInput("");
  };

  const handleAddTask = () => {
    if (!newTaskLabel.trim()) return;
    addTask({
      id: `custom-${Date.now()}`,
      label: newTaskLabel.trim(),
      icon: newTaskIcon,
      durationSeconds: newTaskMinutes * 60,
    });
    setNewTaskLabel("");
    setNewTaskMinutes(5);
    setShowAddTask(false);
  };

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 px-6" style={{ backgroundColor: "#FFF9E6" }}>
        <p className="text-2xl font-bold" style={{ color: "#2D3436" }}>🔒 설정 잠금</p>
        <p className="text-sm" style={{ color: "#636E72" }}>PIN 번호를 입력하세요</p>
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={pinInput}
          onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
          className="w-40 text-center text-2xl tracking-[0.5em] py-3 rounded-xl border-2 border-gray-300 focus:border-[#FF6B6B] outline-none"
          style={{ backgroundColor: "#FFFFFF" }}
        />
        <div className="flex gap-3">
          <button onClick={() => router.back()} className="px-6 py-2 rounded-full" style={{ backgroundColor: "#E0E0E0" }}>
            뒤로
          </button>
          <button onClick={handlePinSubmit} className="px-6 py-2 rounded-full text-white font-bold" style={{ backgroundColor: "#FF6B6B" }}>
            확인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#FFF9E6" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ backgroundColor: "#FFFFFF" }}>
        <button onClick={() => router.push("/")} className="text-sm" style={{ color: "#636E72" }}>
          ← 뒤로
        </button>
        <h1 className="text-lg font-bold" style={{ color: "#2D3436" }}>⚙️ 부모 설정</h1>
        <button onClick={() => router.push("/stats")} className="text-sm" style={{ color: "#4ECDC4" }}>
          📊 통계
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* 프로필 설정 */}
        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-base font-bold mb-3" style={{ color: "#2D3436" }}>👧 프로필</h2>
          {settings.profiles.map((profile) => (
            <div key={profile.id} className="flex items-center gap-3 mb-4">
              <Character type={profile.characterType} size={50} expression="happy" />
              <div className="flex-1 space-y-2">
                <input
                  value={profile.name}
                  onChange={(e) => updateProfile(profile.id, { name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-[#FF6B6B] outline-none"
                  placeholder="이름"
                />
                <div className="flex gap-2">
                  {CHARACTERS.map((c) => (
                    <button
                      key={c.type}
                      onClick={() => updateProfile(profile.id, { characterType: c.type as CharacterType })}
                      className={`px-2 py-1 rounded-lg text-xs border-2 ${
                        profile.characterType === c.type
                          ? "border-[#FF6B6B] bg-red-50"
                          : "border-gray-200"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* 등원 목표 시간 */}
        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-base font-bold mb-3" style={{ color: "#2D3436" }}>🕐 등원 목표 시간</h2>
          <div className="flex items-center gap-3">
            <input
              type="time"
              value={settings.targetTime ?? ""}
              onChange={(e) => setTargetTime(e.target.value || null)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-[#FF6B6B] outline-none"
            />
            {settings.targetTime && (
              <>
                <span className="text-xs" style={{ color: "#636E72" }}>
                  시작 추천: {(() => {
                    const totalMin = settings.tasks.reduce((s, t) => s + t.durationSeconds, 0) / 60;
                    const [h, m] = settings.targetTime.split(":").map(Number);
                    const startMin = h * 60 + m - totalMin - 10; // 10분 여유
                    const sh = Math.floor(startMin / 60);
                    const sm = Math.round(startMin % 60);
                    return `${sh}:${sm.toString().padStart(2, "0")}`;
                  })()}
                </span>
                <button
                  onClick={() => setTargetTime(null)}
                  className="text-red-400 text-sm"
                >
                  ✕
                </button>
              </>
            )}
          </div>
          {settings.targetTime && (
            <p className="text-xs mt-2" style={{ color: "#636E72" }}>
              총 준비시간 {Math.round(settings.tasks.reduce((s, t) => s + t.durationSeconds, 0) / 60)}분 + 여유 10분 기준
            </p>
          )}
        </section>

        {/* 준비 항목 설정 */}
        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold" style={{ color: "#2D3436" }}>📋 준비 항목</h2>
            <button
              onClick={() => setShowAddTask(!showAddTask)}
              className="px-3 py-1 rounded-full text-xs text-white font-bold"
              style={{ backgroundColor: "#4ECDC4" }}
            >
              + 추가
            </button>
          </div>

          {/* 항목 추가 폼 */}
          {showAddTask && (
            <div className="mb-4 p-3 rounded-xl border-2 border-dashed border-[#4ECDC4] bg-[#F0FFF4] space-y-2">
              <input
                value={newTaskLabel}
                onChange={(e) => setNewTaskLabel(e.target.value)}
                placeholder="항목 이름 (예: 머리 빗기)"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-[#4ECDC4] outline-none"
              />
              <div className="flex items-center gap-2">
                <select
                  value={newTaskIcon}
                  onChange={(e) => setNewTaskIcon(e.target.value as TaskIconType)}
                  className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 text-sm"
                >
                  {ICON_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={newTaskMinutes}
                  onChange={(e) => setNewTaskMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center px-1 py-1.5 rounded-lg border border-gray-200 text-sm"
                />
                <span className="text-xs" style={{ color: "#636E72" }}>분</span>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowAddTask(false)}
                  className="px-3 py-1.5 rounded-full text-xs"
                  style={{ color: "#636E72" }}
                >
                  취소
                </button>
                <button
                  onClick={handleAddTask}
                  disabled={!newTaskLabel.trim()}
                  className="px-4 py-1.5 rounded-full text-xs text-white font-bold disabled:opacity-50"
                  style={{ backgroundColor: "#4ECDC4" }}
                >
                  추가
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {settings.tasks.map((task, index) => (
              <div key={task.id} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => index > 0 && reorderTasks(index, index - 1)}
                    disabled={index === 0}
                    className="text-xs opacity-50 disabled:opacity-20"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => index < settings.tasks.length - 1 && reorderTasks(index, index + 1)}
                    disabled={index === settings.tasks.length - 1}
                    className="text-xs opacity-50 disabled:opacity-20"
                  >
                    ▼
                  </button>
                </div>
                <span className="flex-1 text-sm font-medium">{task.label}</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={Math.floor(task.durationSeconds / 60)}
                    onChange={(e) => {
                      const mins = Math.max(1, Math.min(60, parseInt(e.target.value) || 1));
                      updateTaskDuration(task.id, mins * 60);
                    }}
                    className="w-14 text-center px-1 py-1 rounded border border-gray-200 text-sm"
                  />
                  <span className="text-xs" style={{ color: "#636E72" }}>분</span>
                </div>
                <button
                  onClick={() => {
                    if (settings.tasks.length > 1) removeTask(task.id);
                  }}
                  className="text-red-400 text-sm px-2"
                  disabled={settings.tasks.length <= 1}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs mt-2 text-center" style={{ color: "#636E72" }}>
            총 {Math.round(settings.tasks.reduce((s, t) => s + t.durationSeconds, 0) / 60)}분
          </p>
        </section>

        {/* PIN 설정 */}
        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-base font-bold mb-3" style={{ color: "#2D3436" }}>🔒 설정 잠금</h2>
          {!showPinSetup ? (
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: "#636E72" }}>
                {settings.pinCode ? "PIN이 설정되어 있습니다" : "PIN 미설정"}
              </p>
              <button
                onClick={() => setShowPinSetup(true)}
                className="px-4 py-1.5 rounded-full text-sm text-white"
                style={{ backgroundColor: "#4ECDC4" }}
              >
                {settings.pinCode ? "변경" : "설정"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                placeholder="4자리 숫자"
                className="flex-1 text-center py-2 rounded-lg border border-gray-200 focus:border-[#FF6B6B] outline-none"
              />
              <button
                onClick={() => {
                  setPinCode(pinInput || null);
                  setPinInput("");
                  setShowPinSetup(false);
                }}
                className="px-4 py-2 rounded-full text-white text-sm"
                style={{ backgroundColor: "#FF6B6B" }}
              >
                저장
              </button>
              <button
                onClick={() => { setShowPinSetup(false); setPinInput(""); }}
                className="px-3 py-2 text-sm"
                style={{ color: "#636E72" }}
              >
                취소
              </button>
            </div>
          )}
        </section>

        {/* 초기화 */}
        <section className="text-center pb-6">
          <button
            onClick={() => {
              if (confirm("모든 설정을 초기화하시겠습니까?")) {
                resetToDefaults();
              }
            }}
            className="text-sm underline"
            style={{ color: "#FF6B6B" }}
          >
            설정 초기화
          </button>
        </section>
      </div>
    </div>
  );
}
