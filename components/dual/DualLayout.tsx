"use client";

import PlayerPanel from "./PlayerPanel";

export default function DualLayout() {
  return (
    <div className="grid grid-cols-2 h-full divide-x divide-gray-200">
      <PlayerPanel playerIndex={0} compact />
      <PlayerPanel playerIndex={1} compact />
    </div>
  );
}
