# About Us Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing `/tentang` page with a team member profile page showing 4 members in a 2×2 grid with photo, name, university, department, and LinkedIn/GitHub links.

**Architecture:** Single file replacement — `About.jsx` is rewritten entirely. No new routes, components, or backend changes needed. Route `/tentang` and all nav links already exist.

**Tech Stack:** React, Tailwind CSS 4, lucide-react (Users, Linkedin, Github icons), ui-avatars.com for placeholder photos.

## Global Constraints

- Only modify `frontend-react/src/pages/About.jsx` — no other files
- Use existing `.card` CSS class (defined in `frontend-react/src/index.css`)
- Use emerald accent: `text-emerald-600`, `bg-emerald-50`
- All social links open in new tab with `target="_blank" rel="noopener noreferrer"`
- Photo placeholder: `https://ui-avatars.com/api/?name=NAMA&background=059669&color=fff&size=96`
- No new npm packages — only `lucide-react` (already installed)

---

### Task 1: Replace About.jsx with team member grid

**Files:**
- Modify: `frontend-react/src/pages/About.jsx` (full replacement)

**Interfaces:**
- Consumes: `.card` class from `index.css`, `lucide-react` icons
- Produces: default export `About` component, rendered at route `/tentang`

- [ ] **Step 1: Replace the full contents of `About.jsx`**

```jsx
import React from 'react';
import { Users, Linkedin, Github } from 'lucide-react';

const members = [
  {
    name: 'Anggota Satu',
    university: 'Universitas Indonesia',
    department: 'Ilmu Komputer',
    photo: 'https://ui-avatars.com/api/?name=Anggota+Satu&background=059669&color=fff&size=96',
    linkedin: '#',
    github: '#',
  },
  {
    name: 'Anggota Dua',
    university: 'Institut Teknologi Bandung',
    department: 'Teknik Informatika',
    photo: 'https://ui-avatars.com/api/?name=Anggota+Dua&background=059669&color=fff&size=96',
    linkedin: '#',
    github: '#',
  },
  {
    name: 'Anggota Tiga',
    university: 'Universitas Gadjah Mada',
    department: 'Sistem Informasi',
    photo: 'https://ui-avatars.com/api/?name=Anggota+Tiga&background=059669&color=fff&size=96',
    linkedin: '#',
    github: '#',
  },
  {
    name: 'Anggota Empat',
    university: 'Universitas Brawijaya',
    department: 'Teknik Komputer',
    photo: 'https://ui-avatars.com/api/?name=Anggota+Empat&background=059669&color=fff&size=96',
    linkedin: '#',
    github: '#',
  },
];

const MemberCard = ({ member }) => (
  <div className="card flex flex-col items-center text-center gap-3">
    <img
      src={member.photo}
      alt={member.name}
      className="w-24 h-24 rounded-full object-cover"
      onError={(e) => {
        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=059669&color=fff&size=96`;
      }}
    />
    <div>
      <p className="font-bold text-lg text-gray-900">{member.name}</p>
      <p className="text-sm text-gray-500">{member.university}</p>
      <p className="text-sm text-gray-500">{member.department}</p>
    </div>
    <div className="flex items-center gap-4 mt-1">
      <a
        href={member.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-emerald-600 transition-colors"
        aria-label={`LinkedIn ${member.name}`}
      >
        <Linkedin size={20} />
      </a>
      <a
        href={member.github}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-gray-900 transition-colors"
        aria-label={`GitHub ${member.name}`}
      >
        <Github size={20} />
      </a>
    </div>
  </div>
);

const About = () => {
  return (
    <div className="w-full max-w-4xl mx-auto pb-8 animate-fade-in">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
          <Users size={20} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tim Kami</h2>
          <p className="text-sm text-gray-500">Kelompok di balik WattSmart</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {members.map((member) => (
          <MemberCard key={member.name} member={member} />
        ))}
      </div>
    </div>
  );
};

export default About;
```

- [ ] **Step 2: Verify the dev server runs without errors**

```bash
cd frontend-react
npm run dev
```

Open `http://localhost:5173/tentang` in the browser.  
Expected: page shows 4 cards in a 2×2 grid (desktop) / stacked (mobile), each with circular avatar, name, university, department, and two icon links.

- [ ] **Step 3: Commit**

```bash
git add frontend-react/src/pages/About.jsx
git commit -m "feat: replace About page with team member profiles"
```

---

### Task 2: Replace dummy data with real member data

_Do this once the team provides real names, photos, LinkedIn URLs, and GitHub URLs._

**Files:**
- Modify: `frontend-react/src/pages/About.jsx` — update the `members` array only

- [ ] **Step 1: Update the `members` array** with real data

Replace each entry in `members` with:
```js
{
  name: 'Nama Asli',
  university: 'Nama Universitas',
  department: 'Nama Jurusan',
  photo: 'https://...',      // URL foto atau path lokal di public/
  linkedin: 'https://linkedin.com/in/username',
  github: 'https://github.com/username',
}
```

If using a local photo, place the file in `frontend-react/public/team/` and use `photo: '/team/nama.jpg'`.

- [ ] **Step 2: Verify visually** at `http://localhost:5173/tentang`

- [ ] **Step 3: Commit**

```bash
git add frontend-react/src/pages/About.jsx
git commit -m "feat: update About page with real team member data"
```
