
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { CommandType, Direction, Position, Command, Level } from './types';
import { LEVELS } from './constants';
import GameStage from './components/GameStage';
import CommandPalette from './components/CommandPalette';
import ProgramQueue from './components/ProgramQueue';

const App: React.FC = () => {
  // Module 2 starts at index 5 (Level 6)
  const [currentLevelIdx, setCurrentLevelIdx] = useState(5); 
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

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
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
    const isCoordCommand = type === CommandType.GO_TO || type === CommandType.GLIDE;
    
    const newCmd: Command = {
      id: newId,
      type,
      x: isCoordCommand ? x : undefined,
      y: isCoordCommand ? y : undefined,
      count: type === CommandType.REPEAT ? 3 : undefined,
      nested: type === CommandType.REPEAT ? [] : undefined
    };

    if (activeLoopId && type !== CommandType.REPEAT) {
      setProgram(prev => prev.map(cmd => {
        if (cmd.id === activeLoopId) {
          return { ...cmd, nested: [...(cmd.nested || []), newCmd] };
        }
        return cmd;
      }));
    } else {
      setProgram(prev => [...prev, newCmd]);
      if (type === CommandType.REPEAT) setActiveLoopId(newId);
    }
    setGameState('IDLE');
  };

  const removeCommand = (id: string, parentId?: string) => {
    if (isRunning) return;
    if (parentId) {
      setProgram(prev => prev.map(cmd => {
        if (cmd.id === parentId) {
          return { ...cmd, nested: (cmd.nested || []).filter(c => c.id !== id) };
        }
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

    const delay = 800; 

    if (cmd.type === CommandType.MOVE) {
        let nextPos = { ...context.pos };
        if (context.dir === 'N') nextPos.y -= 1;
        else if (context.dir === 'S') nextPos.y += 1;
        else if (context.dir === 'E') nextPos.x += 1;
        else if (context.dir === 'W') nextPos.x -= 1;
        
        if (nextPos.x < 0 || nextPos.x >= currentLevel.gridSize || nextPos.y < 0 || nextPos.y >= currentLevel.gridSize) {
          setFailureReason('Oops! You went off the grid!');
          setGameState('LOST');
          return false;
        }

        if (currentLevel.obstacles.some(o => o.x === nextPos.x && o.y === nextPos.y)) {
          setBotPos(nextPos);
          setFailureReason('Oops! You hit a wall!');
          setGameState('LOST');
          return false;
        }

        context.pos = nextPos;
        setBotPos(context.pos);
        await new Promise(resolve => setTimeout(resolve, delay));
    } else if (cmd.type === CommandType.TURN_LEFT) {
        const dirs: Direction[] = ['N', 'W', 'S', 'E'];
        context.dir = dirs[(dirs.indexOf(context.dir) + 1) % 4];
        context.rot -= 90;
        setBotDir(context.dir);
        setBotRotation(context.rot);
        await new Promise(resolve => setTimeout(resolve, delay));
    } else if (cmd.type === CommandType.TURN_RIGHT) {
        const dirs: Direction[] = ['N', 'E', 'S', 'W'];
        context.dir = dirs[(dirs.indexOf(context.dir) + 1) % 4];
        context.rot += 90;
        setBotDir(context.dir);
        setBotRotation(context.rot);
        await new Promise(resolve => setTimeout(resolve, delay));
    } else if (cmd.type === CommandType.GO_TO || cmd.type === CommandType.GLIDE) {
        if (cmd.x !== undefined && cmd.y !== undefined) {
          if (currentLevel.obstacles.some(o => o.x === cmd.x && o.y === cmd.y)) {
            setBotPos({ x: cmd.x, y: cmd.y });
            setFailureReason('Jump failed! You landed on a wall.');
            setGameState('LOST');
            return false;
          }
          context.pos = { x: cmd.x, y: cmd.y };
          setBotPos(context.pos);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    return true;
  };

  const runProgram = async () => {
    if (program.length === 0 || isRunning) return;
    setIsRunning(true);
    setGameState('RUNNING');
    setFailureReason('');
    setActiveLoopId(null);

    const context = {
        pos: { ...currentLevel.startPos },
        dir: currentLevel.startDir,
        rot: dirToDegrees(currentLevel.startDir),
    };

    let allSuccessful = true;
    for (const cmd of program) {
        if (abortController.current) break;
        const success = await runSingleCommand(cmd, context);
        if (!success) {
            allSuccessful = false;
            break;
        }
    }

    if (!abortController.current && allSuccessful) {
      if (context.pos.x === currentLevel.goalPos.x && context.pos.y === currentLevel.goalPos.y) {
        setGameState('WON');
      } else {
        setFailureReason('Almost! You missed the goal.');
        setGameState('LOST');
      }
    }
    
    setIsRunning(false);
    setIsLooping(false);
    setCurrentStepIndex(null);
  };

  return (
    <div className="h-screen flex flex-col p-4 md:p-8 overflow-hidden">
      <header className="mb-4 flex items-center justify-between max-w-[1600px] mx-auto w-full">
        <div className="w-12 h-12"></div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3" style={{ color: 'var(--clay-text)' }}>
            ClayBot Studio <span className="text-xs md:text-sm bg-purple-500 text-white px-3 py-1 rounded-full font-black uppercase tracking-widest">Module 2: Loop Quest</span>
        </h1>
        <button 
          onClick={toggleTheme}
          className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all clay-card"
          style={{ padding: 0 }}
        >
          <span className="text-2xl">{isDarkMode ? '☀️' : '🌙'}</span>
        </button>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[380px_1fr_350px] gap-8 max-w-[1600px] mx-auto w-full min-h-0">
        <div className="clay-card p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            <CommandPalette 
              available={currentLevel.availableCommands} 
              onAdd={addCommand} 
              disabled={isRunning} 
              activeLoopId={activeLoopId}
              gridSize={currentLevel.gridSize}
            />
            <div className="mt-auto bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Teacher's Note</h4>
                <p className="text-sm text-slate-500 leading-snug">{currentLevel.message}</p>
            </div>
        </div>

        <div className="clay-card overflow-hidden relative group">
          <GameStage 
            gridSize={currentLevel.gridSize}
            botPos={botPos} 
            botRotation={botRotation}
            goalPos={currentLevel.goalPos} 
            obstacles={currentLevel.obstacles} 
            gameState={gameState}
            isLooping={isLooping}
            isDarkMode={isDarkMode}
          />
          
          {gameState === 'WON' && (
            <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in zoom-in duration-500">
                <span className="text-8xl mb-4">🏆</span>
                <h2 className="text-4xl font-black uppercase mb-8" style={{ color: 'var(--clay-text)' }}>Loop Master!</h2>
                <button 
                  onClick={() => setCurrentLevelIdx(prev => Math.min(LEVELS.length-1, prev+1))}
                  className="clay-btn clay-btn-black text-white px-12 py-5 rounded-[2rem] text-2xl font-black"
                >
                  Next Level ➔
                </button>
            </div>
          )}

          {gameState === 'LOST' && (
            <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in zoom-in duration-300">
                <span className="text-8xl mb-4">🧩</span>
                <h2 className="text-4xl font-black uppercase mb-2" style={{ color: 'var(--clay-text)' }}>Try Again!</h2>
                <p className="text-xl font-bold text-red-500 mb-8">{failureReason}</p>
                <button 
                  onClick={resetStage}
                  className="clay-btn clay-btn-black text-white px-12 py-5 rounded-[2rem] text-2xl font-black"
                >
                  Reset Stage ↺
                </button>
            </div>
          )}
        </div>

        <div className="clay-card p-8 flex flex-col gap-6 min-h-0">
            <ProgramQueue 
              program={program} 
              onRemove={removeCommand} 
              onClear={() => { setProgram([]); setActiveLoopId(null); }} 
              onRun={runProgram} 
              onStop={() => { abortController.current = true; resetStage(); }}
              onReset={resetStage}
              isRunning={isRunning} 
              currentStepIndex={currentStepIndex}
              activeLoopId={activeLoopId}
              onSetActiveLoop={setActiveLoopId}
              onUpdateRepeatCount={updateRepeatCount}
              isDarkMode={isDarkMode}
            />
        </div>
      </main>

      <footer className="mt-4 pb-4 flex justify-center gap-4 flex-wrap">
        {LEVELS.map((l, i) => (
          <button 
            key={l.id} 
            onClick={() => setCurrentLevelIdx(i)}
            className={`w-10 h-10 rounded-xl font-black transition-all ${currentLevelIdx === i ? 'bg-purple-500 text-white scale-110 shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-300 hover:text-slate-500'}`}
          >
            {l.id}
          </button>
        ))}
      </footer>
    </div>
  );
};

export default App;
