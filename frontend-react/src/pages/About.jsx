import { Users } from 'lucide-react';

const LinkedinIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const GithubIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

const members = [
  {
    name: 'Fauzan Aidil Luthfi',
    university: 'Universitas Medan Area',
    department: 'Teknik Informatika',
    photo: 'https://i.ibb.co.com/67tbS7Cq/Whats-App-Image-2026-06-17-at-20-05-33.jpg',
    linkedin: 'https://www.linkedin.com/in/fauzan-aidil-luthfi',
    github: 'https://github.com/Zann-Aidil',
  },
  {
    name: 'Vincent Christian',
    university: 'Universitas Bina Sarana Informatika',
    department: 'Sistem Informasi',
    photo: 'https://i.ibb.co.com/spBq8X1P/Whats-App-Image-2026-06-17-at-19-14-58.jpg',
    linkedin: 'linkedin.com/in/vincent-christian-887152294',
    github: 'https://github.com/vincchris',
  },
  {
    name: 'M Najwan Naufal Alfarid',
    university: 'Politeknik Enjinering Indorama',
    department: 'Teknologi Rekayasa Perangkat Lunak',
    photo: 'https://i.ibb.co.com/8g8Tsmpc/Whats-App-Image-2026-06-18-at-03-46-47.jpg',
    linkedin: 'https://www.linkedin.com/in/najwanopal/',
    github: 'https://github.com/wanfalrid',
  },
  {
    name: 'Mochamad Abdul Rozag',
    university: 'Universitas Nahdlatul Ulama Surabaya',
    department: 'Sistem Informasi',
    photo: 'https://i.ibb.co.com/DPcf1wJy/Whats-App-Image-2026-06-17-at-19-25-41.jpg',
    linkedin: 'linkedin.com/in/rozag',
    github: 'github.com/abbdr',
  },
];

const MemberCard = ({ member }) => (
  <div className="card flex flex-col items-center text-center gap-3">
    <img
      src={member.photo}
      alt={member.name}
      className="w-24 h-24 rounded-full object-cover"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=059669&color=fff&size=96`;
      }}
    />
    <div>
      <p className="font-bold text-lg text-gray-900">{member.name}</p>
      <p className="text-sm text-gray-500">{member.university}</p>
      <p className="text-sm text-gray-500">{member.department}</p>
    </div>
    <div className="flex items-center gap-4 mt-1">
      {member.linkedin !== '#' && (
        <a
          href={member.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-emerald-600 transition-colors"
          aria-label={`LinkedIn ${member.name}`}
        >
          <LinkedinIcon size={20} />
        </a>
      )}
      {member.linkedin === '#' && (
        <span className="text-gray-300" aria-hidden="true">
          <LinkedinIcon size={20} />
        </span>
      )}
      {member.github !== '#' && (
        <a
          href={member.github}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-gray-900 transition-colors"
          aria-label={`GitHub ${member.name}`}
        >
          <GithubIcon size={20} />
        </a>
      )}
      {member.github === '#' && (
        <span className="text-gray-300" aria-hidden="true">
          <GithubIcon size={20} />
        </span>
      )}
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
        {members.map((member, index) => (
          <MemberCard key={index} member={member} />
        ))}
      </div>
    </div>
  );
};

export default About;
