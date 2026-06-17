import React from 'react';

const Logo = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Lightbulb Icon with Lightning */}
      <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: '40px', height: '40px' }}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
          {/* Lightbulb outline */}
          <path 
            d="M50 10 C30 10 15 25 15 45 C15 58 24 68 30 75 L30 85 C30 88 32 90 35 90 L65 90 C68 90 70 88 70 85 L70 75 C76 68 85 58 85 45 C85 25 70 10 50 10 Z" 
            fill="none" 
            stroke="url(#grad1)" 
            strokeWidth="6" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          {/* Base threads */}
          <path d="M35 85 L65 85 M38 92 L62 92 M42 98 L58 98" stroke="#1e3a8a" strokeWidth="4" strokeLinecap="round" />
          
          {/* Inner Lightning Bolt */}
          <path d="M55 25 L35 55 L50 55 L45 80 L65 50 L50 50 Z" fill="#4ade80" />
          
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" /> {/* Green left */}
              <stop offset="100%" stopColor="#3b82f6" /> {/* Blue right */}
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Text Branding */}
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline leading-none mb-0.5">
          <span className="text-[22px] font-bold text-emerald-600" style={{ color: '#059669', fontFamily: 'Outfit, sans-serif' }}>Watt</span>
          <span className="text-[22px] font-bold text-blue-900" style={{ color: '#1e3a8a', fontFamily: 'Outfit, sans-serif' }}>Smart</span>
        </div>
        <span className="text-[13px] font-semibold text-blue-800 leading-none tracking-wide" style={{ color: '#1e40af', fontFamily: 'Inter, sans-serif' }}>
          Predictor
        </span>
      </div>
    </div>
  );
};

export default Logo;
