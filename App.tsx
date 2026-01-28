
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { CommandType, Direction, Position, Command, Level } from './types';
import { LEVELS } from './constants';
import GameStage from './components/GameStage';
import CommandPalette from './components/CommandPalette';
import ProgramQueue from './components/ProgramQueue';
import { MillionCodersFullLogo } from './components/Logo';

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
    <div className="flex flex-col h-screen w-screen bg-slate-950 font-fredoka overflow-hidden">
      {/* HEADER: Adjusted height to h-20 for the text-only logo */}
      <header className="h-20 px-6 flex items-center justify-between border-b border-slate-800 shadow-lg shrink-0 z-50 bg-slate-950/50 backdrop-blur-md">
        <div className="shrink-0 scale-90 md:scale-100">
          <MillionCodersFullLogo />
        </div>
        
        {/* Bold and visible Objective Centerpiece */}
        <div className="flex flex-col items-center bg-blue-500/10 px-8 py-2 rounded-2xl border border-blue-500/30">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-0.5 opacity-80">Mission Objective</span>
            <span className="text-lg md:text-xl font-black text-white tracking-tight text-center drop-shadow-sm">{currentLevel.message}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700 shadow-sm shrink-0">
              <span className="text-yellow-400 font-black text-xs uppercase tracking-widest">Level {currentLevel.id}</span>
          </div>
        </div>
      </header>

      {/* MAIN DASHBOARD */}
      <main className="flex-1 flex overflow-hidden p-4 gap-4">
        
        {/* LEFT COLUMN: My Code Editor */}
        <section className="w-[300px] lg:w-[380px] flex flex-col gap-4 shrink-0 h-full overflow-hidden">
          <div className="clay-card flex-1 flex flex-col p-6 overflow-hidden shadow-2xl bg-slate-900/40 border-slate-700">
            <ProgramQueue 
                program={program} onRemove={removeCommand} onClear={() => setProgram([])} isRunning={isRunning} 
                currentStepIndex={currentStepIndex} activeLoopId={activeLoopId} onSetActiveLoop={setActiveLoopId} 
                onUpdateRepeatCount={updateRepeatCount}
            />
            
            <div className="mt-4 shrink-0">
                <button 
                  onClick={isRunning ? () => { abortController.current = true; resetStage(); } : runProgram} 
                  disabled={program.length === 0}
                  className={`w-full py-5 rounded-[2rem] font-black text-3xl text-white uppercase shadow-lg transition-all active:scale-95 ${isRunning ? 'clay-btn-red' : 'clay-btn-black bg-blue-500 ring-8 ring-blue-500/10'}`}>
                  {isRunning ? 'Stop' : 'Go!'}
                </button>
            </div>
          </div>
        </section>

        {/* CENTER AREA: Game Map */}
        <section className="flex-1 flex flex-col overflow-hidden h-full">
          <div className="flex-1 clay-card relative overflow-hidden bg-slate-900 ring-2 ring-slate-800/20 shadow-2xl border-slate-700">
              <GameStage 
                  gridSize={currentLevel.gridSize} botPos={botPos} botRotation={botRotation} 
                  goalPos={currentLevel.goalPos} obstacles={currentLevel.obstacles} 
                  gameState={gameState} isLooping={isLooping}
              />
              
              {/* Overlays */}
              {gameState === 'WON' && (
                <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-8 text-center z-[100] animate-in zoom-in duration-500">
                    <span className="text-8xl mb-4 animate-bounce">🏆</span>
                    <h2 className="text-5xl font-black text-green-400 uppercase tracking-tighter">Awesome!</h2>
                    <button onClick={() => setCurrentLevelIdx(prev => Math.min(LEVELS.length-1, prev+1))} className="clay-btn clay-btn-blue px-12 py-5 rounded-full text-2xl font-black shadow-2xl mt-8">Next ➔</button>
                </div>
              )}
              {gameState === 'LOST' && (
                <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-8 text-center z-[100] animate-in zoom-in duration-300">
                    <span className="text-7xl mb-4 grayscale">🚀</span>
                    <h2 className="text-4xl font-black text-red-400 uppercase tracking-tighter">Try Again</h2>
                    <p className="text-lg font-bold mb-8 text-slate-400">{failureReason}</p>
                    <button onClick={resetStage} className="clay-btn clay-btn-black text-white px-12 py-5 rounded-full text-2xl font-black shadow-2xl">Reset ↺</button>
                </div>
              )}
          </div>
        </section>

        {/* RIGHT COLUMN: Block Chest */}
        <section className="w-[280px] lg:w-[350px] flex flex-col gap-4 shrink-0 h-full overflow-hidden">
          <div className="clay-card flex-1 p-6 bg-slate-900/30 overflow-hidden flex flex-col shadow-xl border-slate-700">
              <CommandPalette available={currentLevel.availableCommands} onAdd={addCommand} disabled={isRunning} activeLoopId={activeLoopId} gridSize={currentLevel.gridSize} />
          </div>
        </section>
      </main>

      {/* FOOTER: Level Navigator */}
      <footer className="h-16 px-6 bg-slate-900/90 border-t border-slate-800 shrink-0 flex items-center justify-center gap-6">
          <h3 className="text-label text-slate-500 whitespace-nowrap">Jump to level:</h3>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-2">
            {LEVELS.slice(0, 10).map((l, i) => (
                <button 
                    key={l.id} 
                    onClick={() => setCurrentLevelIdx(i)} 
                    className={`
                        w-11 h-11 rounded-xl font-black text-xl flex items-center justify-center transition-all clay-btn shrink-0
                        ${currentLevelIdx === i ? 'clay-btn-purple scale-110 shadow-[0_0_20px_rgba(179,157,219,0.4)] ring-2 ring-white/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}
                    `}
                >
                    {l.id}
                </button>
            ))}
          </div>
      </footer>
    </div>
  );
};

export default App;
