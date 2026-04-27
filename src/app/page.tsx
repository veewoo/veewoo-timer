"use client";

import { Suspense } from "react";
import TimerClient from "@/components/TimerClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <TimerClient />
    </Suspense>
  );
}
