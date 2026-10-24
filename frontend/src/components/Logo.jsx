import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ size = 'md', showTagline = true, to = '/' }) => {
  const sizeMap = {
    sm: {
      svg: 'w-7 h-7',
      text: 'text-lg',
      badge: 'text-[9px] px-1.5 py-0.5',
      tagline: 'text-[9px]'
    },
    md: {
      svg: 'w-9 h-9',
      text: 'text-xl',
      badge: 'text-[10px] px-1.5 py-0.5',
      tagline: 'text-[10px]'
    },
    lg: {
      svg: 'w-12 h-12',
      text: 'text-2xl',
      badge: 'text-xs px-2 py-0.5',
      tagline: 'text-xs'
    }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <Link to={to} className="flex items-center gap-2.5 group flex-shrink-0 cursor-pointer select-none">
      {/* Pure Unboxed Floating Vector Emblem */}
      <div className={`${currentSize.svg} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}>
        <svg 
          viewBox="0 0 36 36" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="gigoraPureGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
          </defs>

          {/* Bold Naked Stylized 'G' Mark (Zero Background Box) */}
          <path 
            d="M24.5 12.2C22.8 10.8 20.5 10 17.8 10C12.9 10 9 13.6 9 18.2C9 22.8 12.9 26.4 17.8 26.4C22.4 26.4 25.9 23.4 26.4 19.2H18.2V15.8H30C30 16.6 30 17.4 30 18.2C30 24.8 24.6 30 17.8 30C10.7 30 5 24.7 5 18.2C5 11.7 10.7 6.4 17.8 6.4C21.7 6.4 25.1 7.9 27.6 10.4L24.5 12.2Z" 
            fill="url(#gigoraPureGrad)" 
          />
          {/* Dynamic Talent Spark Node */}
          <circle cx="27" cy="9.5" r="2.8" fill="#818CF8" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`${currentSize.text} font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors`}>
            Gig<span className="text-indigo-600">Ora</span>
          </span>
          <span className={`${currentSize.badge} font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 rounded uppercase tracking-wider`}>
            IN
          </span>
        </div>
        {showTagline && (
          <span className={`${currentSize.tagline} font-medium text-slate-500 -mt-0.5 hidden sm:block tracking-normal`}>
            Freelance Marketplace
          </span>
        )}
      </div>
    </Link>
  );
};

export default Logo;
