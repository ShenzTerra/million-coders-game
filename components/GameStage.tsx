
import React, { useEffect, useState } from 'react';
import { Position } from '../types';

interface GameStageProps {
  gridSize: number;
  botPos: Position;
  botRotation: number;
  goalPos: Position;
  obstacles: Position[];
  gameState: 'IDLE' | 'WON' | 'LOST' | 'RUNNING';
  isLooping?: boolean;
}

const GameStage: React.FC<GameStageProps> = ({ gridSize, botPos, botRotation, goalPos, obstacles, gameState, isLooping }) => {
  const cellPercent = 100 / gridSize;
  const [activeMotion, setActiveMotion] = useState(false);

  useEffect(() => {
    if (gameState === 'RUNNING' || gameState === 'IDLE') {
      setActiveMotion(true);
      const timer = setTimeout(() => setActiveMotion(false), 200);
      return () => clearTimeout(timer);
    }
  }, [botPos.x, botPos.y, botRotation]);

  return (
    <div className="w-full h-full relative overflow-hidden p-8 md:p-12 bg-slate-900">
      {/* Grid Coordinates Labels */}
      <div className="absolute top-4 left-8 right-8 md:left-12 md:right-12 flex justify-around pointer-events-none opacity-20 z-0">
        {Array.from({ length: gridSize }).map((_, i) => (
          <span key={`x-${i}`} className="text-[10px] font-black w-full text-center text-slate-100">{i}</span>
        ))}
      </div>
      <div className="absolute left-4 top-8 bottom-8 md:top-12 md:bottom-12 flex flex-col justify-around pointer-events-none opacity-20 z-0">
        {Array.from({ length: gridSize }).map((_, i) => (
          <span key={`y-${i}`} className="text-[10px] font-black h-full flex items-center text-slate-100">{i}</span>
        ))}
      </div>

      <div className="relative w-full h-full border-2 border-slate-800 rounded-3xl overflow-hidden bg-slate-800/20 shadow-inner">
        {/* Goal */}
        <div 
          className="absolute flex items-center justify-center transition-all duration-500 z-10"
          style={{ 
            width: `${cellPercent}%`, height: `${cellPercent}%`, 
            left: `${goalPos.x * cellPercent}%`, top: `${goalPos.y * cellPercent}%` 
          }}
        >
          <div className="w-10 h-10 md:w-16 md:h-16 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_25px_rgba(250,204,21,0.6)] flex items-center justify-center border-4 border-slate-800">
              <span className="text-xl md:text-3xl drop-shadow-sm">🔋</span>
          </div>
        </div>

        {/* Obstacles */}
        {obstacles.map((obs, i) => (
          <div 
            key={i}
            className="absolute flex items-center justify-center z-10"
            style={{ 
              width: `${cellPercent}%`, height: `${cellPercent}%`, 
              left: `${obs.x * cellPercent}%`, top: `${obs.y * cellPercent}%` 
            }}
          >
            <div className="w-[85%] h-[85%] bg-slate-700 rounded-2xl border-b-8 border-slate-900 flex items-center justify-center shadow-lg">
              <span className="text-lg md:text-xl grayscale opacity-40">🧱</span>
            </div>
          </div>
        ))}

        {/* Character */}
        <div 
          className="absolute flex items-center justify-center z-20 will-change-[left,top]"
          style={{ 
            width: `${cellPercent}%`, height: `${cellPercent}%`, 
            left: `${botPos.x * cellPercent}%`, top: `${botPos.y * cellPercent}%`,
            transitionProperty: 'left, top',
            transitionDuration: '600ms',
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          <div 
              className={`w-[75%] h-[75%] max-w-[80px] max-h-[80px] relative flex items-center justify-center transition-transform duration-300 ${activeMotion ? 'scale-110' : 'scale-100'}`}
              style={{ transform: `rotate(${botRotation}deg)` }}
          >
              {/* Morphing Clay Blob Body */}
              <div className={`absolute inset-0 bg-[#a374ff] rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%] shadow-[inset_-4px_-4px_12px_rgba(0,0,0,0.15),0_10px_20px_rgba(163,116,255,0.4)] animate-morph ${isLooping ? 'ring-4 ring-white/50 scale-105 shadow-[0_0_40px_rgba(163,116,255,0.8)]' : ''} ${gameState === 'LOST' ? 'grayscale opacity-60' : ''}`} />
              
              {/* Eyes */}
              <div className="relative z-20 flex gap-1.5 md:gap-2">
                  <div className="w-2.5 md:w-3 h-5 md:h-6 bg-slate-900 rounded-full relative overflow-hidden">
                      <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full opacity-80" />
                  </div>
                  <div className="w-2.5 md:w-3 h-5 md:h-6 bg-slate-900 rounded-full relative overflow-hidden">
                      <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full opacity-80" />
                  </div>
              </div>
          </div>
        </div>
      </div>

      {/* Simplified Help Hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full shadow-2xl border-2 bg-slate-800/95 z-30 border-slate-700">
        <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <span className="text-blue-400">💡</span> Help: Build your program then press Go!
        </p>
      </div>
    </div>
  );
};

export default GameStage;
