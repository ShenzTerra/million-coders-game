
import React, { useState } from 'react';
import { CommandType } from '../types';

interface CommandPaletteProps {
  available: CommandType[];
  onAdd: (type: CommandType, x?: number, y?: number) => void;
  disabled?: boolean;
  activeLoopId: string | null;
  gridSize: number;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ available, onAdd, disabled, activeLoopId, gridSize }) => {
  const [targetX, setTargetX] = useState(0);
  const [targetY, setTargetY] = useState(0);

  const getIcon = (type: CommandType) => {
    switch (type) {
        case CommandType.MOVE: return <span className="text-4xl">⬆️</span>;
        case CommandType.TURN_LEFT: return <span className="text-4xl">⬅️</span>;
        case CommandType.TURN_RIGHT: return <span className="text-4xl">➡️</span>;
        case CommandType.REPEAT: return <span className="text-4xl">🔁</span>;
        case CommandType.GO_TO: return <span className="text-4xl">📍</span>;
        case CommandType.GLIDE: return <span className="text-4xl">🚀</span>;
        default: return null;
    }
  };

  const getClayClass = (type: CommandType) => {
    switch (type) {
        case CommandType.MOVE: return 'clay-btn-red';
        case CommandType.TURN_LEFT: return 'clay-btn-green';
        case CommandType.TURN_RIGHT: return 'clay-btn-yellow';
        case CommandType.REPEAT: return 'clay-btn-purple';
        case CommandType.GO_TO: return 'clay-btn-orange';
        default: return 'clay-btn-blue';
    }
  };

  const hasCoords = available.includes(CommandType.GO_TO) || available.includes(CommandType.GLIDE);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center px-2">
          <h3 className="text-slate-400 text-[12px] font-black uppercase tracking-[0.3em]">Block Box</h3>
          {activeLoopId && <span className="text-[10px] font-black text-purple-500 animate-pulse uppercase tracking-widest bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-full">Looping Inside ●</span>}
      </div>

      {hasCoords && (
        <div className="bg-orange-50 dark:bg-orange-950/20 p-5 rounded-[2rem] flex flex-col gap-4 shadow-inner border-2 border-orange-100 dark:border-orange-900/30">
            <div className="flex justify-around items-center">
                {[ {l: 'Jump to X', v: targetX, s: setTargetX}, {l: 'Jump to Y', v: targetY, s: setTargetY}].map(axis => (
                  <div key={axis.l} className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">{axis.l}</span>
                    <div className="flex items-center gap-4">
                      <button onClick={() => axis.s(p => Math.max(0, p-1))} className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 shadow-md font-black text-2xl flex items-center justify-center border-2 border-orange-100 dark:border-orange-600 transition-transform active:scale-90">-</button>
                      <span className="text-3xl font-black min-w-[30px] text-center text-slate-700 dark:text-slate-200">{axis.v}</span>
                      <button onClick={() => axis.s(p => Math.min(gridSize-1, p+1))} className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 shadow-md font-black text-2xl flex items-center justify-center border-2 border-orange-100 dark:border-orange-600 transition-transform active:scale-90">+</button>
                    </div>
                  </div>
                ))}
            </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        {available.map(type => (
          <button
            key={type}
            onClick={() => onAdd(type, targetX, targetY)}
            disabled={disabled}
            className={`
              clay-btn ${getClayClass(type)} 
              h-24 md:h-32 rounded-[2rem] flex flex-col items-center justify-center gap-2 text-white transition-all
              ${disabled ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:scale-[1.03] active:scale-95'}
            `}
          >
            <div className="drop-shadow-md">{getIcon(type)}</div>
            <span className="font-black uppercase text-[10px] tracking-widest text-white/90">{type.replace('_', ' ')}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CommandPalette;
