
export enum CommandType {
  MOVE = 'MOVE',
  TURN_LEFT = 'TURN_LEFT',
  TURN_RIGHT = 'TURN_RIGHT',
  GO_TO = 'GO_TO',
  GLIDE = 'GLIDE',
  REPEAT = 'REPEAT'
}

export type Direction = 'N' | 'E' | 'S' | 'W';

export interface Position {
  x: number;
  y: number;
}

export interface Command {
  id: string;
  type: CommandType;
  x?: number;
  y?: number;
  count?: number;
  nested?: Command[];
}

export interface Level {
  id: number;
  module: number;
  gridSize: number;
  title: string;
  message: string;
  startPos: Position;
  startDir: Direction;
  goalPos: Position;
  obstacles: Position[];
  availableCommands: CommandType[];
  isSpecialTask?: boolean;
}
