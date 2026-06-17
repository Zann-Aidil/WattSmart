"use client";

type Props = { kategori: string };

const CONFIG: Record<string, { color: string; score: number; label: string }> = {
  Hemat:          { color: "#10b981", score: 90, label: "Sangat Efisien"  },
  Normal:         { color: "#3b82f6", score: 65, label: "Efisiensi Normal" },
  Boros:          { color: "#f59e0b", score: 35, label: "Kurang Efisien"  },
  "Sangat Boros": { color: "#ef4444", score: 10, label: "Tidak Efisien"   },
};

export function ResultEfficiencyGauge({ kategori }: Props) {
  const cfg = CONFIG[kategori] ?? CONFIG["Normal"];
  const size = 150, cx = size / 2, cy = size * 0.62, r = 56;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const arcX1 = cx + r * Math.cos(toRad(-180)), arcY1 = cy + r * Math.sin(toRad(-180));
  const arcX2 = cx + r * Math.cos(toRad(0)),    arcY2 = cy + r * Math.sin(toRad(0));
  const circ  = Math.PI * r;
  const na    = -180 + (cfg.score / 100) * 180;
  const nx    = cx + (r - 10) * Math.cos(toRad(na));
  const ny    = cy + (r - 10) * Math.sin(toRad(na));

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.68} viewBox={`0 0 ${size} ${size * 0.68}`}>
        <defs>
          <linearGradient id="gaugeGradLight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#10b981" />
            <stop offset="40%"  stopColor="#3b82f6" />
            <stop offset="70%"  stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        <path d={`M ${arcX1} ${arcY1} A ${r} ${r} 0 0 1 ${arcX2} ${arcY2}`}
          fill="none" stroke="#e5e7eb" strokeWidth={14} strokeLinecap="round" />
        <path d={`M ${arcX1} ${arcY1} A ${r} ${r} 0 0 1 ${arcX2} ${arcY2}`}
          fill="none" stroke="url(#gaugeGradLight)" strokeWidth={14} strokeLinecap="round"
          strokeDasharray={`${(cfg.score / 100) * circ} ${circ}`} />
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={cfg.color} strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={5} fill={cfg.color} />
      </svg>
      <div className="text-center -mt-1">
        <p className="font-syne font-bold text-2xl" style={{ color: cfg.color }}>{cfg.score}</p>
        <p className="text-[10px] mt-0.5 text-gray-400">{cfg.label}</p>
      </div>
    </div>
  );
}