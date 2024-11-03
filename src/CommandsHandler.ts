import type DemidoShell from "./DemidoShell.ts";
import path from "node:path";
import fs from "node:fs";

export interface Command {
    name: string;
    aliases?: string[];
    execute: (params: string[], flags: { [key: string]: string | null }, shell: DemidoShell) => Promise<void>;
}

export default class CommandsHandler {
    private readonly shell: DemidoShell;

    constructor(shell: DemidoShell) {
        this.shell = shell;
        this.loadCommands();
    }

    private loadCommands = async () => {
        const commandsDir = path.join(__dirname, "./commands");

        const loadCommandsFromDirectory = async (dir: string) => {
            const commandFiles = fs.readdirSync(dir, { withFileTypes: true });

            for (const commandFile of commandFiles) {
                const commandPath = path.join(dir, commandFile.name);

                if (commandFile.isDirectory()) {
                    if (process.env.DISCORD_BOT!.toLowerCase() == "false" && commandFile.name == "discord" ||
                        process.env.TELEGRAM_BOT!.toLowerCase() == "false" && commandFile.name == "telegram") continue;
                    await loadCommandsFromDirectory(commandPath);
                } else if (commandFile.name.endsWith("ts") || commandFile.name.endsWith("js")) {
                    const command: Command = (await import(commandPath)).default || {};
                    this.registerCommand(command);
                }
            }
        }

        await loadCommandsFromDirectory(commandsDir);

    }

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
