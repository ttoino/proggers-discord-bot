import { DMChannel, Message, NewsChannel, TextChannel, User } from "discord.js";
import {
    blankEmoji,
    deadPlayerEmoji,
    deadRobotEmoji,
    fenceEmoji,
    playerEmoji,
    robotEmoji,
} from "./constants";
import { Game } from "./game";
import { FenceOrBlank, MazeCell } from "./types";
import { randomChoice, zip } from "./util";

export class MessageGeometry {
    private messages: number[] = [];
    private nCols: number;

    constructor(fences: FenceOrBlank[], nCols: number) {
        this.nCols = nCols;

        let length = 0;
        let lengthUntilNewMessage = 0;
        let lines = 0;
        fences.forEach((f, i) => {
            if (i % this.nCols == 0 && i != 0) {
                lines++;
                length++;
                lengthUntilNewMessage = length;
            }

            if (length + f.length > 2000) {
                this.messages.push(lines);
                lines = 0;
                length -= lengthUntilNewMessage;
            }

            length += f.length;
        });
        this.messages.push(lines + 1);
    }

    buildMessages(cells: MazeCell[]): string[] {
        let messages: string[] = [];

        let message = "";
        let lines = 1;
        cells.forEach((c, i) => {
            if (i % this.nCols == 0 && i != 0) {
                if (lines == this.messages[messages.length]) {
                    messages.push(message);
                    message = "";
                    lines = 1;
                } else {
                    lines++;
                    message += "\n";
                }
            }

            message += c;
        });
        messages.push(message);

        return messages;
    }
}

const input: { [key: string]: [-1 | 0 | 1, -1 | 0 | 1] } = {
    q: [-1, -1],
    w: [0, -1],
    e: [1, -1],
    a: [-1, 0],
    s: [0, 0],
    d: [1, 0],
    z: [-1, 1],
    x: [0, 1],
    c: [1, 1],
};

export class DiscordInterface {
    private game: Game;
    private channel: TextChannel | DMChannel | NewsChannel;
    private user: User;
    private fences: FenceOrBlank[];
    private messageGeometry: MessageGeometry;
    private messages?: Message[];
    private playerEmoji: typeof playerEmoji[number];
    private deadPlayerEmoji: typeof deadPlayerEmoji[number];

    constructor(game: Game, message: Message) {
        this.game = game;
        this.channel = message.channel;
        this.user = message.author;

        this.fences = game.maze.fences.map((f) =>
            f ? fenceEmoji : blankEmoji
        );
        this.playerEmoji = randomChoice(playerEmoji);
        this.deadPlayerEmoji = randomChoice(deadPlayerEmoji);

        this.messageGeometry = new MessageGeometry(
            this.fences,
            game.maze.nColumns
        );
    }

    private async getInput() {
        try {
            const messages = await this.channel.awaitMessages(
                (m: Message) => m.author == this.user && m.content in input,
                {
                    time: 60000,
                    max: 1,
                    errors: ["time"],
                }
            );
            const message = messages.first()!;
            message.delete();
            return this.game.movePlayer(...input[message.content]);
        } catch (e) {
            console.error(e);
        }
    }

    private async displayMaze() {
        const cells: MazeCell[] = [...this.fences];

        this.game.robots.forEach(
            (r) =>
                (cells[this.game.indexOf(r)] = r.alive
                    ? robotEmoji
                    : deadRobotEmoji)
        );
        cells[this.game.indexOf(this.game.player)] = this.game.player.alive
            ? this.playerEmoji
            : this.deadPlayerEmoji;

        const messages = this.messageGeometry.buildMessages(cells);

        if (this.messages) {
            for (const [m, mc] of zip(this.messages, messages)) {
                m.edit(mc);
            }
        } else {
            this.messages = await Promise.all(
                messages.map(async (m) => await this.channel.send(m))
            );
        }
    }

    async start() {
        console.debug(
            `${this.user.username} started playing ${this.game.maze.name}`
        );

        await this.displayMaze();

        while (!this.game.isOver()) {
            if (await this.getInput()) {
                this.game.tick();
                await this.displayMaze();
            }
        }

        console.debug(
            `${this.user.username} ${this.game.player.alive ? "won" : "lost"} ${
                this.game.maze.name
            }`
        );
    }
}
