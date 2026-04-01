"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { CHARACTERS, COLORS } from "@/lib/constants";
import {
  setFirebaseConfig, clearFirebaseConfig, getFirebaseConfigStored,
  getFamilyCode, setFamilyCode, clearFamilyCode, generateFamilyCode,
  checkFamilyCodeExists, saveFamilyMeta, loadFromFamilyCode,
} from "@/lib/firebase";
import { syncSettings, startSync } from "@/lib/sync";
import Character from "@/components/svg/characters/Character";
import { SunIcon, MoonIcon } from "@/components/svg/icons/RoutineIcons";
import type { CharacterType, TaskIconType, RoutineType } from "@/lib/types";

const PROFILE_BG_COLORS = [
  { value: "#6C5CE7", label: "보라" },
  { value: "#E84393", label: "핑크" },
  { value: "#00B894", label: "민트" },
  { value: "#54A0FF", label: "파랑" },
  { value: "#FFAD42", label: "노랑" },
  { value: "#FF6B6B", label: "빨강" },
  { value: "#A29BFE", label: "연보라" },
  { value: "#FDA7DF", label: "연핑크" },
];

const ICON_OPTIONS: { value: TaskIconType; label: string }[] = [
  { value: "blanket", label: "이불" },
  { value: "meal", label: "밥" },
  { value: "brush", label: "양치" },
  { value: "clothes", label: "옷" },
  { value: "backpack", label: "가방" },
  { value: "shoes", label: "신발" },
];

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const {
    settings,
    getTasksForProfile,
    updateProfile,
    addTaskForProfile,
    removeTaskForProfile,
    reorderTasksForProfile,
    updateTaskDurationForProfile,
    updateTaskForProfile,
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
  const [selectedProfileId, setSelectedProfileId] = useState(settings.profiles[0]?.id ?? "");
  const [fbApiKey, setFbApiKey] = useState("");
  const [fbDbUrl, setFbDbUrl] = useState("");
  const [fbProjectId, setFbProjectId] = useState("");
  const [fbConfigured, setFbConfigured] = useState(false);
  const [familyCode, setFamilyCodeState] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    const config = getFirebaseConfigStored();
    if (config) {
      setFbApiKey(config.apiKey ?? "");
      setFbDbUrl(config.databaseURL ?? "");
      setFbProjectId(config.projectId ?? "");
      setFbConfigured(true);
    }
    setFamilyCodeState(getFamilyCode());
  }, []);

  const currentTasks = getTasksForProfile(selectedProfileId, routineTab);
  const selectedProfile = settings.profiles.find((p) => p.id === selectedProfileId);

  if (!mounted) {
    return <div className="min-h-screen" style={{ backgroundColor: COLORS.bgLight }} />;
  }

  const handlePinSubmit = () => {
    if (settings.pinCode && pinInput === settings.pinCode) {
      setIsUnlocked(true);
    }
    setPinInput("");
  };

  const handleAddTask = () => {
    if (!newTaskLabel.trim()) return;
    addTaskForProfile(selectedProfileId, {
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
                <div className="flex gap-1.5 items-center">
                  <span className="text-xs mr-1" style={{ color: COLORS.textSub }}>배경색</span>
                  {PROFILE_BG_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => updateProfile(profile.id, { bgColor: c.value })}
                      className="w-6 h-6 rounded-full border-2 transition-all"
                      style={{
                        backgroundColor: c.value,
                        borderColor: (profile.bgColor ?? COLORS.primary) === c.value ? COLORS.textDark : "transparent",
                        transform: (profile.bgColor ?? COLORS.primary) === c.value ? "scale(1.2)" : "scale(1)",
                      }}
                      title={c.label}
                    />
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
                    const tasks = getTasksForProfile(settings.profiles[0]?.id ?? "", "morning");
                    const totalMin = tasks.reduce((s, t) => s + t.durationSeconds, 0) / 60;
                    const [h, m] = (settings.targetTime ?? "0:0").split(":").map(Number);
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

        {/* 준비 항목 설정 - 아이별 + 루틴별 */}
        <section className="sticker-card p-4" style={{ transform: "rotate(0deg)", borderRadius: "20px" }}>
          {/* 아이 선택 탭 */}
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-base" style={{ color: COLORS.primary }}>준비 항목</h2>
            <div className="flex-1" />
            {settings.profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => { setSelectedProfileId(profile.id); setShowAddTask(false); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-all border-2"
                style={{
                  borderColor: selectedProfileId === profile.id ? COLORS.primary : "#F0EBFF",
                  backgroundColor: selectedProfileId === profile.id ? "#F0EBFF" : "transparent",
                  color: selectedProfileId === profile.id ? COLORS.primary : COLORS.textSub,
                }}
              >
                <Character type={profile.characterType} size={16} expression="happy" />
                {profile.name}
              </button>
            ))}
          </div>

          {selectedProfile && (
            <p className="text-xs mb-2" style={{ color: COLORS.textSub }}>
              {selectedProfile.name}의 루틴을 설정하세요
            </p>
          )}

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
                  defaultValue={newTaskMinutes}
                  key={`new-task-min-${showAddTask}`}
                  onBlur={(e) => setNewTaskMinutes(Math.max(1, Math.min(60, parseInt(e.target.value) || 1)))}
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
                    onClick={() => index > 0 && reorderTasksForProfile(selectedProfileId, index, index - 1, routineTab)}
                    disabled={index === 0}
                    className="text-xs disabled:opacity-20"
                    style={{ color: COLORS.primary, opacity: index === 0 ? 0.2 : 0.6 }}
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => index < currentTasks.length - 1 && reorderTasksForProfile(selectedProfileId, index, index + 1, routineTab)}
                    disabled={index === currentTasks.length - 1}
                    className="text-xs disabled:opacity-20"
                    style={{ color: COLORS.primary, opacity: index === currentTasks.length - 1 ? 0.2 : 0.6 }}
                  >
                    ▼
                  </button>
                </div>
                <select
                  value={task.icon}
                  onChange={(e) => updateTaskForProfile(selectedProfileId, task.id, { icon: e.target.value as TaskIconType }, routineTab)}
                  className="px-1 py-1 rounded border-2 text-xs"
                  style={{ borderColor: "#F0EBFF" }}
                >
                  {ICON_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <input
                  key={`${task.id}-label`}
                  defaultValue={task.label}
                  onBlur={(e) => {
                    const label = e.target.value.trim();
                    if (label && label !== task.label) {
                      updateTaskForProfile(selectedProfileId, task.id, { label }, routineTab);
                    }
                  }}
                  className="flex-1 px-2 py-1 rounded border-2 text-sm outline-none"
                  style={{ borderColor: "#F0EBFF", color: COLORS.textDark }}
                />
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    key={`${task.id}-${task.durationSeconds}`}
                    defaultValue={Math.floor(task.durationSeconds / 60)}
                    onBlur={(e) => {
                      const mins = Math.max(1, Math.min(60, parseInt(e.target.value) || 1));
                      updateTaskDurationForProfile(selectedProfileId, task.id, mins * 60, routineTab);
                    }}
                    className="w-14 text-center px-1 py-1 rounded border-2 text-sm"
                    style={{ borderColor: "#F0EBFF", fontFamily: "Fredoka" }}
                  />
                  <span className="text-xs" style={{ color: COLORS.textSub }}>분</span>
                </div>
                <button
                  onClick={() => {
                    if (currentTasks.length > 1) removeTaskForProfile(selectedProfileId, task.id, routineTab);
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

        {/* 데이터 동기화 */}
        <section className="sticker-card p-4" style={{ transform: "rotate(0deg)", borderRadius: "20px" }}>
          <h2 className="text-base mb-3" style={{ color: COLORS.primary }}>
            데이터 동기화
          </h2>

          {/* 가족 코드 연결됨 */}
          {fbConfigured && familyCode && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: "#F0EBFF" }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.mint }} />
                <span className="text-xs" style={{ color: COLORS.textSub }}>연결됨</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-3 rounded-xl border-2" style={{ borderColor: COLORS.primary }}>
                <span className="text-base font-bold flex-1" style={{ color: COLORS.textDark, fontFamily: "Jua, sans-serif" }}>
                  {familyCode}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(familyCode);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full font-bold text-white"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  복사
                </button>
              </div>
              <p className="text-xs" style={{ color: COLORS.textSub }}>
                다른 기기에서 위 코드를 입력하면 같은 데이터를 공유합니다
              </p>
              <button
                onClick={() => {
                  clearFamilyCode();
                  setFamilyCodeState(null);
                }}
                className="text-xs underline"
                style={{ color: COLORS.accent }}
              >
                연결 해제
              </button>
            </div>
          )}

          {/* Firebase 설정 완료 + 코드 없음 */}
          {fbConfigured && !familyCode && (
            <div className="space-y-3">
              <p className="text-xs" style={{ color: COLORS.textSub }}>
                가족 코드로 여러 기기에서 데이터를 공유하세요
              </p>
              <button
                onClick={async () => {
                  const code = generateFamilyCode();
                  setFamilyCode(code);
                  setFamilyCodeState(code);
                  await saveFamilyMeta(code);
                  await syncSettings(settings);
                  startSync(
                    (remote) => useSettingsStore.setState({ settings: remote }),
                    (records) => {
                      import("@/stores/useStatsStore").then(({ useStatsStore }) => {
                        useStatsStore.setState({ records });
                      });
                    },
                  );
                }}
                className="jelly-btn w-full py-3 text-white text-sm font-bold"
                style={{ backgroundColor: COLORS.primary, "--btn-shadow": "#5041C0" } as React.CSSProperties}
              >
                새 가족 코드 만들기
              </button>
              <button
                onClick={() => { setShowJoinInput(true); setJoinError(""); setJoinCode(""); }}
                className="jelly-btn w-full py-3 text-sm font-bold"
                style={{ backgroundColor: "#F0EBFF", color: COLORS.primary, "--btn-shadow": "#D8D0F0" } as React.CSSProperties}
              >
                기존 코드로 합류하기
              </button>

              {showJoinInput && (
                <div className="space-y-2 mt-2">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => { setJoinCode(e.target.value); setJoinError(""); }}
                    placeholder="가족 코드 입력 (예: 행복한-곰돌이-1234)"
                    className="w-full px-3 py-2 rounded-lg border-2 text-sm outline-none"
                    style={{ borderColor: joinError ? COLORS.accent : "#F0EBFF", fontFamily: "Jua" }}
                  />
                  {joinError && (
                    <p className="text-xs" style={{ color: COLORS.accent }}>{joinError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        if (!joinCode.trim()) return;
                        setJoinLoading(true);
                        setJoinError("");
                        try {
                          const exists = await checkFamilyCodeExists(joinCode.trim());
                          if (!exists) {
                            setJoinError("코드를 찾을 수 없습니다");
                            setJoinLoading(false);
                            return;
                          }
                          // 원격 데이터 로드 → 로컬에 덮어쓰기
                          setFamilyCode(joinCode.trim());
                          setFamilyCodeState(joinCode.trim());
                          const remoteSettings = await loadFromFamilyCode(joinCode.trim(), "settings");
                          if (remoteSettings) {
                            const envelope = remoteSettings as { data?: unknown };
                            if (envelope.data) {
                              useSettingsStore.setState({ settings: envelope.data as typeof settings });
                            }
                          }
                          const remoteStats = await loadFromFamilyCode(joinCode.trim(), "stats");
                          if (remoteStats) {
                            const envelope = remoteStats as { data?: unknown };
                            if (envelope.data) {
                              const { useStatsStore } = await import("@/stores/useStatsStore");
                              useStatsStore.setState({ records: envelope.data as [] });
                            }
                          }
                          startSync(
                            (remote) => useSettingsStore.setState({ settings: remote }),
                            (records) => {
                              import("@/stores/useStatsStore").then(({ useStatsStore: s }) => {
                                s.setState({ records });
                              });
                            },
                          );
                          setShowJoinInput(false);
                        } catch {
                          setJoinError("연결 중 오류가 발생했습니다");
                        }
                        setJoinLoading(false);
                      }}
                      disabled={!joinCode.trim() || joinLoading}
                      className="jelly-btn px-4 py-2 text-white text-sm disabled:opacity-50"
                      style={{ backgroundColor: COLORS.mint, "--btn-shadow": "#009B7D" } as React.CSSProperties}
                    >
                      {joinLoading ? "확인 중..." : "합류"}
                    </button>
                    <button
                      onClick={() => setShowJoinInput(false)}
                      className="text-xs px-3"
                      style={{ color: COLORS.textSub }}
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Firebase 미설정 */}
          {!fbConfigured && (
            <div className="space-y-2">
              <p className="text-xs mb-2" style={{ color: COLORS.textSub }}>
                Firebase Realtime Database 설정이 필요합니다
              </p>
              <input
                type="text"
                value={fbApiKey}
                onChange={(e) => setFbApiKey(e.target.value)}
                placeholder="API Key"
                className="w-full px-3 py-2 rounded-lg border-2 text-xs outline-none"
                style={{ borderColor: "#F0EBFF", fontFamily: "Fredoka" }}
              />
              <input
                type="text"
                value={fbDbUrl}
                onChange={(e) => setFbDbUrl(e.target.value)}
                placeholder="Database URL (https://xxx.firebaseio.com)"
                className="w-full px-3 py-2 rounded-lg border-2 text-xs outline-none"
                style={{ borderColor: "#F0EBFF", fontFamily: "Fredoka" }}
              />
              <input
                type="text"
                value={fbProjectId}
                onChange={(e) => setFbProjectId(e.target.value)}
                placeholder="Project ID"
                className="w-full px-3 py-2 rounded-lg border-2 text-xs outline-none"
                style={{ borderColor: "#F0EBFF", fontFamily: "Fredoka" }}
              />
              <button
                onClick={() => {
                  if (fbApiKey.trim() && fbDbUrl.trim() && fbProjectId.trim()) {
                    setFirebaseConfig({
                      apiKey: fbApiKey.trim(),
                      databaseURL: fbDbUrl.trim(),
                      projectId: fbProjectId.trim(),
                    });
                    setFbConfigured(true);
                  }
                }}
                disabled={!fbApiKey.trim() || !fbDbUrl.trim() || !fbProjectId.trim()}
                className="jelly-btn px-4 py-2 text-white text-sm disabled:opacity-50 mt-1"
                style={{ backgroundColor: COLORS.mint, "--btn-shadow": "#009B7D" } as React.CSSProperties}
              >
                Firebase 설정 저장
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
