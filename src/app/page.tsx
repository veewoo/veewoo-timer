import TimerClient from "@/components/TimerClient";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TimerClient />
    </Suspense>
  );
}
