
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { CommandType, Direction, Position, Command, Level } from './types';
import { LEVELS } from './constants';
import GameStage from './components/GameStage';
import CommandPalette from './components/CommandPalette';
import ProgramQueue from './components/ProgramQueue';

const App: React.FC = () => {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0); 
  const currentLevel = LEVELS[currentLevelIdx];

  const [botPos, setBotPos] = useState<Position>(currentLevel.startPos);
  const [botDir, setBotDir] = useState<Direction>(currentLevel.startDir);
  const [botRotation, setBotRotation] = useState<number>(0);
  const [program, setProgram] = useState<Command[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<string | null>(null);
  const [gameState, setGameState] = useState<'IDLE' | 'WON' | 'LOST' | 'RUNNING'>('IDLE');
  const [failureReason, setFailureReason] = useState<string>('');
  const [activeLoopId, setActiveLoopId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const abortController = useRef<boolean>(false);

  const dirToDegrees = (dir: Direction): number => {
    switch (dir) {
      case 'N': return 0;
      case 'E': return 90;
      case 'S': return 180;
      case 'W': return 270;
      default: return 0;
    }
  };

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  useEffect(() => {
    if (isDarkMode) document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
  }, [isDarkMode]);

  const resetStage = useCallback(() => {
    setBotPos(currentLevel.startPos);
    setBotDir(currentLevel.startDir);
    setBotRotation(dirToDegrees(currentLevel.startDir));
    setIsRunning(false);
    setIsLooping(false);
    setCurrentStepIndex(null);
    setGameState('IDLE');
    setFailureReason('');
    abortController.current = false;
  }, [currentLevel]);

  useEffect(() => {
    resetStage();
    setProgram([]);
    setActiveLoopId(null);
  }, [currentLevelIdx, resetStage]);

  const addCommand = (type: CommandType, x?: number, y?: number) => {
    if (gameState === 'RUNNING') return;
    const newId = Math.random().toString(36).substr(2, 9);
    const isContainer = type === CommandType.REPEAT;
    const newCmd: Command = {
      id: newId, type, x, y,
      count: type === CommandType.REPEAT ? 3 : undefined,
      nested: isContainer ? [] : undefined
    };

    if (activeLoopId && !isContainer) {
      setProgram(prev => prev.map(cmd => {
        if (cmd.id === activeLoopId) return { ...cmd, nested: [...(cmd.nested || []), newCmd] };
        return cmd;
      }));
    } else {
      setProgram(prev => [...prev, newCmd]);
      if (isContainer) setActiveLoopId(newId);
    }
    setGameState('IDLE');
  };

  const removeCommand = (id: string, parentId?: string) => {
    if (isRunning) return;
    if (parentId) {
      setProgram(prev => prev.map(cmd => {
        if (cmd.id === parentId) return { ...cmd, nested: (cmd.nested || []).filter(c => c.id !== id) };
        return cmd;
      }));
    } else {
      setProgram(prev => prev.filter(c => c.id !== id));
      if (id === activeLoopId) setActiveLoopId(null);
    }
  };

  const updateRepeatCount = (id: string, delta: number) => {
    setProgram(prev => prev.map(cmd => {
      if (cmd.id === id) {
        const newCount = Math.max(2, Math.min(9, (cmd.count || 2) + delta));
        return { ...cmd, count: newCount };
      }
      return cmd;
    }));
  };

  const runSingleCommand = async (cmd: Command, context: { pos: Position, dir: Direction, rot: number }) => {
    if (abortController.current) return false;
    setCurrentStepIndex(cmd.id);
    
    if (cmd.type === CommandType.REPEAT && cmd.nested) {
      setIsLooping(true);
      for (let i = 0; i < (cmd.count || 0); i++) {
        for (const nestedCmd of cmd.nested) {
            const success = await runSingleCommand(nestedCmd, context);
            if (!success) return false;
        }
      }
      setIsLooping(false);
      return true;
    }

    const delay = 600; 

    if (cmd.type === CommandType.MOVE) {
        let nextPos = { ...context.pos };
        if (context.dir === 'N') nextPos.y -= 1;
        else if (context.dir === 'S') nextPos.y += 1;
        else if (context.dir === 'E') nextPos.x += 1;
        else if (context.dir === 'W') nextPos.x -= 1;
        
        if (nextPos.x < 0 || nextPos.x >= currentLevel.gridSize || nextPos.y < 0 || nextPos.y >= currentLevel.gridSize) {
          setFailureReason('Out of bounds!'); setGameState('LOST'); return false;
        }
        if (currentLevel.obstacles.some(o => o.x === nextPos.x && o.y === nextPos.y)) {
          setBotPos(nextPos); setFailureReason('Wall hit!'); setGameState('LOST'); return false;
        }

        context.pos = nextPos;
        setBotPos(context.pos);
        await new Promise(r => setTimeout(r, delay));
    } else if (cmd.type === CommandType.TURN_LEFT || cmd.type === CommandType.TURN_RIGHT) {
        const dirs: Direction[] = cmd.type === CommandType.TURN_LEFT ? ['N', 'W', 'S', 'E'] : ['N', 'E', 'S', 'W'];
        context.dir = dirs[(dirs.indexOf(context.dir) + 1) % 4];
        context.rot += (cmd.type === CommandType.TURN_LEFT ? -90 : 90);
        setBotDir(context.dir);
        setBotRotation(context.rot);
        await new Promise(r => setTimeout(r, delay));
    } else if (cmd.type === CommandType.GO_TO || cmd.type === CommandType.GLIDE) {
        if (cmd.x !== undefined && cmd.y !== undefined) {
          context.pos = { x: cmd.x, y: cmd.y };
          setBotPos(context.pos);
          await new Promise(r => setTimeout(r, delay));
        }
    }
    return true;
  };

  const runProgram = async () => {
    if (program.length === 0 || isRunning) return;
    setIsRunning(true);
    setGameState('RUNNING');
    setFailureReason('');
    
    const context = { pos: { ...currentLevel.startPos }, dir: currentLevel.startDir, rot: dirToDegrees(currentLevel.startDir) };
    let success = true;
    for (const cmd of program) {
        if (abortController.current) break;
        success = await runSingleCommand(cmd, context);
        if (!success) break;
    }

    if (!abortController.current && success) {
      if (context.pos.x === currentLevel.goalPos.x && context.pos.y === currentLevel.goalPos.y) setGameState('WON');
      else { setFailureReason('Goal missed!'); setGameState('LOST'); }
    }
    setIsRunning(false);
    setCurrentStepIndex(null);
  };

  return (
    <div className="min-h-screen flex flex-col pb-20 bg-slate-50 dark:bg-slate-950 font-fredoka overflow-x-hidden">
      {/* Playful Header */}
      <header className="p-4 md:p-8 flex items-center justify-between max-w-[1200px] mx-auto w-full">
        <div className="flex flex-col">
            <h1 className="text-2xl md:text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none">ClayBot Studio</h1>
            <span className="text-[10px] md:text-xs font-bold text-blue-500 uppercase tracking-widest mt-1">Module {currentLevel.module}: {currentLevel.module === 1 ? 'Motion Adventure' : 'Loop Quest'}</span>
        </div>
        <button onClick={toggleTheme} className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center clay-card text-2xl shadow-lg" style={{ padding: 0 }}>
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </header>

      {/* MISSION CARD */}
      <section className="px-4 md:px-8 max-w-[1200px] mx-auto w-full mb-6">
          <div className="clay-card p-6 md:p-10 bg-yellow-400 dark:bg-yellow-500 border-yellow-300 dark:border-yellow-600 flex flex-col md:flex-row items-center gap-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                  <span className="text-9xl">🧩</span>
              </div>
              <div className="text-6xl md:text-7xl animate-bounce shrink-0 drop-shadow-lg">🔋</div>
              <div className="flex-1 text-center md:text-left z-10">
                  <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-slate-900/40 mb-2">Current Mission</h2>
                  <p className="text-xl md:text-3xl font-black text-slate-900 leading-tight">{currentLevel.message}</p>
              </div>
              <div className="bg-white/40 backdrop-blur-sm px-6 py-4 rounded-[2.5rem] border-4 border-white/20 flex flex-col items-center shrink-0 shadow-inner">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-900/60 mb-1">Battery at</span>
                  <span className="text-2xl font-black text-slate-900">{currentLevel.goalPos.x}, {currentLevel.goalPos.y}</span>
              </div>
          </div>
      </section>

      {/* MAIN LAYOUT */}
      <main className="px-4 md:px-8 max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          
          {/* STAGE & LEVEL SELECTOR */}
          <div className="flex flex-col gap-6">
              {/* THE GRID */}
              <div className="clay-card aspect-square w-full relative overflow-hidden bg-white dark:bg-slate-900 ring-8 ring-slate-200/50 dark:ring-slate-800/30">
                  <GameStage 
                      gridSize={currentLevel.gridSize} botPos={botPos} botRotation={botRotation} 
                      goalPos={currentLevel.goalPos} obstacles={currentLevel.obstacles} 
                      gameState={gameState} isLooping={isLooping} isDarkMode={isDarkMode}
                  />
                  
                  {/* Results Overlays */}
                  {gameState === 'WON' && (
                    <div className="absolute inset-0 bg-white/95 dark:bg-slate-950/95 flex flex-col items-center justify-center p-8 text-center z-[100] animate-in zoom-in duration-500">
                        <span className="text-9xl mb-4 animate-bounce">🏆</span>
                        <h2 className="text-4xl md:text-6xl font-black text-blue-500 uppercase mb-8 drop-shadow-sm">Amazing!</h2>
                        <button onClick={() => setCurrentLevelIdx(prev => Math.min(LEVELS.length-1, prev+1))} className="clay-btn clay-btn-black text-white px-10 md:px-14 py-5 md:py-6 rounded-full text-xl md:text-2xl font-black shadow-2xl">Next Mission ➔</button>
                    </div>
                  )}
                  {gameState === 'LOST' && (
                    <div className="absolute inset-0 bg-white/90 dark:bg-slate-950/90 flex flex-col items-center justify-center p-8 text-center z-[100] animate-in zoom-in duration-300">
                        <span className="text-8xl mb-4 grayscale">🏗️</span>
                        <h2 className="text-3xl md:text-5xl font-black text-red-500 uppercase mb-2">Try Again!</h2>
                        <p className="text-lg md:text-xl font-bold mb-8 text-slate-500">{failureReason}</p>
                        <button onClick={resetStage} className="clay-btn clay-btn-black text-white px-10 md:px-14 py-5 md:py-6 rounded-full text-xl md:text-2xl font-black shadow-2xl">Reset Bot ↺</button>
                    </div>
                  )}
              </div>

              {/* ACCESSIBLE LEVEL SELECTOR - Below Map */}
              <div className="clay-card p-6 md:p-8 bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700">
                  <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-400">Choose a Mission</h3>
                        <span className="text-[10px] font-bold text-slate-300">Level {currentLevelIdx + 1} of {LEVELS.length}</span>
                      </div>
                      <div className="grid grid-cols-5 md:grid-cols-10 gap-2 md:gap-3">
                        {LEVELS.map((l, i) => (
                            <button 
                                key={l.id} 
                                onClick={() => setCurrentLevelIdx(i)} 
                                className={`
                                    w-full aspect-square rounded-2xl md:rounded-3xl font-black text-sm md:text-lg flex items-center justify-center transition-all clay-btn
                                    ${currentLevelIdx === i ? 'clay-btn-purple text-white scale-110' : 'bg-white dark:bg-slate-700 text-slate-400 border-2 border-slate-200 dark:border-slate-600'}
                                `}
                            >
                                {l.id}
                            </button>
                        ))}
                      </div>
                  </div>
              </div>
          </div>

          {/* CONTROLS AREA */}
          <div className="flex flex-col gap-8 h-full">
              {/* Palette */}
              <div className="clay-card p-6 md:p-8">
                  <CommandPalette available={currentLevel.availableCommands} onAdd={addCommand} disabled={isRunning} activeLoopId={activeLoopId} gridSize={currentLevel.gridSize} />
              </div>

              {/* Program Queue */}
              <div className="clay-card p-6 md:p-8 flex-1 flex flex-col min-h-[500px] border-blue-100 dark:border-blue-900/30">
                  <ProgramQueue 
                      program={program} onRemove={removeCommand} onClear={() => setProgram([])} isRunning={isRunning} 
                      currentStepIndex={currentStepIndex} activeLoopId={activeLoopId} onSetActiveLoop={setActiveLoopId} 
                      onUpdateRepeatCount={updateRepeatCount} isDarkMode={isDarkMode}
                  />
                  
                  {/* BIG ACTION BUTTON */}
                  <div className="mt-8">
                      <button 
                        onClick={isRunning ? () => { abortController.current = true; resetStage(); } : runProgram} 
                        disabled={program.length === 0}
                        className={`w-full py-6 md:py-8 rounded-[3rem] font-black text-2xl md:text-4xl text-white uppercase shadow-2xl transition-all active:scale-95 ${isRunning ? 'clay-btn-red' : 'clay-btn-black dark:bg-blue-600 ring-8 ring-blue-500/10'}`}>
                        {isRunning ? 'Stop!' : 'Run Code!'}
                      </button>
                  </div>
              </div>
          </div>

      </main>
    </div>
  );
};

export default App;
