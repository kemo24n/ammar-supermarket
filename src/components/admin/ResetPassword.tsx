"use client";
import { useState, useTransition } from "react";
import { KeyRound, Loader2, MessageCircle } from "lucide-react";
import { resetCustomerPasswordAction } from "@/app/admin/actions";

export function ResetPassword({ userId }: { userId: string }) {
  const [p, start] = useTransition();
  const [res, setRes] = useState<{ temp: string; phone: string; name: string } | null>(null);
  if (res) {
    const text = `مرحباً ${res.name}، كلمة المرور الجديدة لحسابك بعمار للتسوق: ${res.temp}\nفيك تغيّرها بعد الدخول.`;
    return (
      <a href={`https://wa.me/${res.phone}?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1.5 text-[11px] font-black text-emerald-700">
        <MessageCircle className="h-3.5 w-3.5" /> {res.temp} — إرسال
      </a>
    );
  }
  return (
    <button disabled={p} onClick={() => { if (confirm("إنشاء كلمة مرور مؤقتة لهذا الزبون؟")) start(async () => setRes(await resetCustomerPasswordAction(userId))); }}
      className="inline-flex items-center gap-1 rounded-lg bg-paper px-2 py-1.5 text-[11px] font-bold text-ink-soft hover:bg-brand-50">
      {p ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />} كلمة مرور جديدة
    </button>
  );
}
