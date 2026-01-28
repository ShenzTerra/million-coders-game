
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
        case CommandType.MOVE: return <span className="text-3xl">⬆️</span>;
        case CommandType.TURN_LEFT: return <span className="text-3xl">⬅️</span>;
        case CommandType.TURN_RIGHT: return <span className="text-3xl">➡️</span>;
        case CommandType.REPEAT: return <span className="text-3xl">🔁</span>;
        case CommandType.GO_TO: return <span className="text-3xl">📍</span>;
        case CommandType.GLIDE: return <span className="text-3xl">🚀</span>;
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
    <div className="flex flex-col h-full gap-5">
      <div className="flex justify-between items-center px-1 shrink-0">
          <h3 className="text-label text-slate-500">Block Chest</h3>
          {activeLoopId && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-900/30 rounded-full border border-purple-500/20">
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-ping"></span>
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">In Loop</span>
            </div>
          )}
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {hasCoords && (
          <div className="bg-orange-950/20 p-4 rounded-2xl flex flex-col gap-3 shadow-inner border border-orange-900/30 shrink-0">
              <div className="flex justify-around items-center">
                  {[ {l: 'Target X', v: targetX, s: setTargetX}, {l: 'Target Y', v: targetY, s: setTargetY}].map(axis => (
                    <div key={axis.l} className="flex flex-col items-center gap-1.5">
                      <div className="flex items-center gap-3">
                        <button onClick={() => axis.s(p => Math.max(0, p-1))} className="w-9 h-9 rounded-full bg-slate-800 shadow-sm font-black text-xl flex items-center justify-center border border-orange-800/30 active:scale-90 text-white">-</button>
                        <span className="text-2xl font-black min-w-[30px] text-center text-orange-200">{axis.l.slice(-1)}{axis.v}</span>
                        <button onClick={() => axis.s(p => Math.min(gridSize-1, p+1))} className="w-9 h-9 rounded-full bg-slate-800 shadow-sm font-black text-xl flex items-center justify-center border border-orange-800/30 active:scale-90 text-white">+</button>
                      </div>
                    </div>
                  ))}
              </div>
          </div>
        )}
        
        {/* Full width vertical blocks list */}
        <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2 flex-1 pb-4">
          {available.map(type => (
            <button
              key={type}
              onClick={() => onAdd(type, targetX, targetY)}
              disabled={disabled}
              className={`
                clay-btn ${getClayClass(type)} 
                w-full h-20 rounded-2xl transition-all px-6 py-3 flex-row gap-6 shadow-md
                ${disabled ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:scale-[1.03] active:scale-95'}
              `}
              style={{ flexDirection: 'row', justifyContent: 'flex-start' }}
            >
              <div className="drop-shadow-lg w-10 flex justify-center shrink-0">{getIcon(type)}</div>
              <div className="flex flex-col items-start truncate">
                <span className={`font-black uppercase text-sm tracking-widest leading-none ${type === CommandType.TURN_RIGHT ? 'text-slate-800' : 'text-white'}`}>
                    {type.replace('_', ' ')}
                </span>
                <span className={`text-[9px] font-bold uppercase opacity-60 tracking-wider mt-1 ${type === CommandType.TURN_RIGHT ? 'text-slate-700' : 'text-white'}`}>
                    Tap to build
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
