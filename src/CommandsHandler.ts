import type DemidoShell from "./DemidoShell.ts";
import path from "node:path";
import fs from "node:fs";
import {DiscordCommandsHandler} from "./commands/discord/Discord.ts";

/**
 * Command that can be executed in the shell.
 */
export interface Command {
    name: string; // The name of the command.
    aliases?: string[]; // Optional array of aliases for the command.
    execute: (params: string[], flags: { [key: string]: string | null }, shell: DemidoShell) => Promise<void>; // Function to execute when the command is called.
}

/**
 * Handles the loading and registration of commands for the {@link DemidoShell}.
 */
export default class CommandsHandler {
    private readonly shell: DemidoShell;

    /**
     * Initializes a new CommandsHandler instance and loads commands.
     * @param {DemidoShell} shell - The {@link DemidoShell} instance to associate with [this handler]{@link CommandsHandler}.
     */
    constructor(shell: DemidoShell) {
        this.shell = shell;
        this.loadCommands().then(() => {
            if (process.env.DISCORD_BOT) new DiscordCommandsHandler().loadCommands().then();
        });
    }

    /**
     * Loads commands from the commands directory.
     * @private
     * @returns {Promise<void>}
     */
    private loadCommands = async (): Promise<void> => {
        const commandsDir = path.join(__dirname, "./commands");

        /**
         * Recursively loads commands from a specified directory.
         * @param {string} dir - The directory to load commands from.
         * @returns {Promise<void>}
         */
        const loadCommandsFromDirectory = async (dir: string): Promise<void> => {
            const commandFiles = fs.readdirSync(dir, { withFileTypes: true });

            for (const commandFile of commandFiles) {
                const commandPath = path.join(dir, commandFile.name);

                if (commandFile.isDirectory()) {
                    if (commandFile.name === "discord") {
                        const command: Command = (await import(path.join(commandPath, "Discord.ts"))).default || {};
                        this.registerCommand(command);
                    } else await loadCommandsFromDirectory(commandPath);
                } else if (commandFile.name.endsWith("ts") || commandFile.name.endsWith("js")) {
                    const command: Command = (await import(commandPath)).default || {};
                    this.registerCommand(command);
                }
            }
        }

        await loadCommandsFromDirectory(commandsDir);
    }

    /**
     * Registers a command with [the shell]{@link DemidoShell}.
     * @private
     * @param {Command} command - The command to register.
     */
    private registerCommand(command: Command) {
        if (command.name) {
            this.shell.commands.set(command.name, command);

            if (command.aliases) {
                for (const alias of command.aliases) {
                    this.shell.commands.set(alias, command);
                }
            }
        }
    }
}
