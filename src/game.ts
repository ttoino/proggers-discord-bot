import { Maze } from "./entity/maze";
import { Position } from "./types";

export class Entity {
    column: number;
    line: number;
    alive: boolean = true;

    constructor(position: Position) {
        this.column = position.column;
        this.line = position.line;
    }
}

export class Game {
    player: Entity;
    robots: Entity[];
    maze: Maze;

    constructor(maze: Maze) {
        this.maze = maze;

        this.player = new Entity(maze.playerPosition);
        this.robots = maze.robotPositions.map((p) => new Entity(p));
    }

    movePlayer(columnDelta: -1 | 0 | 1, lineDelta: -1 | 0 | 1): boolean {
        const newCol = this.player.column + columnDelta;
        const newLine = this.player.line + lineDelta;

        if (
            newCol < 0 ||
            newCol >= this.maze.nColumns ||
            newLine < 0 ||
            newLine >= this.maze.nLines
        ) {
            return false;
        } else if (
            this.robots.find(
                (r) => !r.alive && r.column == newCol && r.line == newLine
            )
        ) {
            return false;
        }

        this.player.column = newCol;
        this.player.line = newLine;
        return true;
    }

    private moveRobots() {
        for (const robot of this.robots) {
            if (!robot.alive) continue;

            robot.line += Math.sign(this.player.line - robot.line);
            robot.column += Math.sign(this.player.column - robot.column);

            robot.alive = !this.entityFenceCollision(robot);

            for (const other of this.robots) {
                if (robot == other) continue;

                if (this.entityEntityCollision(robot, other)) {
                    robot.alive = false;
                    other.alive = false;
                }
            }

            if (this.entityEntityCollision(robot, this.player))
                this.player.alive = false;
        }
    }

    tick() {
        if (
            this.entityFenceCollision(this.player) ||
            this.robots.find(
                (r) =>
                    r.column == this.player.column && r.line == this.player.line
            )
        ) {
            this.player.alive = false;
            return;
        }

        this.moveRobots();
    }

    isOver() {
        return (
            !this.robots.reduce((b, r) => b || r.alive, false) ||
            !this.player.alive
        );
    }

    private entityEntityCollision(e1: Entity, e2: Entity) {
        return e1.line == e2.line && e1.column == e2.column;
    }

    private entityFenceCollision(entity: Entity): boolean {
        return this.maze.fences[this.indexOf(entity)];
    }

    indexOf(entity: Entity) {
        return this.posToIndex(entity.column, entity.line);
    }

    posToIndex(column: number, line: number) {
        return line * this.maze.nColumns + column;
    }
}
