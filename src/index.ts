// Load environment variables before anything else happens
import * as dotenv from "dotenv";
dotenv.config();

import Discord from "discord.js";
import "reflect-metadata";
import { createConnection } from "typeorm";
import { Command } from "./types";
import { loadMazeCommand, playCommand, testCommand } from "./commands";

export const client = new Discord.Client();

const main = async () => {
    await createConnection({
        type: "postgres",
        url: process.env.DATABASE_URL,
        logging: false,
        synchronize: true,
        entities: [__dirname + "/entity/*.ts"],
    });

    // const file = await fs.readFile("MAZE_01.txt", {
    //     encoding: "utf-8",
    // });
    // const maze = loadMazeFromString(file)!;
    // maze.name = "Classic";
    // Maze.insert(maze);
};

client.once("ready", () => {
    console.log("Ready!");
});

const commands: { [key: string]: Command } = {
    test: testCommand,
    maze: loadMazeCommand,
    play: playCommand,
};

client.on("message", (message) => {
    // Ignore bots
    if (message.author.bot) return;
    // Ignore non command messages
    if (!message.content.startsWith("jas ")) return;

    const args = message.content.split(" ");
    args.shift(); // Remove "jas"
    const command = args.shift();

    if (command && command in commands) commands[command](message, ...args);
});

main();
client.login(process.env.BOT_TOKEN);
