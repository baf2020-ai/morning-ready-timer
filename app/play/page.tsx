"use client";

import { Suspense } from "react";
import PlayContent from "./PlayContent";

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full text-xl">로딩중...</div>}>
      <PlayContent />
    </Suspense>
  );
}
