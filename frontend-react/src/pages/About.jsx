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
