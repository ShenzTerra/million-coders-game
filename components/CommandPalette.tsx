
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
        case CommandType.MOVE: return <svg viewBox="0 0 24 24" className="w-10 h-10"><path d="M7 14l5-5 5 5H7z" fill="currentColor"/></svg>;
        case CommandType.TURN_LEFT: return <svg viewBox="0 0 24 24" className="w-10 h-10"><path d="M14 7l-5 5 5 5V7z" fill="currentColor"/></svg>;
        case CommandType.TURN_RIGHT: return <svg viewBox="0 0 24 24" className="w-10 h-10"><path d="M10 17l5-5-5-5v10z" fill="currentColor"/></svg>;
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
        case CommandType.GO_TO: return 'clay-btn-blue';
        case CommandType.GLIDE: return 'clay-btn-blue';
        default: return 'clay-btn-blue';
    }
  };

  const hasCoords = available.includes(CommandType.GO_TO) || available.includes(CommandType.GLIDE);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center px-2">
          <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Commands</h3>
          {activeLoopId && <span className="text-[10px] font-black text-purple-500 animate-pulse">ADDING TO LOOP ●</span>}
      </div>

      {hasCoords && (
        <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-3xl border-2 border-slate-100 dark:border-slate-800 flex flex-col gap-4">
          <div className="flex justify-around items-center">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target X</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setTargetX(prev => Math.max(0, prev - 1))} className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-bold">-</button>
                <span className="text-2xl font-black min-w-[30px] text-center" style={{ color: 'var(--clay-text)' }}>{targetX}</span>
                <button onClick={() => setTargetX(prev => Math.min(gridSize - 1, prev + 1))} className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-bold">+</button>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Y</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setTargetY(prev => Math.max(0, prev - 1))} className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-bold">-</button>
                <span className="text-2xl font-black min-w-[30px] text-center" style={{ color: 'var(--clay-text)' }}>{targetY}</span>
                <button onClick={() => setTargetY(prev => Math.min(gridSize - 1, prev + 1))} className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-bold">+</button>
              </div>
            </div>
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
              h-28 rounded-[2rem] flex flex-col items-center justify-center gap-2 text-white transition-all
              ${disabled ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:scale-[1.02]'}
            `}
          >
            {getIcon(type)}
            <span className="font-black uppercase text-[10px] tracking-widest opacity-80">{type.replace('_', ' ')}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CommandPalette;
