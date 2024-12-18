import type DemidoShell from "../../DemidoShell.ts";
import path from "node:path";
import fs from "node:fs";
import {type Command} from "../../CommandsHandler.ts";

// TODO: Add Documentation
export class DiscordCommandsHandler {

    public static discordCommands: Map<string, any> = new Map<string, any>();

    private registerCommand = (command: Command) => {
        if (command.name) {
            DiscordCommandsHandler.discordCommands.set(command.name, command);

            if (command.aliases) {
                for (const alias of command.aliases) {
                    DiscordCommandsHandler.discordCommands.set(alias, command);
                }
            }
        }
    }

    public loadCommands = async (): Promise<void> => {
        const commandsDir = __dirname;

        /**
         * Recursively loads commands from a specified directory.
         * @param {string} dir - The directory to load commands from.
         * @returns {Promise<void>}
         */
        const loadCommandsFromDirectory = async (dir: string): Promise<void> => {
            const commandFiles = fs.readdirSync(dir, {withFileTypes: true});

            for (const commandFile of commandFiles) {
                const commandPath = path.join(dir, commandFile.name);

                if (commandFile.isDirectory()) {
                    await loadCommandsFromDirectory(commandPath);
                } else if (commandFile.name.endsWith("ts") || commandFile.name.endsWith("js")) {
                    const command: Command = (await import(commandPath)).default || {};
                    this.registerCommand(command);
                }
            }
        }

        await loadCommandsFromDirectory(commandsDir);
    }
}

export default {
    name: "discord",
    aliases: ["ds"],
    execute: async (parameters: string[], flags: { [key: string]: string | null }, shell: DemidoShell): Promise<void> => {
        if (!shell.discordClient && parameters[0] !== "update") return console.log("Discord client unavailable.");

        if (!parameters || parameters.length < 1) return console.log("TODO: Write discord usage manual");

        await DiscordCommandsHandler.discordCommands.get(parameters[0]).execute(parameters.slice(1), flags, shell);
        // TODO: Complete discord commands
    }
};
