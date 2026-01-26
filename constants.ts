
import { Level, CommandType } from './types';

export const LEVELS: Level[] = [
  // Module 1: Basic Motion & Coordinates
  {
    id: 1, module: 1, gridSize: 5, title: "Forward Motion", message: "Help the bot reach the battery! Try moving forward.",
    startPos: { x: 0, y: 2 }, startDir: 'E', goalPos: { x: 4, y: 2 }, obstacles: [],
    availableCommands: [CommandType.MOVE, CommandType.TURN_LEFT, CommandType.TURN_RIGHT]
  },
  {
    id: 2, module: 1, gridSize: 5, title: "Turning Corners", message: "You'll need to turn to reach this one!",
    startPos: { x: 1, y: 3 }, startDir: 'E', goalPos: { x: 3, y: 1 }, obstacles: [{ x: 3, y: 3 }, { x: 1, y: 1 }],
    availableCommands: [CommandType.MOVE, CommandType.TURN_LEFT, CommandType.TURN_RIGHT]
  },
  {
    id: 3, module: 1, gridSize: 5, title: "Obstacle Course", message: "Watch out for walls! Navigate the maze.",
    startPos: { x: 0, y: 4 }, startDir: 'N', goalPos: { x: 4, y: 0 },
    obstacles: [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 1 }, { x: 2, y: 0 }, { x: 4, y: 2 }],
    availableCommands: [CommandType.MOVE, CommandType.TURN_LEFT, CommandType.TURN_RIGHT]
  },
  {
    id: 4, module: 1, gridSize: 6, title: "Coordinates", message: "Use 'Go To' to jump to specific points!",
    startPos: { x: 0, y: 0 }, startDir: 'E', goalPos: { x: 5, y: 5 }, obstacles: [],
    availableCommands: [CommandType.MOVE, CommandType.TURN_LEFT, CommandType.TURN_RIGHT, CommandType.GO_TO]
  },
  {
    id: 5, module: 1, gridSize: 5, title: "Master Task", message: "Task: Visit all 4 corners and the center!",
    startPos: { x: 2, y: 2 }, startDir: 'N', goalPos: { x: 2, y: 2 }, obstacles: [],
    availableCommands: [CommandType.GO_TO, CommandType.GLIDE], isSpecialTask: true
  },
  // Module 2: Loops
  {
    id: 6, module: 2, gridSize: 8, title: "The Long Dash", message: "Use the REPEAT block to move many times.",
    startPos: { x: 0, y: 4 }, startDir: 'E', goalPos: { x: 7, y: 4 }, obstacles: [],
    availableCommands: [CommandType.MOVE, CommandType.REPEAT]
  },
  {
    id: 7, module: 2, gridSize: 6, title: "The Square Pattern", message: "Repeat 'Move' and 'Turn' 4 times to walk in a square!",
    startPos: { x: 1, y: 1 }, startDir: 'E', goalPos: { x: 1, y: 1 }, obstacles: [{ x: 3, y: 3 }],
    availableCommands: [CommandType.MOVE, CommandType.TURN_RIGHT, CommandType.REPEAT], isSpecialTask: true 
  },
  {
    id: 8, module: 2, gridSize: 6, title: "Staircase", message: "Can you repeat a pattern to reach the top?",
    startPos: { x: 0, y: 5 }, startDir: 'N', goalPos: { x: 5, y: 0 },
    obstacles: [{x: 1, y: 5}, {x: 1, y: 3}, {x: 3, y: 3}, {x: 3, y: 1}, {x: 5, y: 1}],
    availableCommands: [CommandType.MOVE, CommandType.TURN_LEFT, CommandType.TURN_RIGHT, CommandType.REPEAT]
  },
  {
    id: 9, module: 2, gridSize: 8, title: "Loop Maze", message: "Use loops to navigate through the corridor.",
    startPos: { x: 1, y: 1 }, startDir: 'E', goalPos: { x: 6, y: 6 },
    obstacles: [{x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 2}, {x: 4, y: 2}, {x: 5, y: 2}, {x: 7, y: 5}, {x: 6, y: 5}],
    availableCommands: [CommandType.MOVE, CommandType.TURN_LEFT, CommandType.TURN_RIGHT, CommandType.REPEAT]
  },
  {
    id: 10, module: 2, gridSize: 5, title: "Loop Master", message: "Visit every corner using only 3 code blocks.",
    startPos: { x: 0, y: 0 }, startDir: 'E', goalPos: { x: 0, y: 0 }, obstacles: [],
    availableCommands: [CommandType.MOVE, CommandType.TURN_RIGHT, CommandType.REPEAT], isSpecialTask: true
  }
];
