"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type KecamatanBar = {
  name: string;
  total: number;
  selesai: number;
};

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload as KecamatanBar;
  return (
    <div className="rounded-xl border border-sky-100 bg-white/95 px-4 py-3 shadow-xl shadow-sky-900/10 backdrop-blur">
      <p className="text-sm font-bold text-sky-900">Kec. {item.name}</p>
      <p className="mt-1 text-xs text-slate-600">
        Total BNBA:{" "}
        <span className="font-bold text-sky-700">{item.total} unit</span>
      </p>
      <p className="text-xs text-slate-600">
        Selesai:{" "}
        <span className="font-bold text-emerald-600">{item.selesai} unit</span>
      </p>
    </div>
  );
}

export default function KecamatanChart({ data }: { data: KecamatanBar[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      style={{ height: Math.min(560, 52 * data.length + 90) }}
      className="w-full"
    >
      {mounted && (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 4, right: 28, left: 8, bottom: 4 }}
            barCategoryGap={10}
          >
            <defs>
              <linearGradient id="barSky" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#bae6fd" />
                <stop offset="55%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={118}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#475569", fontSize: 12, fontWeight: 600 }}
            />
            <Tooltip cursor={{ fill: "rgba(224,242,254,0.5)" }} content={<ChartTooltip />} />
            <Bar dataKey="total" radius={[6, 10, 10, 6]} maxBarSize={22}>
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill="url(#barSky)"
                  opacity={1 - index * 0.045}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
