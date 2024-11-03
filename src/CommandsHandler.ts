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
            for (const file of fs.readdirSync(dir, { withFileTypes: true })) {
                const commandPath = path.join(dir, file.name);
                if (file.isDirectory() && ((process.env.DISCORD_BOT === "false" && file.name === "discord") || (process.env.TELEGRAM_BOT === "false" && file.name === "telegram"))) continue;
                if (!file.isDirectory() && (file.name.endsWith(".ts") || file.name.endsWith(".js"))) {
                    const command: Command = (await import(commandPath)).default || {};
                    this.registerCommand(command);
                } else await loadCommandsFromDirectory(commandPath);
            }
        };
        await loadCommandsFromDirectory(commandsDir);
    };

    private registerCommand = (command: Command) => {
        if (command.name) {
            this.shell.commands.set(command.name, command);
            command.aliases?.forEach(alias => this.shell.commands.set(alias, command));
        }
    };
}
