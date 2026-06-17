"use client";

type Props = { kwh: number };

export function ResultComparison({ kwh }: Props) {
  const benchmarks = [
    { label: "Rumah Sangat Hemat", kwh: 150, color: "#10b981" },
    { label: "Rata-rata Nasional", kwh: 288, color: "#3b82f6" },
    { label: "Konsumsi Anda",      kwh,      color: "#10b981", highlight: true },
    { label: "Rata-rata Boros",    kwh: 420, color: "#f59e0b" },
  ];
  const max = Math.max(...benchmarks.map(b => b.kwh)) * 1.1;
  const selisih = kwh - 288;

  return (
    <div className="space-y-4">
      {benchmarks.map((b) => (
        <div key={b.label} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className={b.highlight ? "text-gray-900 font-semibold" : "text-gray-500"}>
              {b.label}{b.highlight && " ★"}
            </span>
            <span className="font-syne font-bold" style={{ color: b.color }}>{b.kwh.toFixed(0)} kWh</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(b.kwh / max) * 100}%`, background: b.color, opacity: b.highlight ? 1 : 0.5 }}
            />
          </div>
        </div>
      ))}
      <div className={`mt-2 rounded-xl p-3 text-xs font-medium ${
        selisih > 0 ? "bg-amber-50 border border-amber-100 text-amber-700" : "bg-emerald-50 border border-emerald-100 text-emerald-700"
      }`}>
        {selisih > 0
          ? `↑ ${selisih.toFixed(0)} kWh di atas rata-rata nasional. Ada peluang penghematan!`
          : `✓ ${Math.abs(selisih).toFixed(0)} kWh di bawah rata-rata nasional. Konsumsi Anda efisien!`}
      </div>
    </div>
  );
}