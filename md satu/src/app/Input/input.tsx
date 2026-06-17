"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const defaultForm = {
  tanggal: new Date().toISOString().split("T")[0],
  jam: 19,
  suhu: 30,
  jumlah_penghuni: 4,
  jumlah_perangkat_aktif: 9,
  jam_pemakaian_per_hari: 8,
  hari_libur: false,
  // Perangkat utama
  jumlah_ac: 1,
  jam_ac_per_hari: 8,
  jumlah_kulkas: 1,
  jumlah_tv: 2,
  jam_tv_per_hari: 5,
  jumlah_lampu: 10,
  jam_lampu_per_hari: 8,
  jumlah_mesin_cuci: 1,
  frekuensi_cuci_per_minggu: 3,
  jumlah_komputer: 1,
  jam_komputer_per_hari: 4,
  // Tambahan
  water_heater: false,
  dispenser: true,
  microwave: false,
  // Golongan
  daya_listrik: 1300,
  golongan_tarif: "R-1/TR",
  luas_rumah: 72,
  // Histori 7 hari
  hist: ["", "", "", "", "", "", ""] as string[],
};

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1">
      <label className="text-sm font-semibold text-gray-700">{children}</label>
      {hint && <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-100">
      <span className="text-lg">{icon}</span>
      <h3 className="font-syne font-bold text-gray-800 text-sm">{title}</h3>
    </div>
  );
}

function NumberStepper({
  value, onChange, min = 0, max = 99,
}: {
  value: number; onChange: (v: number) => void; min?: number; max?: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center transition-all text-base"
      >−</button>
      <span className="w-10 text-center font-syne font-bold text-gray-900 text-lg">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center transition-all text-base"
      >+</button>
    </div>
  );
}

type DeviceRowProps = {
  icon: string;
  label: string;
  watt?: number;
  count: number;
  hours: number;
  hoursLabel?: string;
  onCountChange: (v: number) => void;
  onHoursChange: (v: number) => void;
  hoursMax?: number;
};

