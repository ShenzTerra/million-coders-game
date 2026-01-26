
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
}

const ProgramQueue: React.FC<ProgramQueueProps> = ({ 
  program, onRemove, onClear, isRunning, currentStepIndex, activeLoopId, onSetActiveLoop, onUpdateRepeatCount 
}) => {

  const renderCommand = (cmd: Command, parentId?: string) => {
    const isActive = currentStepIndex === cmd.id;
    const isNestingActive = activeLoopId === cmd.id;
    const isLoop = cmd.type === CommandType.REPEAT;

    if (isLoop) {
        return (
            <div key={cmd.id} className="w-full mb-6 flex flex-col animate-in slide-in-from-right duration-300">
                <div className={`p-5 rounded-t-[2.5rem] border-t-4 border-x-4 border-purple-400 flex items-center justify-between transition-colors ${isNestingActive ? 'bg-purple-900/40 shadow-inner' : 'bg-slate-800'}`}>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl drop-shadow-md">🔁</span>
                        <div className="flex items-center gap-2 bg-black/30 rounded-full px-2 py-1 shadow-inner">
                            <button onClick={(e) => {e.stopPropagation(); onUpdateRepeatCount(cmd.id, -1)}} className="w-8 h-8 rounded-full bg-slate-700 font-black text-xl flex items-center justify-center active:scale-75 text-white">-</button>
                            <span className="text-2xl font-black min-w-[25px] text-center text-purple-300">{cmd.count}</span>
                            <button onClick={(e) => {e.stopPropagation(); onUpdateRepeatCount(cmd.id, 1)}} className="w-8 h-8 rounded-full bg-purple-500 text-white font-black text-xl flex items-center justify-center active:scale-75">+</button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => onSetActiveLoop(isNestingActive ? null : cmd.id)} 
                            className={`w-12 h-12 rounded-2xl font-bold flex items-center justify-center transition-all ${isNestingActive ? 'bg-green-500 text-white shadow-lg scale-110' : 'bg-slate-700 text-slate-400'}`}
                        >
                            {isNestingActive ? '✓' : '✏️'}
                        </button>
                        <button onClick={() => onRemove(cmd.id)} className="w-10 h-10 text-red-400 text-3xl font-black">✕</button>
                    </div>
                </div>
                <div className={`border-l-8 border-purple-400 p-4 flex flex-col gap-4 min-h-[80px] transition-colors ${isNestingActive ? 'bg-purple-900/20' : 'bg-slate-800/40'}`}>
                    {cmd.nested?.map(nc => renderCommand(nc, cmd.id))}
                    {(!cmd.nested || cmd.nested.length === 0) && (
                        <div className="py-8 text-center border-4 border-dashed border-purple-900/30 rounded-[2.5rem]">
                            <span className="text-label text-purple-700">Empty Loop!</span>
                        </div>
                    )}
                </div>
                <div className="h-8 border-b-8 border-l-8 border-purple-400 rounded-bl-[2.5rem] w-24" />
            </div>
        );
    }

    const colorStyle = () => {
        switch(cmd.type) {
            case CommandType.MOVE: return '#FF7B7B';
            case CommandType.TURN_LEFT: return '#81C784';
            case CommandType.TURN_RIGHT: return '#FFD54F';
            case CommandType.GO_TO: return '#FFB74D';
            case CommandType.GLIDE: return '#64B5F6';
            default: return '#64B5F6';
        }
    };

    return (
        <div 
          key={cmd.id} 
          className={`p-4 rounded-[2rem] flex items-center justify-between gap-4 transition-all border-4 animate-in slide-in-from-right duration-200 shadow-lg ${isActive ? 'bg-white border-blue-400 scale-105 shadow-[0_0_30px_rgba(100,181,246,0.3)] z-20' : 'border-transparent text-white'}`}
          style={{ backgroundColor: isActive ? 'white' : colorStyle() }}
        >
            <div className="flex items-center gap-4 truncate">
                <span className="bg-black/10 w-14 h-14 flex items-center justify-center rounded-2xl text-2xl shrink-0 drop-shadow-md">
                  {cmd.type === CommandType.MOVE ? '⬆️' : cmd.type.includes('LEFT') ? '⬅️' : cmd.type.includes('RIGHT') ? '➡️' : cmd.type === CommandType.GO_TO ? '📍' : '🚀'}
                </span>
                <span className={`text-base md:text-lg font-black uppercase tracking-widest truncate ${isActive ? 'text-slate-900' : (cmd.type === CommandType.TURN_RIGHT ? 'text-slate-800' : 'text-white')}`}>{cmd.type.replace('_', ' ')}</span>
            </div>
            {!isRunning && <button onClick={() => onRemove(cmd.id, parentId)} className={`w-12 h-12 flex items-center justify-center font-black text-2xl transition-all active:scale-125 ${isActive ? 'text-slate-300' : 'text-white/50'}`}>✕</button>}
        </div>
    );
  };

  return (
    <div className="h-full flex flex-col gap-6">
        <div className="flex justify-between items-center px-1">
            <h4 className="text-label text-slate-500">My Code</h4>
            <button onClick={onClear} className="text-label text-red-400 hover:text-red-300">Clear All</button>
        </div>
        
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1 min-h-[150px]">
            {program.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 px-8 border-4 border-dashed border-slate-700/30 rounded-[3.5rem] opacity-30">
                    <span className="text-8xl mb-6">🖍️</span>
                    <span className="text-base font-black uppercase tracking-widest text-center leading-tight">Pick some blocks<br/>to start!</span>
                </div>
            ) : (
                <div className="flex flex-col gap-4 pb-4">
                    {program.map(cmd => renderCommand(cmd))}
                </div>
            )}
        </div>
    </div>
  );
};

export default ProgramQueue;
