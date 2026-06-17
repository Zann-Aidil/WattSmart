# Charts & Analytics — Real Data Design Spec
**Date:** 2026-06-17

## Summary

Replace all hardcoded/dummy/random chart data across Dashboard, Predict, and Analysis pages with values computed from real `/api/history` data. No new backend endpoints needed.

## Scope

- `frontend-react/src/pages/Dashboard.jsx`
- `frontend-react/src/pages/Predict.jsx`
- `frontend-react/src/pages/Analysis.jsx`

No backend changes. All pages already fetch from `GET /api/history?limit=200`.

## History Data Shape (reference)

Each item from `/api/history`:
```js
{
  id, tanggal, jam, suhu, penghuni, perangkat_aktif, jam_pemakaian,
  is_holiday, is_weekend,
  pred_kwh, est_biaya, kategori,  // "rendah"|"sedang"|"tinggi"|"sangat_tinggi"
  created_at
}
```

---

## Dashboard.jsx Changes

### Remove
- `distribusi` hardcoded array
- `PieChart` and `Cell` imports from recharts
- The entire pie chart card ("Distribusi Konsumsi")

### Add
Replace pie chart card with **bar chart: jumlah prediksi per kategori**.

```js
// Compute from history
const kategoriCount = { rendah: 0, sedang: 0, tinggi: 0, sangat_tinggi: 0 }
history.forEach(h => { if (kategoriCount[h.kategori] !== undefined) kategoriCount[h.kategori]++ })
const kategoriData = [
  { name: 'Rendah',       value: kategoriCount.rendah,        fill: '#10b981' },
  { name: 'Sedang',       value: kategoriCount.sedang,        fill: '#3b82f6' },
  { name: 'Tinggi',       value: kategoriCount.tinggi,        fill: '#f59e0b' },
  { name: 'Sangat Tinggi',value: kategoriCount.sangat_tinggi, fill: '#ef4444' },
]
```

Render with `<BarChart>` (already imported), title: "Distribusi Kategori Konsumsi", subtitle: "Berdasarkan riwayat prediksi".

---

## Predict.jsx Changes

### Chart Data — remove Math.random()
Replace mock chart generation with real history:

```js
// After prediction result arrives, fetch history for chart
const chartData = history
  .slice(0, 7)                          // 7 most recent predictions
  .reverse()                            // oldest first
  .map(h => ({
    date: h.tanggal,
    aktual: parseFloat(h.pred_kwh.toFixed(1)),
  }))
// Add today's prediction as the last point
chartData.push({ date: formData.tanggal, prediksi: parseFloat(result.prediksi_kwh.toFixed(1)) })
```

### Perbandingan — remove hardcoded "+8.6%"
```js
const avg7 = history.slice(0, 7).reduce((s, h) => s + h.pred_kwh, 0) / Math.min(history.length, 7)
const pctDiff = avg7 > 0 ? ((result.prediksi_kwh - avg7) / avg7 * 100).toFixed(1) : null
// Render: pctDiff !== null ? `${pctDiff > 0 ? '+' : ''}${pctDiff}%` : '—'
// Color: pctDiff > 0 ? text-red-500 : text-emerald-600
```

### Data flow
Predict page already fetches history in some form — ensure history is fetched once on mount and reused for both chart and comparison. If history is not currently fetched, add:
```js
const [history, setHistory] = useState([])
useEffect(() => {
  getHistory({ limit: 10 }).then(r => setHistory(r.data.data || []))
}, [])
```

---

## Analysis.jsx Changes

### 1. Replace pie chart with bar chart per kategori
Same logic as Dashboard — count per kategori from history, render `<BarChart>`.
Remove `PieChart`, `Pie`, `Cell` imports if no longer used.

### 2. Dynamic date range
```js
const dates = history.map(h => h.tanggal).sort()
const dateRangeLabel = dates.length > 0
  ? `${dates[0]} – ${dates[dates.length - 1]}`
  : 'Belum ada data'
```
Replace hardcoded "10 Juni 2026 - 16 Juni 2026" with `dateRangeLabel`.

### 3. Hourly bar chart — remove random fallback
```js
const hourlyMap = {}
history.forEach(h => {
  if (!hourlyMap[h.jam]) hourlyMap[h.jam] = { total: 0, count: 0 }
  hourlyMap[h.jam].total += h.pred_kwh
  hourlyMap[h.jam].count++
})
const hourlyData = Object.entries(hourlyMap)
  .map(([hr, v]) => ({ time: `${hr}:00`, value: parseFloat((v.total / v.count).toFixed(1)) }))
  .sort((a, b) => parseInt(a.time) - parseInt(b.time))
// No random fallback — if no data for a hour, that hour simply doesn't appear
```

### 4. Peak hour — dynamic
```js
const peakEntry = hourlyData.reduce((max, h) => h.value > max.value ? h : max, { time: '-', value: 0 })
const peakHour = peakEntry.time  // replaces hardcoded "19:00 - 22:00"
```

### 5. Dynamic insights (4 info boxes)
Replace all hardcoded text:

| Box | Old | New |
|-----|-----|-----|
| Tren konsumsi | "meningkat 8.3%" | compare avg of first half vs second half of history |
| Jam puncak | "19:00 - 22:00" | `peakHour` from step 4 |
| Suhu rata-rata | "30°C" | `(history.reduce((s,h) => s+h.suhu, 0) / history.length).toFixed(1)` |
| Rata-rata perangkat | "8 perangkat" | `Math.round(history.reduce((s,h) => s+h.perangkat_aktif, 0) / history.length)` |

Tren calculation:
```js
const half = Math.floor(history.length / 2)
const recentAvg = history.slice(0, half).reduce((s,h) => s+h.pred_kwh, 0) / half
const olderAvg  = history.slice(half).reduce((s,h) => s+h.pred_kwh, 0) / (history.length - half)
const trendPct  = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg * 100).toFixed(1) : null
const trendText = trendPct === null ? '—'
  : trendPct > 0 ? `Meningkat ${trendPct}%` : `Menurun ${Math.abs(trendPct)}%`
```

## Edge Cases
- Empty history (0 predictions): all charts show empty state, insights show "—" or "Belum ada data"
- Only 1 prediction: comparison shows "—", trend shows "—"
- All predictions same kategori: bar chart shows single bar