function DeviceRow({ icon, label, watt, count, hours, hoursLabel = "jam/hari", onCountChange, onHoursChange, hoursMax = 24 }: DeviceRowProps) {
  const estimasi = watt && hoursLabel === "jam/hari"
    ? ((count * watt * hours * 30) / 1000).toFixed(1)
    : null;

  return (
    <div className={`flex items-center gap-3 py-3 border-b border-gray-50 last:border-0 ${count === 0 ? "opacity-60" : ""}`}>
      <span className="text-lg w-6 flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 leading-none">{label}</p>
        {estimasi && (
          <p className="text-[10px] text-emerald-600 mt-0.5">≈ {estimasi} kWh/bln</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <NumberStepper value={count} onChange={onCountChange} max={10} />
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <div className="flex flex-col items-end">
          <input
            type="number"
            value={hours}
            min={0}
            max={hoursMax}
            onChange={(e) => onHoursChange(Number(e.target.value))}
            disabled={count === 0}
            className="w-16 text-center text-sm bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-gray-900 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20 disabled:opacity-40 transition-all"
          />
          <span className="text-[9px] text-gray-400 mt-0.5">{hoursLabel}</span>
        </div>
      </div>
    </div>
  );
}

export default function InputPage() {
  const router  = useRouter();
  const [form, setForm]       = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const set = <K extends keyof typeof defaultForm>(key: K, value: (typeof defaultForm)[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const setHist = (i: number, val: string) => {
    const next = [...form.hist];
    next[i] = val;
    setForm(prev => ({ ...prev, hist: next }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        hist: form.hist.map(v => v === "" ? null : Number(v)),
      };
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Gagal terhubung ke server");
      const result = await response.json();
      sessionStorage.setItem("prediction_result", JSON.stringify(result));
      sessionStorage.setItem("prediction_input", JSON.stringify(payload));
      router.push("/Result");
    } catch {
      sessionStorage.setItem("prediction_input", JSON.stringify(form));
      sessionStorage.setItem("prediction_demo", "true");
      router.push("/Result");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <a href="/Home" className="inline-flex items-center gap-2 text-gray-400 text-sm hover:text-gray-600 transition-colors mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Beranda
          </a>
          <h1 className="font-syne text-3xl font-bold text-gray-900">Prediksi Konsumsi Listrik</h1>
          <p className="text-gray-500 text-sm mt-1.5">
            Isi parameter di bawah untuk mendapatkan prediksi kWh, estimasi biaya, dan rekomendasi efisiensi yang dipersonalisasi.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-3 gap-5">

            {/* ── KOLOM KIRI ─────────────────────────────────────── */}
            <div className="col-span-2 space-y-5">

              {/* Parameter Umum */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <SectionTitle icon="📋" title="Parameter Umum" />

                <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                  {/* Tanggal */}
                  <div>
                    <FieldLabel>Tanggal Target</FieldLabel>
                    <input
                      type="date"
                      value={form.tanggal}
                      onChange={(e) => set("tanggal", e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>

                  {/* Jam */}
                  <div>
                    <FieldLabel hint="0–23. Default 19 (jam beban puncak)">Jam Representatif</FieldLabel>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0} max={23}
                        value={form.jam}
                        onChange={(e) => set("jam", Number(e.target.value))}
                        className="flex-1 accent-emerald-500"
                      />
                      <span className="w-10 text-center font-syne font-bold text-emerald-600 text-lg">
                        {String(form.jam).padStart(2, "0")}
                      </span>
                    </div>
                  </div>

                  {/* Suhu */}
                  <div>
                    <FieldLabel hint="Suhu rata-rata lingkungan (°C)">Suhu Lingkungan</FieldLabel>
                    <div className="relative">
                      <input
                        type="number" min={15} max={42} step={0.1}
                        value={form.suhu}
                        onChange={(e) => set("suhu", Number(e.target.value))}
                        className="input-field pr-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">°C</span>
                    </div>
                  </div>

                  {/* Penghuni */}
                  <div>
                    <FieldLabel>Jumlah Penghuni</FieldLabel>
                    <div className="flex items-center gap-2 mt-1">
                      <NumberStepper
                        value={form.jumlah_penghuni}
                        onChange={(v) => set("jumlah_penghuni", v)}
                        min={1} max={15}
                      />
                      <span className="text-sm text-gray-500">orang</span>
                    </div>
                  </div>

                  {/* Luas Rumah */}
                  <div>
                    <FieldLabel>Luas Rumah</FieldLabel>
                    <div className="relative">
                      <input
                        type="number" min={10}
                        value={form.luas_rumah}
                        onChange={(e) => set("luas_rumah", Number(e.target.value))}
                        className="input-field pr-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">m²</span>
                    </div>
                  </div>

                  {/* Golongan Tarif */}
                  <div>
                    <FieldLabel>Golongan Tarif PLN</FieldLabel>
                    <select
                      value={form.golongan_tarif}
                      onChange={(e) => set("golongan_tarif", e.target.value)}
                      className="input-field"
                    >
                      <option value="R-1/TR">R-1/TR — Kecil (≤ 2.200 VA)</option>
                      <option value="R-2/TR">R-2/TR — Menengah (≤ 6.600 VA)</option>
                      <option value="R-3/TR">R-3/TR — Besar (&gt; 6.600 VA)</option>
                    </select>
                  </div>
                </div>

                {/* Daya listrik */}
                <div className="mt-4">
                  <FieldLabel>Daya Listrik Terpasang</FieldLabel>
                  <div className="flex gap-2 mt-1">
                    {[450, 900, 1300, 2200, 3500].map((d) => (
                      <button
                        key={d} type="button"
                        onClick={() => set("daya_listrik", d)}
                        className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all ${
                          form.daya_listrik === d
                            ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                            : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        {d}<span className="block font-normal opacity-60">VA</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hari libur */}
                <div className="mt-4 flex items-center gap-3">
                  <div
                    onClick={() => set("hari_libur", !form.hari_libur)}
                    className={`w-11 h-6 rounded-full relative cursor-pointer transition-all duration-200 ${form.hari_libur ? "bg-emerald-500" : "bg-gray-200"}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${form.hari_libur ? "left-[22px]" : "left-0.5"}`} />
                  </div>
                  <label
                    className="text-sm text-gray-700 font-medium cursor-pointer select-none"
                    onClick={() => set("hari_libur", !form.hari_libur)}
                  >
                    Hari ini adalah hari libur nasional
                  </label>
                </div>
              </div>

              {/* Perangkat Elektronik */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <SectionTitle icon="🔌" title="Perangkat Elektronik" />
                <p className="text-xs text-gray-400 -mt-2 mb-3">Atur jumlah unit dan jam pemakaian per hari</p>

                <DeviceRow icon="❄️" label="AC / Pendingin Udara" watt={900}
                  count={form.jumlah_ac} hours={form.jam_ac_per_hari}
                  onCountChange={(v) => set("jumlah_ac", v)}
                  onHoursChange={(v) => set("jam_ac_per_hari", v)}
                />
                <DeviceRow icon="🧊" label="Kulkas (24 jam)" watt={100}
                  count={form.jumlah_kulkas} hours={24}
                  hoursLabel="tetap" hoursMax={24}
                  onCountChange={(v) => set("jumlah_kulkas", v)}
                  onHoursChange={() => {}}
                />
                <DeviceRow icon="📺" label="Televisi" watt={70}
                  count={form.jumlah_tv} hours={form.jam_tv_per_hari}
                  onCountChange={(v) => set("jumlah_tv", v)}
                  onHoursChange={(v) => set("jam_tv_per_hari", v)}
                />
                <DeviceRow icon="💡" label="Lampu LED" watt={10}
                  count={form.jumlah_lampu} hours={form.jam_lampu_per_hari}
                  onCountChange={(v) => set("jumlah_lampu", v)}
                  onHoursChange={(v) => set("jam_lampu_per_hari", v)}
                />
                <DeviceRow icon="🌀" label="Mesin Cuci" watt={500}
                  count={form.jumlah_mesin_cuci} hours={form.frekuensi_cuci_per_minggu}
                  hoursLabel="kali/minggu" hoursMax={14}
                  onCountChange={(v) => set("jumlah_mesin_cuci", v)}
                  onHoursChange={(v) => set("frekuensi_cuci_per_minggu", v)}
                />
                <DeviceRow icon="💻" label="Komputer / Laptop" watt={120}
                  count={form.jumlah_komputer} hours={form.jam_komputer_per_hari}
                  onCountChange={(v) => set("jumlah_komputer", v)}
                  onHoursChange={(v) => set("jam_komputer_per_hari", v)}
                />

                {/* Tambahan toggle */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Perangkat Tambahan</p>
                  <div className="flex gap-3">
                    {[
                      { key: "water_heater" as const, icon: "🚿", label: "Water Heater", watt: "2000W" },
                      { key: "dispenser"    as const, icon: "💧", label: "Dispenser",    watt: "300W"  },
                      { key: "microwave"    as const, icon: "🍕", label: "Microwave",    watt: "1000W" },
                    ].map((item) => (
                      <div
                        key={item.key}
                        onClick={() => set(item.key, !form[item.key])}
                        className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border cursor-pointer transition-all select-none ${
                          form[item.key]
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300"
                        }`}
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-xs font-semibold">{item.label}</span>
                        <span className="text-[10px] opacity-60">{item.watt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Histori 7 Hari */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <SectionTitle icon="📅" title="Konsumsi 7 Hari Terakhir (kWh)" />
                <p className="text-xs text-gray-400 -mt-2 mb-4">
                  Urutan dari paling lama (H-7) ke paling baru (H-1). Boleh kosong jika tidak tahu.
                </p>
                <div className="grid grid-cols-7 gap-2">
                  {form.hist.map((val, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <input
                        type="number"
                        value={val}
                        step={0.1}
                        min={0}
                        onChange={(e) => setHist(i, e.target.value)}
                        placeholder="—"
                        className="w-full text-center text-sm bg-gray-50 border border-gray-200 rounded-xl px-1 py-2.5 text-gray-900 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20 transition-all placeholder:text-gray-300"
                      />
                      <span className="text-[10px] text-gray-400 font-medium">H-{7 - i}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── KOLOM KANAN ────────────────────────────────────── */}
            <div className="space-y-5">

              {/* Ringkasan estimasi */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20">
                <SectionTitle icon="⚡" title="Estimasi Sebelum Prediksi" />

                {(() => {
                  const kwh = (
                    form.jumlah_ac * 900 * form.jam_ac_per_hari * 30 / 1000 +
                    form.jumlah_kulkas * 100 * 24 * 30 / 1000 +
                    form.jumlah_tv * 70 * form.jam_tv_per_hari * 30 / 1000 +
                    form.jumlah_lampu * 10 * form.jam_lampu_per_hari * 30 / 1000 +
                    form.jumlah_mesin_cuci * 500 * form.frekuensi_cuci_per_minggu * 4 / 1000 +
                    form.jumlah_komputer * 120 * form.jam_komputer_per_hari * 30 / 1000 +
                    (form.water_heater ? 60 : 0) +
                    (form.dispenser ? 216 : 0) +
                    (form.microwave ? 15 : 0)
                  ).toFixed(1);
                  const tagihan = Math.round(Number(kwh) * 1444.70);
                  const kategori = Number(kwh) < 150 ? "Hemat" : Number(kwh) < 300 ? "Normal" : Number(kwh) < 450 ? "Boros" : "Sangat Boros";
                  const colorMap: Record<string, string> = { Hemat: "text-emerald-600", Normal: "text-blue-600", Boros: "text-amber-600", "Sangat Boros": "text-red-600" };
                  const bgMap:    Record<string, string> = { Hemat: "bg-emerald-50 border-emerald-100", Normal: "bg-blue-50 border-blue-100", Boros: "bg-amber-50 border-amber-100", "Sangat Boros": "bg-red-50 border-red-100" };

                  return (
                    <div className={`rounded-xl border p-4 mb-4 ${bgMap[kategori]}`}>
                      <p className="text-xs text-gray-500 mb-1">Estimasi kWh / bulan</p>
                      <p className={`font-syne text-4xl font-extrabold leading-none ${colorMap[kategori]}`}>
                        {kwh}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">kWh</p>
                      <div className="border-t border-current/10 mt-3 pt-3 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-gray-400">Tagihan ≈</p>
                          <p className="font-syne font-bold text-gray-900 text-sm">
                            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(tagihan)}
                          </p>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${bgMap[kategori]} ${colorMap[kategori]}`}>
                          {kategori}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Ringkasan input singkat */}
                <div className="space-y-2 mb-5">
                  {[
                    { label: "Penghuni",    value: `${form.jumlah_penghuni} orang` },
                    { label: "Luas",        value: `${form.luas_rumah} m²` },
                    { label: "Daya",        value: `${form.daya_listrik} VA` },
                    { label: "Suhu",        value: `${form.suhu}°C` },
                    { label: "Jam puncak",  value: `${String(form.jam).padStart(2,"0")}:00` },
                    { label: "Hari libur",  value: form.hari_libur ? "Ya" : "Tidak" },
                    { label: "AC",          value: `${form.jumlah_ac} unit × ${form.jam_ac_per_hari}j` },
                    { label: "Lampu",       value: `${form.jumlah_lampu} buah × ${form.jam_lampu_per_hari}j` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-xs">
                      <span className="text-gray-400">{label}</span>
                      <span className="text-gray-700 font-medium">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3.5 text-base"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Menghitung...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                      Prediksi Sekarang
                    </>
                  )}
                </button>

                <p className="text-[10px] text-gray-400 text-center mt-2">
                  Tarif default: PLN R-1/1300 VA Rp 1.444,70/kWh
                </p>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}