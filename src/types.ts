import { Message } from "discord.js";
import { ValueTransformer } from "typeorm";
import {
    blankEmoji,
    deadPlayerEmoji,
    deadRobotEmoji,
    fenceEmoji,
    playerEmoji,
    robotEmoji,
} from "./constants";

export interface Position {
    column: number;
    line: number;
}

export interface PPoint {
    x: number;
    y: number;
}

export const positionPointTransformer: ValueTransformer = {
    to: (pos: Position): string => `${pos.column}, ${pos.line}`,
    from: (p: PPoint): Position => ({ column: p.x, line: p.y }),
};

export const positionPointArrayTransformer: ValueTransformer = {
    to: (pos: Position[]): string[] => pos.map(positionPointTransformer.to),
    from: (p: PPoint[]): Position[] => p.map(positionPointTransformer.from),
};

export type Command = (message: Message, ...args: string[]) => void;

export type FenceOrBlank = typeof fenceEmoji | typeof blankEmoji;
export type MazeCell =
    | FenceOrBlank
    | typeof robotEmoji
    | typeof deadRobotEmoji
    | typeof playerEmoji[number]
    | typeof deadPlayerEmoji[number];
