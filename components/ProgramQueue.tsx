
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
            <div key={cmd.id} className="w-full mb-4 flex flex-col animate-in slide-in-from-right duration-300">
                <div className={`p-4 rounded-t-2xl border-t-2 border-x-2 border-purple-400 flex items-center justify-between transition-colors ${isNestingActive ? 'bg-purple-900/40 shadow-inner' : 'bg-slate-800'}`}>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl drop-shadow-md">🔁</span>
                        <div className="flex items-center gap-1.5 bg-black/30 rounded-full px-2 py-1 shadow-inner">
                            <button onClick={(e) => {e.stopPropagation(); onUpdateRepeatCount(cmd.id, -1)}} className="w-7 h-7 rounded-full bg-slate-700 font-black text-sm flex items-center justify-center active:scale-75 text-white">-</button>
                            <span className="text-lg font-black min-w-[20px] text-center text-purple-300">{cmd.count}</span>
                            <button onClick={(e) => {e.stopPropagation(); onUpdateRepeatCount(cmd.id, 1)}} className="w-7 h-7 rounded-full bg-purple-500 text-white font-black text-sm flex items-center justify-center active:scale-75">+</button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => onSetActiveLoop(isNestingActive ? null : cmd.id)} 
                            className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center transition-all ${isNestingActive ? 'bg-green-500 text-white shadow-lg' : 'bg-slate-700 text-slate-500'}`}
                        >
                            {isNestingActive ? '✓' : '✏️'}
                        </button>
                        {!isRunning && <button onClick={() => onRemove(cmd.id)} className="w-8 h-8 text-red-400 text-2xl font-black">✕</button>}
                    </div>
                </div>
                <div className={`border-l-4 border-purple-400 p-2.5 flex flex-col gap-2.5 min-h-[60px] transition-colors ${isNestingActive ? 'bg-purple-900/20' : 'bg-slate-800/40'}`}>
                    {cmd.nested?.map(nc => renderCommand(nc, cmd.id))}
                    {(!cmd.nested || cmd.nested.length === 0) && (
                        <div className="py-6 text-center border-2 border-dashed border-purple-900/30 rounded-2xl">
                            <span className="text-label text-purple-700">Empty Loop</span>
                        </div>
                    )}
                </div>
                <div className="h-5 border-b-4 border-l-4 border-purple-400 rounded-bl-2xl w-14" />
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
          className={`p-3 rounded-2xl flex items-center justify-between gap-3 transition-all border-2 animate-in slide-in-from-right duration-200 shadow-md ${isActive ? 'bg-white border-blue-400 scale-105 shadow-[0_0_25px_rgba(100,181,246,0.3)] z-20' : 'border-transparent text-white'}`}
          style={{ backgroundColor: isActive ? 'white' : colorStyle() }}
        >
            <div className="flex items-center gap-3 truncate">
                <span className="bg-black/10 w-11 h-11 flex items-center justify-center rounded-xl text-2xl shrink-0 drop-shadow-md">
                  {cmd.type === CommandType.MOVE ? '⬆️' : cmd.type.includes('LEFT') ? '⬅️' : cmd.type.includes('RIGHT') ? '➡️' : cmd.type === CommandType.GO_TO ? '📍' : '🚀'}
                </span>
                <span className={`text-sm font-black uppercase tracking-widest truncate ${isActive ? 'text-slate-900' : (cmd.type === CommandType.TURN_RIGHT ? 'text-slate-800' : 'text-white')}`}>{cmd.type.replace('_', ' ')}</span>
            </div>
            {!isRunning && <button onClick={() => onRemove(cmd.id, parentId)} className={`w-9 h-9 flex items-center justify-center font-black text-2xl transition-all active:scale-125 ${isActive ? 'text-slate-300' : 'text-white/50'}`}>✕</button>}
        </div>
    );
  };

  return (
    <div className="h-full flex flex-col gap-5">
        <div className="flex justify-between items-center px-1">
            <h4 className="text-label text-slate-500">My Code</h4>
            {!isRunning && <button onClick={onClear} className="text-label text-red-400 hover:text-red-300">Clear All</button>}
        </div>
        
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2 min-h-0">
            {program.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-16 px-8 border-2 border-dashed border-slate-700/30 rounded-[2.5rem] opacity-30">
                    <span className="text-7xl mb-6">🖍️</span>
                    <span className="text-sm font-black uppercase tracking-widest text-center leading-tight">Drag blocks here<br/>to build!</span>
                </div>
            ) : (
                <div className="flex flex-col gap-2.5 pb-6">
                    {program.map(cmd => renderCommand(cmd))}
                </div>
            )}
        </div>
    </div>
  );
};

export default ProgramQueue;
