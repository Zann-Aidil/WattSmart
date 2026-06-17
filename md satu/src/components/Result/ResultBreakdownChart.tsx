"use client";

type ApplianceBreakdown = {
  nama: string; kwh: number; persentase: number; biaya: number; icon: string;
};
type Props = { data: ApplianceBreakdown[] };

const COLORS = ["#10b981","#3b82f6","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#ec4899"];

export function ResultBreakdownChart({ data }: Props) {
  const sorted = [...data].sort((a, b) => b.kwh - a.kwh);
  const max = sorted[0]?.kwh ?? 1;

  return (
    <div className="space-y-3">
      {sorted.map((item, i) => (
        <div key={item.nama} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span>{item.icon}</span>
              <span className="text-gray-600">{item.nama}</span>
            </div>
            <span className="font-syne font-semibold text-gray-900">{item.persentase.toFixed(1)}%</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(item.kwh / max) * 100}%`, background: COLORS[i % COLORS.length] }}
            />
          </div>
          <p className="text-[10px] text-right text-gray-400">{item.kwh.toFixed(1)} kWh</p>
        </div>
      ))}
    </div>
  );
}