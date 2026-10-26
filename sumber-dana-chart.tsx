"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export type DanaSlice = {
  key: string;
  label: string;
  value: number;
  color: string;
};

function DanaTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload as DanaSlice;
  return (
    <div className="rounded-xl border border-sky-100 bg-white/95 px-4 py-3 shadow-xl shadow-sky-900/10 backdrop-blur">
      <p className="text-sm font-bold text-sky-900">{item.label}</p>
      <p className="mt-1 text-xs text-slate-600">
        <span className="font-bold text-sky-700">{item.value} unit</span> rumah
        mendapat bantuan
      </p>
    </div>
  );
}

export default function SumberDanaChart({
  data,
  total,
}: {
  data: DanaSlice[];
  total: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative h-80 w-full">
      {mounted && (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<DanaTooltip />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={92}
              outerRadius={128}
              paddingAngle={4}
              cornerRadius={8}
              strokeWidth={3}
              stroke="#ffffff"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((slice) => (
                <Cell key={slice.key} fill={slice.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      )}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-4xl font-extrabold tracking-tight text-sky-900">
          {total.toLocaleString("id-ID")}
        </p>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-500">
          Unit Terusulan
        </p>
      </div>
    </div>
  );
}
