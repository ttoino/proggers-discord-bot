import { Maze } from "./entity/maze";
import { Game } from "./game";
import { DiscordInterface } from "./interface";
import { loadMazeFromString } from "./maze";
import { Command } from "./types";
import { request } from "./util";

const loadMazeHelp =
    "*<Name> <Maze file>* - Adds a maze with the name specified. Requires a maze file to be sent with your message.";
const loadMazeCommand: Command = async (message, ...args) => {
    if (message.attachments.size != 1)
        // TODO: Error message
        return;

    const mazeFile = message.attachments.first()!;

    if (!mazeFile.url.endsWith(".txt"))
        // TODO: Error message
        return;

    const name = args.join(" ");

    if (!name)
        // TODO: Error message
        return;

    try {
        const mazeFileContents = await request(mazeFile.url);

        const maze = loadMazeFromString(mazeFileContents);

        if (maze) {
            maze.name = name;
            Maze.insert(maze);
        }
    } catch (e) {
        console.error(e);
    }
};

// export const testCommand: Command = async (message, ...args) => {
//     const maze = await Maze.findOne({
//         where: { name: args.join(" ") },
//     });

//     if (!maze) return;

//     const map: string[] = maze.fences.map((b) => (b ? fenceEmoji : blankEmoji));

//     map[maze.playerPosition.line * maze.nColumns + maze.playerPosition.column] =
//         playerEmoji[Math.floor(Math.random() * playerEmoji.length)];

//     for (const r of maze.robotPositions)
//         map[r.line * maze.nColumns + r.column] = robotEmoji;

//     const s = map
//         .reduce(
//             (s, e, i) => s + (i != 0 && i % maze.nColumns == 0 ? "\n" : "") + e,
//             ""
//         )
//         .split("\n");

//     let a = "";
//     for (const ss of s) {
//         if ((a + "\n" + ss).length > 2000) {
//             await message.channel.send(a);
//             a = ss;
//         } else {
//             a += (a ? "\n" : "") + ss;
//         }
//     }
//     const m = await message.channel.send(a);

//     await new Promise((res) => setTimeout(res, 1000));

//     m.edit(a + " Hello");
// };

const playHelp = "*<Name>* - Play the maze with the name specified.";
const playCommand: Command = async (message, ...args) => {
    const maze = await Maze.findOne({
        where: { name: args.join(" ") },
    });

    if (!maze) {
        //TODO: Error message
        return;
    }

    const discordInterface = new DiscordInterface(new Game(maze), message);
    discordInterface.start();
};

const listHelp = "- Lists all mazes.";
const listCommand: Command = async (message, ...args) => {
    const mazes = await Maze.find();

    message.channel.send(
        mazes.reduce(
            (s, m) =>
                s +
                `**${m.name}** - ${m.nColumns}x${m.nLines} - ${m.robotPositions.length} robots\n`,
            ""
        )
    );
};

let helpMessage = "";
const helpHelp = "- Shows you all the commands.";
const helpCommand: Command = (message, ...args) => {
    if (!helpMessage) {
        let h: string[] = [];
        for (const c in commands) {
            h.push(`**${c}** ${commands[c][1]}`);
        }
        helpMessage = h.join("\n");
    }

    message.channel.send(helpMessage);
};

export const commands: { [key: string]: [Command, string] } = {
    maze: [loadMazeCommand, loadMazeHelp],
    play: [playCommand, playHelp],
    list: [listCommand, listHelp],
    help: [helpCommand, helpHelp],
};
