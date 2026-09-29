"use client";
import { Mark } from "@/components/ui/Logo";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-[70vh] place-items-center p-6 text-center">
      <div>
        <Mark className="mx-auto h-16 w-16" />
        <h1 className="mt-5 text-2xl font-black">صار خطأ غير متوقع</h1>
        <p className="mt-2 text-ink-mute">جرّب مرة تانية بعد لحظات</p>
        <button onClick={reset} className="btn-primary mt-6">إعادة المحاولة</button>
      </div>
    </div>
  );
}
