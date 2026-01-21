
import React from 'react';
import { Command, CommandType } from '../types';

interface ProgramQueueProps {
  program: Command[];
  onRemove: (id: string, parentId?: string) => void;
  onClear: () => void;
  onRun: () => void;
  onStop: () => void;
  onReset: () => void;
  isRunning: boolean;
  currentStepIndex: string | null;
  activeLoopId: string | null;
  onSetActiveLoop: (id: string | null) => void;
  onUpdateRepeatCount: (id: string, delta: number) => void;
  isDarkMode?: boolean;
}

const ProgramQueue: React.FC<ProgramQueueProps> = ({ 
  program, onRemove, onClear, onRun, onStop, onReset, isRunning, currentStepIndex, activeLoopId, onSetActiveLoop, onUpdateRepeatCount, isDarkMode 
}) => {

  const renderCommand = (cmd: Command, parentId?: string) => {
    const isActive = currentStepIndex === cmd.id;
    const isLoopActive = activeLoopId === cmd.id;
    
    if (cmd.type === CommandType.REPEAT) {
      return (
        <div key={cmd.id} className="flex flex-col mb-4 w-full relative">
          {/* Header */}
          <div 
            className={`
              relative z-20 p-4 rounded-t-[2rem] rounded-br-[1.5rem] border-t-4 border-x-4 flex items-center justify-between transition-all duration-300
              ${isLoopActive ? (isDarkMode ? 'bg-purple-900/30 border-purple-500' : 'bg-purple-100 border-purple-400 shadow-sm') : (isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200')}
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${isLoopActive ? 'bg-purple-500 text-white' : (isDarkMode ? 'bg-slate-700 text-slate-500' : 'bg-slate-200 text-slate-400')}`}>🔁</div>
              <div className="flex items-center gap-1 bg-black/5 dark:bg-black/20 p-1 rounded-full">
                <button 
                  disabled={isRunning}
                  onClick={(e) => { e.stopPropagation(); onUpdateRepeatCount(cmd.id, -1); }} 
                  className="w-6 h-6 bg-white dark:bg-slate-700 rounded-full font-black text-slate-500 text-xs"
                >-</button>
                <span className={`text-base font-black min-w-[20px] text-center ${isLoopActive ? 'text-purple-600' : 'text-slate-500'}`}>{cmd.count}</span>
                <button 
                  disabled={isRunning}
                  onClick={(e) => { e.stopPropagation(); onUpdateRepeatCount(cmd.id, 1); }} 
                  className="w-6 h-6 bg-purple-500 rounded-full font-black text-white text-xs"
                >+</button>
              </div>
            </div>
            
            {!isRunning && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onSetActiveLoop(isLoopActive ? null : cmd.id)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${isLoopActive ? 'bg-green-400 text-white scale-110 shadow-md' : (isDarkMode ? 'bg-slate-700 text-slate-500' : 'bg-slate-200 text-slate-400')}`}
                >
                  {isLoopActive ? '✓' : '✏️'}
                </button>
                <button onClick={() => onRemove(cmd.id)} className="text-red-400 hover:text-red-600 font-bold ml-1">✕</button>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="flex w-full">
            <div 
              className={`w-[40px] flex-shrink-0 border-l-[12px] transition-all duration-300 ${isLoopActive ? 'border-purple-500 bg-purple-500/5' : 'border-slate-200 dark:border-slate-700 bg-slate-500/5'}`}
            />
            <div className={`flex-1 py-3 pr-3 flex flex-col gap-3 transition-all ${isLoopActive ? 'bg-purple-500/5' : 'bg-slate-500/5'}`}>
              {cmd.nested && cmd.nested.length > 0 ? (
                cmd.nested.map(nc => renderCommand(nc, cmd.id))
              ) : (
                <div className="py-2 text-center text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest italic pr-4">Empty</div>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div 
            className={`
              h-8 w-[100px] border-l-[12px] border-b-[12px] rounded-bl-[2rem] transition-all duration-300
              ${isLoopActive ? 'border-purple-500' : 'border-slate-200 dark:border-slate-700'}
            `}
          />
        </div>
      );
    }

    const getColorClass = (type: CommandType) => {
        switch (type) {
            case CommandType.MOVE: return 'bg-red-500';
            case CommandType.TURN_LEFT: return 'bg-green-500';
            case CommandType.TURN_RIGHT: return 'bg-yellow-400';
            case CommandType.GO_TO: return 'bg-blue-400';
            case CommandType.GLIDE: return 'bg-blue-500';
            default: return 'bg-blue-500';
        }
    };

    return (
      <div key={cmd.id} className="relative w-full flex justify-center z-30">
        <div 
          className={`
            p-4 rounded-[1.5rem] flex items-center gap-4 transition-all duration-300 border-4 w-full
            ${isActive ? 'bg-white dark:bg-slate-100 text-slate-800 border-slate-800 scale-105 shadow-lg' : `${getColorClass(cmd.type)} text-white border-transparent shadow-sm`}
          `}
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg bg-black/10 flex-shrink-0`}>
            {cmd.type === CommandType.MOVE ? '⬆️' : cmd.type.includes('LEFT') ? '⬅️' : cmd.type.includes('RIGHT') ? '➡️' : cmd.type === CommandType.GO_TO ? '📍' : '🚀'}
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            <span className="font-black text-[10px] uppercase tracking-widest truncate">{cmd.type.replace('_', ' ')}</span>
          </div>
          {!isRunning && (
            <button 
                onClick={(e) => { e.stopPropagation(); onRemove(cmd.id, parentId); }} 
                className="text-white/50 hover:text-white font-bold"
            >✕</button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      <div className="flex justify-between items-center px-4 flex-shrink-0">
          <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Code</h3>
          <button onClick={onClear} disabled={isRunning} className="text-red-400 text-[10px] font-black uppercase tracking-widest">Clear</button>
      </div>

      <div className="flex-1 bg-slate-50/50 dark:bg-slate-900/20 rounded-[3rem] p-5 overflow-y-auto border-4 border-dashed border-slate-100 dark:border-slate-800 custom-scrollbar min-h-0">
        {program.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 gap-4">
            <span className="text-6xl">🧩</span>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full min-h-full">
            {program.map(cmd => renderCommand(cmd))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 flex-shrink-0">
        <button 
          onClick={isRunning ? onStop : onRun} 
          disabled={program.length === 0}
          className={`clay-btn ${isRunning ? 'clay-btn-red' : 'clay-btn-black'} py-4 rounded-[2rem] font-black text-xl text-white uppercase transition-all flex items-center justify-center gap-3`}
        >
          {isRunning ? 'Stop' : 'Go!'}
        </button>
      </div>
    </div>
  );
};

export default ProgramQueue;
