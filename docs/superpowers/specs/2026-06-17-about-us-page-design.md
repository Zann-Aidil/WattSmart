# About Us Page — Design Spec
**Date:** 2026-06-17  
**Route:** `/tentang`  
**File:** `frontend-react/src/pages/About.jsx`

## Summary

Replace the existing `/tentang` page (which showed WattSmart project features) with a team member profile page. The page displays 4 members in a 2×2 grid, each with photo, name, university, department, and links to LinkedIn and GitHub.

## Architecture

- **Single file change:** `src/pages/About.jsx` — full replacement
- **No new routes, no new components** — the route `/tentang` and nav links already exist
- **No backend changes required**

## Layout

### Header
- Icon: `Users` (lucide-react), emerald background
- Title: "Tim Kami"
- Subtitle: "Kelompok di balik WattSmart"

### Member Grid
- Layout: `grid grid-cols-1 md:grid-cols-2 gap-6`
- 4 cards total (2×2 on desktop, stacked on mobile)

### Member Card (per card)
```
┌─────────────────────────────┐
│      [Foto Bulat 96px]      │
│      Nama Lengkap           │
│      Universitas XYZ        │
│      Jurusan ABC            │
│                             │
│   [LinkedIn]  [GitHub]      │
└─────────────────────────────┘
```
- Photo: `<img>` with `rounded-full`, `object-cover`, 96×96px; fallback to `ui-avatars.com` initials avatar
- Name: `font-bold text-lg text-gray-900`
- University: `text-sm text-gray-500`
- Department: `text-sm text-gray-500`
- Social links: anchor tags with `target="_blank" rel="noopener noreferrer"`, using `Linkedin` and `Github` icons from lucide-react

## Styling

- Uses existing `.card` class for card wrapper
- Emerald accent (`text-emerald-600`, `bg-emerald-50`) consistent with rest of app
- `.animate-fade-in` on page wrapper
- Icon links styled with hover states: `hover:text-emerald-600` for LinkedIn, `hover:text-gray-900` for GitHub

## Dummy Data

4 placeholder members using `ui-avatars.com` for photo URLs:

| Name | University | Department | LinkedIn | GitHub |
|------|------------|------------|----------|--------|
| Anggota Satu | Universitas Indonesia | Ilmu Komputer | `#` | `#` |
| Anggota Dua | Institut Teknologi Bandung | Teknik Informatika | `#` | `#` |
| Anggota Tiga | Universitas Gadjah Mada | Sistem Informasi | `#` | `#` |
| Anggota Empat | Universitas Brawijaya | Teknik Komputer | `#` | `#` |

> All `#` links are placeholders — replace with real URLs.

## Out of Scope

- No bio/description text per member
- No animations beyond existing `.animate-fade-in`
- No backend or API changes
