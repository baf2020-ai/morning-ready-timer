"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { CHARACTERS, COLORS } from "@/lib/constants";
import Character from "@/components/svg/characters/Character";
import { SunIcon, MoonIcon } from "@/components/svg/icons/RoutineIcons";
import type { CharacterType, TaskIconType, RoutineType } from "@/lib/types";

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
    getTasksForRoutine,
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
  const [routineTab, setRoutineTab] = useState<RoutineType>("morning");

  const currentTasks = getTasksForRoutine(routineTab);

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
    }, routineTab);
    setNewTaskLabel("");
    setNewTaskMinutes(5);
    setShowAddTask(false);
  };

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 px-6 paper-bg" style={{ backgroundColor: COLORS.bgPurple }}>
        <p className="text-2xl" style={{ color: COLORS.textDark }}>설정 잠금</p>
        <p className="text-sm" style={{ color: COLORS.textSub }}>PIN 번호를 입력하세요</p>
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={pinInput}
          onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
          className="w-40 text-center text-2xl tracking-[0.5em] py-3 rounded-xl border-3 outline-none"
          style={{ borderColor: COLORS.primary, backgroundColor: "#FFFFFF", fontFamily: "Fredoka" }}
        />
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 rounded-full"
            style={{ backgroundColor: "#F0EBFF", color: COLORS.textSub }}
          >
            뒤로
          </button>
          <button
            onClick={handlePinSubmit}
            className="jelly-btn px-6 py-2 text-white"
            style={{ backgroundColor: COLORS.primary, "--btn-shadow": "#5041C0" } as React.CSSProperties}
          >
            확인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full paper-bg" style={{ backgroundColor: COLORS.bgPurple }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: "#FFFFFF", borderBottom: `2px solid #F0EBFF` }}
      >
        <button
          onClick={() => router.push("/")}
          className="text-sm px-3 py-1 rounded-full"
          style={{ color: COLORS.textSub, backgroundColor: "rgba(108,92,231,0.06)" }}
        >
          ← 뒤로
        </button>
        <h1 className="text-lg" style={{ color: COLORS.primary }}>부모 설정</h1>
        <button
          onClick={() => router.push("/stats")}
          className="text-sm px-3 py-1 rounded-full"
          style={{ color: COLORS.primary, backgroundColor: "rgba(108,92,231,0.06)" }}
        >
          통계
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* 프로필 설정 */}
        <section className="sticker-card p-4" style={{ transform: "rotate(0deg)", borderRadius: "20px" }}>
          <h2 className="text-base mb-3" style={{ color: COLORS.primary }}>프로필</h2>
          {settings.profiles.map((profile) => (
            <div key={profile.id} className="flex items-center gap-3 mb-4">
              <div className="char-idle">
                <Character type={profile.characterType} size={50} expression="happy" />
              </div>
              <div className="flex-1 space-y-2">
                <input
                  value={profile.name}
                  onChange={(e) => updateProfile(profile.id, { name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border-2 text-sm outline-none"
                  style={{ borderColor: "#F0EBFF", fontFamily: "Jua" }}
                  placeholder="이름"
                />
                <div className="flex gap-2">
                  {CHARACTERS.map((c) => (
                    <button
                      key={c.type}
                      onClick={() => updateProfile(profile.id, { characterType: c.type as CharacterType })}
                      className="px-2 py-1 rounded-lg text-xs border-2 transition-colors"
                      style={{
                        borderColor: profile.characterType === c.type ? COLORS.primary : "#F0EBFF",
                        backgroundColor: profile.characterType === c.type ? "#F0EBFF" : "transparent",
                        color: profile.characterType === c.type ? COLORS.primary : COLORS.textSub,
                      }}
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
        <section className="sticker-card p-4" style={{ transform: "rotate(0deg)", borderRadius: "20px" }}>
          <h2 className="text-base mb-3" style={{ color: COLORS.primary }}>등원 목표 시간</h2>
          <div className="flex items-center gap-3">
            <input
              type="time"
              value={settings.targetTime ?? ""}
              onChange={(e) => setTargetTime(e.target.value || null)}
              className="flex-1 px-3 py-2 rounded-lg border-2 text-sm outline-none"
              style={{ borderColor: "#F0EBFF", fontFamily: "Fredoka" }}
            />
            {settings.targetTime && (
              <>
                <span className="text-xs" style={{ color: COLORS.textSub }}>
                  시작: {(() => {
                    const tasks = getTasksForRoutine("morning");
                    const totalMin = tasks.reduce((s, t) => s + t.durationSeconds, 0) / 60;
                    const [h, m] = settings.targetTime.split(":").map(Number);
                    const startMin = h * 60 + m - totalMin - 10;
                    const sh = Math.floor(startMin / 60);
                    const sm = Math.round(startMin % 60);
                    return `${sh}:${sm.toString().padStart(2, "0")}`;
                  })()}
                </span>
                <button onClick={() => setTargetTime(null)} className="text-sm" style={{ color: COLORS.accent }}>
                  ✕
                </button>
              </>
            )}
          </div>
        </section>

        {/* 준비 항목 설정 - 루틴 탭 */}
        <section className="sticker-card p-4" style={{ transform: "rotate(0deg)", borderRadius: "20px" }}>
          {/* 루틴 선택 탭 */}
          <div className="flex items-center justify-between mb-3">
            <div
              className="flex rounded-full p-0.5"
              style={{ backgroundColor: "#F0EBFF" }}
            >
              {(["morning", "bedtime"] as RoutineType[]).map((r) => (
                <button
                  key={r}
                  onClick={() => { setRoutineTab(r); setShowAddTask(false); }}
                  className="px-3 py-1.5 rounded-full text-xs transition-all"
                  style={{
                    backgroundColor: routineTab === r ? COLORS.primary : "transparent",
                    color: routineTab === r ? "white" : COLORS.textSub,
                  }}
                >
                  <span className="flex items-center gap-1">{r === "morning" ? <><SunIcon size={12} /> 등원</> : <><MoonIcon size={12} /> 잠자리</>}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAddTask(!showAddTask)}
              className="jelly-btn px-3 py-1 text-xs text-white"
              style={{ backgroundColor: COLORS.mint, "--btn-shadow": "#009B7D" } as React.CSSProperties}
            >
              + 추가
            </button>
          </div>

          {showAddTask && (
            <div className="mb-4 p-3 rounded-xl border-2 border-dashed space-y-2" style={{ borderColor: COLORS.mint, backgroundColor: "#F0FFF8" }}>
              <input
                value={newTaskLabel}
                onChange={(e) => setNewTaskLabel(e.target.value)}
                placeholder="항목 이름 (예: 머리 빗기)"
                className="w-full px-3 py-2 rounded-lg border-2 text-sm outline-none"
                style={{ borderColor: "#F0EBFF" }}
              />
              <div className="flex items-center gap-2">
                <select
                  value={newTaskIcon}
                  onChange={(e) => setNewTaskIcon(e.target.value as TaskIconType)}
                  className="flex-1 px-2 py-1.5 rounded-lg border-2 text-sm"
                  style={{ borderColor: "#F0EBFF" }}
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
                  onFocus={(e) => e.target.select()}
                  className="w-16 text-center px-1 py-1.5 rounded-lg border-2 text-sm"
                  style={{ borderColor: "#F0EBFF", fontFamily: "Fredoka" }}
                />
                <span className="text-xs" style={{ color: COLORS.textSub }}>분</span>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowAddTask(false)}
                  className="px-3 py-1.5 rounded-full text-xs"
                  style={{ color: COLORS.textSub }}
                >
                  취소
                </button>
                <button
                  onClick={handleAddTask}
                  disabled={!newTaskLabel.trim()}
                  className="jelly-btn px-4 py-1.5 text-xs text-white disabled:opacity-50"
                  style={{ backgroundColor: COLORS.mint, "--btn-shadow": "#009B7D" } as React.CSSProperties}
                >
                  추가
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {currentTasks.map((task, index) => (
              <div key={task.id} className="flex items-center gap-2 p-2 rounded-xl" style={{ backgroundColor: routineTab === "morning" ? "#F8F5FF" : "#F0F0FF" }}>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => index > 0 && reorderTasks(index, index - 1, routineTab)}
                    disabled={index === 0}
                    className="text-xs disabled:opacity-20"
                    style={{ color: COLORS.primary, opacity: index === 0 ? 0.2 : 0.6 }}
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => index < currentTasks.length - 1 && reorderTasks(index, index + 1, routineTab)}
                    disabled={index === currentTasks.length - 1}
                    className="text-xs disabled:opacity-20"
                    style={{ color: COLORS.primary, opacity: index === currentTasks.length - 1 ? 0.2 : 0.6 }}
                  >
                    ▼
                  </button>
                </div>
                <span className="flex-1 text-sm" style={{ color: COLORS.textDark }}>{task.label}</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={Math.floor(task.durationSeconds / 60)}
                    onChange={(e) => {
                      const mins = Math.max(1, Math.min(60, parseInt(e.target.value) || 1));
                      updateTaskDuration(task.id, mins * 60, routineTab);
                    }}
                    onFocus={(e) => e.target.select()}
                    className="w-14 text-center px-1 py-1 rounded border-2 text-sm"
                    style={{ borderColor: "#F0EBFF", fontFamily: "Fredoka" }}
                  />
                  <span className="text-xs" style={{ color: COLORS.textSub }}>분</span>
                </div>
                <button
                  onClick={() => {
                    if (currentTasks.length > 1) removeTask(task.id, routineTab);
                  }}
                  className="text-sm px-2"
                  style={{ color: COLORS.accent }}
                  disabled={currentTasks.length <= 1}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs mt-2 text-center" style={{ color: COLORS.textSub, fontFamily: "Fredoka" }}>
            총 {Math.round(currentTasks.reduce((s, t) => s + t.durationSeconds, 0) / 60)}분
          </p>
        </section>

        {/* PIN 설정 */}
        <section className="sticker-card p-4" style={{ transform: "rotate(0deg)", borderRadius: "20px" }}>
          <h2 className="text-base mb-3" style={{ color: COLORS.primary }}>설정 잠금</h2>
          {!showPinSetup ? (
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: COLORS.textSub }}>
                {settings.pinCode ? "PIN이 설정되어 있습니다" : "PIN 미설정"}
              </p>
              <button
                onClick={() => setShowPinSetup(true)}
                className="jelly-btn px-4 py-1.5 text-sm text-white"
                style={{ backgroundColor: COLORS.primary, "--btn-shadow": "#5041C0" } as React.CSSProperties}
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
                className="flex-1 text-center py-2 rounded-lg border-2 outline-none"
                style={{ borderColor: COLORS.primary, fontFamily: "Fredoka" }}
              />
              <button
                onClick={() => {
                  setPinCode(pinInput || null);
                  setPinInput("");
                  setShowPinSetup(false);
                }}
                className="jelly-btn px-4 py-2 text-white text-sm"
                style={{ backgroundColor: COLORS.primary, "--btn-shadow": "#5041C0" } as React.CSSProperties}
              >
                저장
              </button>
              <button
                onClick={() => { setShowPinSetup(false); setPinInput(""); }}
                className="px-3 py-2 text-sm"
                style={{ color: COLORS.textSub }}
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
            style={{ color: COLORS.accent }}
          >
            설정 초기화
          </button>
        </section>
      </div>
    </div>
  );
}
