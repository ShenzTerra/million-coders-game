
import React from 'react';
import { Command, CommandType } from '../types';

interface ProgramQueueProps {
  program: Command[];
  onRemove: (id: string, parentId?: string) => void;
  onClear: () => void;
  isRunning: boolean;
  currentStepIndex: string | null;
  activeLoopId: string | null;
  onSetActiveLoop: (id: string | null) => void;
  onUpdateRepeatCount: (id: string, delta: number) => void;
  isDarkMode?: boolean;
}

const ProgramQueue: React.FC<ProgramQueueProps> = ({ 
  program, onRemove, onClear, isRunning, currentStepIndex, activeLoopId, onSetActiveLoop, onUpdateRepeatCount, isDarkMode 
}) => {

  const renderCommand = (cmd: Command, parentId?: string) => {
    const isActive = currentStepIndex === cmd.id;
    const isNestingActive = activeLoopId === cmd.id;
    const isLoop = cmd.type === CommandType.REPEAT;

    if (isLoop) {
        return (
            <div key={cmd.id} className="w-full mb-6 flex flex-col animate-in slide-in-from-right duration-300">
                <div className={`p-5 rounded-t-[2.5rem] border-t-4 border-x-4 border-purple-400 flex items-center justify-between ${isNestingActive ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-slate-50 dark:bg-slate-800'}`}>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl drop-shadow-sm">🔁</span>
                        <div className="flex items-center gap-2 bg-white/60 dark:bg-black/20 rounded-full px-2 py-1 shadow-inner">
                            <button onClick={(e) => {e.stopPropagation(); onUpdateRepeatCount(cmd.id, -1)}} className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 shadow-sm font-black text-xl flex items-center justify-center transition-transform active:scale-75">-</button>
                            <span className="text-2xl font-black min-w-[25px] text-center text-purple-600">{cmd.count}</span>
                            <button onClick={(e) => {e.stopPropagation(); onUpdateRepeatCount(cmd.id, 1)}} className="w-8 h-8 rounded-full bg-purple-500 text-white shadow-sm font-black text-xl flex items-center justify-center transition-transform active:scale-75">+</button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => onSetActiveLoop(isNestingActive ? null : cmd.id)} 
                            className={`w-12 h-12 rounded-2xl font-bold flex items-center justify-center transition-all ${isNestingActive ? 'bg-green-500 text-white shadow-lg scale-110' : 'bg-slate-200 text-slate-500'}`}
                        >
                            {isNestingActive ? '✓' : '✏️'}
                        </button>
                        <button onClick={() => onRemove(cmd.id)} className="w-10 h-10 text-red-500 text-3xl font-black hover:scale-110 transition-transform">✕</button>
                    </div>
                </div>
                <div className={`border-l-8 border-purple-400 p-4 flex flex-col gap-4 min-h-[80px] ${isNestingActive ? 'bg-purple-50 dark:bg-purple-900/10' : 'bg-slate-50/50 dark:bg-slate-800/20'}`}>
                    {cmd.nested?.map(nc => renderCommand(nc, cmd.id))}
                    {(!cmd.nested || cmd.nested.length === 0) && (
                        <div className="py-6 text-center border-4 border-dashed border-purple-200 dark:border-purple-800 rounded-[2rem]">
                            <span className="text-[12px] font-black uppercase text-purple-300 tracking-[0.2em]">Drop blocks here!</span>
                        </div>
                    )}
                </div>
                <div className="h-8 border-b-8 border-l-8 border-purple-400 rounded-bl-[2.5rem] w-24" />
            </div>
        );
    }

    const colorStyle = () => {
        switch(cmd.type) {
            case CommandType.MOVE: return 'var(--clay-red)';
            case CommandType.TURN_LEFT: return 'var(--clay-green)';
            case CommandType.TURN_RIGHT: return 'var(--clay-yellow)';
            case CommandType.GO_TO: return 'var(--clay-orange)';
            case CommandType.GLIDE: return 'var(--clay-blue)';
            default: return 'var(--clay-blue)';
        }
    };

    return (
        <div 
          key={cmd.id} 
          className={`p-4 rounded-[1.8rem] flex items-center justify-between gap-4 transition-all border-4 animate-in slide-in-from-right duration-200 shadow-md ${isActive ? 'bg-white border-slate-800 scale-105 shadow-2xl z-20' : 'border-transparent text-white'}`}
          style={{ backgroundColor: isActive ? 'white' : colorStyle() }}
        >
            <div className="flex items-center gap-4 truncate">
                <span className="bg-black/10 w-12 h-12 flex items-center justify-center rounded-2xl text-2xl shrink-0 drop-shadow-sm">
                  {cmd.type === CommandType.MOVE ? '⬆️' : cmd.type.includes('LEFT') ? '⬅️' : cmd.type.includes('RIGHT') ? '➡️' : cmd.type === CommandType.GO_TO ? '📍' : '🚀'}
                </span>
                <span className={`text-sm md:text-base font-black uppercase tracking-widest truncate ${isActive ? 'text-slate-800' : 'text-white'}`}>{cmd.type.replace('_', ' ')}</span>
            </div>
            {!isRunning && <button onClick={() => onRemove(cmd.id, parentId)} className={`w-10 h-10 flex items-center justify-center font-black text-2xl transition-all hover:scale-125 ${isActive ? 'text-slate-400' : 'text-white/60'}`}>✕</button>}
        </div>
    );
  };

  return (
    <div className="h-full flex flex-col gap-6">
        <div className="flex justify-between items-center px-2">
            <h4 className="text-[12px] font-black uppercase text-slate-400 tracking-[0.3em]">Your Program</h4>
            <button onClick={onClear} className="text-[12px] font-black uppercase text-red-500 tracking-widest hover:underline transition-all active:scale-90">Clear All</button>
        </div>
        
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
            {program.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 px-8 border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] opacity-30">
                    <span className="text-8xl mb-6">🪄</span>
                    <span className="text-lg font-black uppercase tracking-[0.2em] text-center leading-tight">Pick a block<br/>to start!</span>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {program.map(cmd => renderCommand(cmd))}
                </div>
            )}
        </div>
    </div>
  );
};

export default ProgramQueue;
