
import React from 'react';

export const MillionCodersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Head - Orange Circle */}
    <circle cx="50" cy="18" r="14" fill="#F97316" />
    {/* Body - Stylized Brackets / Diamond Shape */}
    <path 
      d="M15 52 L48 35 L52 35 L85 52 L52 69 L48 69 Z" 
      fill="#F97316" 
    />
    <path 
      d="M48 35 L25 52 L48 69 M52 35 L75 52 L52 69" 
      stroke="#F97316" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
);

export const MillionCodersFullLogo: React.FC = () => (
  <div className="flex flex-col items-center justify-center select-none group cursor-pointer transition-transform hover:scale-105 active:scale-95">
    {/* Stacked Text Layout - Removed Icon as per request */}
    <div className="flex flex-col items-center leading-[0.8] font-black">
      {/* MILLION */}
      <span className="text-[1.4rem] md:text-[1.6rem] tracking-[-0.04em] text-white">
        MILLION
      </span>
      
      {/* CODERS with custom E */}
      <div className="flex items-center">
        <span className="text-[1.4rem] md:text-[1.6rem] tracking-[-0.04em] text-white">COD</span>
        
        {/* The Signature Orange E Bars - Precise alignment with characters */}
        <div className="flex flex-col gap-[2.5px] px-[3px] pt-[3px]">
            <div className="w-[16px] h-[4px] bg-[#F97316] rounded-[1px] shadow-[0_1px_2px_rgba(249,115,22,0.3)]"></div>
            <div className="w-[16px] h-[4px] bg-[#F97316] rounded-[1px] shadow-[0_1px_2px_rgba(249,115,22,0.3)]"></div>
            <div className="w-[16px] h-[4px] bg-[#F97316] rounded-[1px] shadow-[0_1px_2px_rgba(249,115,22,0.3)]"></div>
        </div>
        
        <span className="text-[1.4rem] md:text-[1.6rem] tracking-[-0.04em] text-white">RS</span>
      </div>
    </div>
  </div>
);
