"use client";
import { useActionState, useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { importProductsAction, type FormState } from "@/app/admin/actions";
import { FormMsg, Submit } from "./ui";

export function ImportForm() {
  const [state, action] = useActionState<FormState, FormData>(importProductsAction, undefined);
  const [file, setFile] = useState<string | null>(null);
  return (
    <form action={action} className="space-y-4">
      <label className="flex cursor-pointer flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-ink-line bg-paper p-10 text-center transition hover:border-brand-400 hover:bg-brand-50/40">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-brand-600 shadow-card"><FileSpreadsheet className="h-8 w-8" /></span>
        <span className="font-black">{file ?? "اسحب ملف CSV هون أو اضغط للاختيار"}</span>
        <span className="text-xs text-ink-mute">من Excel: ملف ← حفظ باسم ← CSV UTF-8</span>
        <input type="file" name="file" accept=".csv,text/csv" required className="sr-only" onChange={(e) => setFile(e.target.files?.[0]?.name ?? null)} />
      </label>
      <FormMsg state={state} />
      <Submit className="w-full">استيراد المنتجات</Submit>
    </form>
  );
}
