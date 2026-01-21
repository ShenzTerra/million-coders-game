
import React from 'react';

export const MillionCodersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Head */}
    <circle cx="50" cy="20" r="12" fill="#F97316" />
    {/* Code Arms/Body Shape */}
    <path 
      d="M20 50 L45 35 L50 40 L55 35 L80 50 L50 65 Z" 
      fill="#F97316" 
      stroke="#F97316" 
      strokeWidth="2" 
      strokeLinejoin="round" 
    />
    <path 
      d="M45 70 L55 70 M50 65 L50 85" 
      stroke="#F97316" 
      strokeWidth="6" 
      strokeLinecap="round" 
    />
  </svg>
);

export const MillionCodersFullLogo: React.FC = () => (
  <div className="flex items-center gap-3">
    <div className="w-12 h-12 flex-shrink-0">
      <MillionCodersIcon className="w-full h-full" />
    </div>
    <div className="flex flex-col leading-none pt-1">
      <span className="text-xl font-black tracking-tighter text-white">MILLION</span>
      <div className="flex items-center gap-1">
        <span className="text-xl font-black tracking-tighter text-white">COD</span>
        <div className="flex flex-col gap-[3px] pt-1">
            <div className="w-4 h-[3px] bg-orange-500"></div>
            <div className="w-4 h-[3px] bg-orange-500"></div>
            <div className="w-4 h-[3px] bg-orange-500"></div>
        </div>
        <span className="text-xl font-black tracking-tighter text-white">RS</span>
      </div>
    </div>
  </div>
);
