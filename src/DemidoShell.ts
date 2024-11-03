import * as readline from "node:readline";
import "dotenv/config";
import CommandsHandler, { type Command } from "./CommandsHandler.ts";
import { DiscordBot } from "../discord-bot/DiscordBot.ts";
import ENVSanitizer from "./ENVSanitizer.ts";

/**
 * Command-line interface shell that allows management of [Demido-Ltd.](https://github.com/Demido-Ltd) systems.
 * @author [Stefan Cucoranu](https://github.com/elpideus)
 */
export default class DemidoShell {
    private isRunning = true;
    public rl!: readline.Interface;
    public commands = new Map<string, Command>();

    /**
     * Initializes the DemidoShell instance.
     * It sanitizes environment variables, initializes the commands handler, attempts to start the Discord Bot and starts prompting the user.
     */
    constructor() {
        (async () => {
            await ENVSanitizer.sanitize();
            this.rl = readline.createInterface({ input: process.stdin, output: process.stdout });
            new CommandsHandler(this);
            await this.initializeBot();
            console.log("Starting shell...");
        })();
    }

    /**
     * Initializes the Discord bot if specified in the environment variables
     * and sets up the command handler.
     * @private
     * @returns {Promise<void>}
     */
    private initializeBot = async (): Promise<void> => {
        if (process.env.DISCORD_BOT === "true") try { console.log(await DiscordBot.run()); } catch (e) { console.error("Error starting Discord bot:", e); }
        await this.promptUser();
    };

    /**
     * Prompts the user for input and processes the command.
     * If a command is valid, it executes it; otherwise, it shows an error.
     * @private
     * @returns {Promise<void>}
     */
    private promptUser = async (): Promise<void> => {
        if (!this.isRunning) return;
        this.rl.question(process.env.CLI_PREFIX!, async (input) => {
            const command = await this.parseCommand(input.trim().replace(/\s+/g, ' '));
            if (command) {
                const commandHandler = this.commands.get(command.name);
                commandHandler ? await commandHandler.execute(command.parameters, command.flags, this) : this.noCommandError(command.name);
            }
            await this.promptUser();
        });
    };

    /**
     * Exits the shell and closes the readline interface.
     */
    public exitShell = () => {
        this.isRunning = false;
        this.rl.close();
    };

    /**
     * Parses a command string into its name, parameters, and flags.
     * @private
     * @param {string} command - The command string to parse.
     * @returns {Promise<{name: string, parameters: string[], flags: { [key: string]: string | null }} | undefined>}
     */
    private parseCommand = async (command: string) => {
        const words = command.match(/(?:[^\s"]+|"[^"]*")+/g)?.map(w => w.replace(/(^"|"$)/g, '')) || [];
        if (!words.length) return;
        const [name, ...parameters] = words;
        const flags = parameters.reduce((acc, val, i, arr) => {
            if (val.startsWith('--')) acc[val.slice(2).replace(/-/g, "_")] = arr[i + 1]?.startsWith('--') ? null : arr[++i];
            return acc;
        }, {} as { [key: string]: string | null });
        return { name, parameters, flags };
    };

    /**
     * Displays an error message when a command is not found.
     * @private
     * @param {string} command - The name of the command that was not found.
     */
    private noCommandError = (command: string) => console.log(`There is no command named \`${command}\`.\nCheck "help" for more information.`);
}
