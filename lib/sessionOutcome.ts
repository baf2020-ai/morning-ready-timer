import type { GameSession, PlayerState, TaskItem, TaskResult } from "./types";

export function getTasksForPlayer(session: GameSession, playerIndex: number): TaskItem[] {
  return session.playerTasks[playerIndex] ?? session.tasks;
}

export function getTaskLimitSeconds(
  player: PlayerState,
  tasks: TaskItem[],
  taskId: string
): number | null {
  const task = tasks.find((item) => item.id === taskId);
  if (!task) return null;
  return player.durationOverrides?.[taskId] ?? task.durationSeconds;
}

export function didTaskMissDeadline(
  player: PlayerState,
  tasks: TaskItem[],
  result: TaskResult
): boolean {
  const limit = getTaskLimitSeconds(player, tasks, result.taskId);
  if (limit === null) return false;
  return result.elapsedSeconds > limit;
}

export function didPlayerMissDeadline(player: PlayerState, tasks: TaskItem[]): boolean {
  return player.results.some((result) => didTaskMissDeadline(player, tasks, result));
}

export function didSessionMissDeadline(session: GameSession): boolean {
  return session.players.some((player, index) =>
    didPlayerMissDeadline(player, getTasksForPlayer(session, index))
  );
}
