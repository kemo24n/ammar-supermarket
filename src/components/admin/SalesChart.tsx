"use client";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function SalesChart({ data }: { data: { day: string; revenue: number; orders: number }[] }) {
  return (
    <div className="h-72 w-full" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#EDEDF0" />
          <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#6B6B76", fontFamily: "Cairo" }} />
          <YAxis tickLine={false} axisLine={false} width={56} tick={{ fontSize: 11, fill: "#6B6B76" }} tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))} />
          <Tooltip cursor={{ fill: "rgba(225,26,33,.06)" }}
            contentStyle={{ borderRadius: 14, border: "1px solid #E8E8EC", fontFamily: "Cairo", direction: "rtl", boxShadow: "0 8px 24px -12px rgba(0,0,0,.2)" }}
            formatter={(v, k) => (k === "revenue" ? [`${Number(v).toLocaleString("en-US")} ل.س`, "المبيعات"] : [v, "الطلبات"])} labelStyle={{ fontWeight: 800 }} />
          <Bar dataKey="revenue" fill="#E11A21" radius={[8, 8, 3, 3]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
