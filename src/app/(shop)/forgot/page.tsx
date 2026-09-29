import Link from "next/link";
import { KeyRound, MessageCircle } from "lucide-react";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "نسيت كلمة المرور" };

export default async function Forgot() {
  const s = await getSettings();
  const text = "مرحباً عمار للتسوق، نسيت كلمة المرور لحسابي. رقمي المسجّل هو: ";
  return (
    <div className="container-x grid place-items-center py-12">
      <div className="card w-full max-w-md p-8 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600"><KeyRound className="h-8 w-8" /></span>
        <h1 className="mt-4 text-2xl font-black">نسيت كلمة المرور؟</h1>
        <p className="mt-2 leading-7 text-ink-mute">ولا يهمك! ابعتلنا رسالة واتساب من نفس الرقم المسجّل، ومنرجعلك كلمة مرور جديدة خلال دقائق.</p>
        <a href={`https://wa.me/${s.whatsapp}?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer" className="btn mt-6 w-full bg-[#25D366] text-white hover:brightness-95">
          <MessageCircle className="h-5 w-5" /> راسلنا على واتساب
        </a>
        <Link href="/login" className="mt-4 block text-sm font-bold text-ink-mute hover:text-ink">رجوع لتسجيل الدخول</Link>
      </div>
    </div>
  );
}
