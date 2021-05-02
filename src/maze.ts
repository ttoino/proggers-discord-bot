import { Maze } from "./entity/maze";
import { Position } from "./types";

const mazeStringRegex = /^\s*(\d+)\s*x\s*(\d+)\s*\n([ *RH\n]+)$/;

export function loadMazeFromString(
    fileContents: string
): Partial<Maze> | undefined {
    const match = mazeStringRegex.exec(fileContents);

    if (!match) return;

    const nLines = parseInt(match[1]);
    const nColumns = parseInt(match[2]);
    const fences: boolean[] = [];
    const robotPositions: Position[] = [];
    let playerPosition: Position | undefined;

    let i = 0;
    for (const c of match[3]) {
        const column = i % nColumns;
        const line = Math.floor(i / nColumns);
        switch (c) {
            case "\n":
                continue;
            case "R":
                robotPositions.push({ column, line });
                fences.push(false);
                break;
            case "H":
                if (playerPosition) return;

                playerPosition = { column, line };
                fences.push(false);
                break;
            case " ":
                fences.push(false);
                break;
            case "*":
                fences.push(true);
                break;
            default:
                return;
        }

        i++;
    }

    if (!playerPosition) return;

    if (nColumns * nLines != fences.length) return;

    return { nColumns, nLines, fences, robotPositions, playerPosition };
}
