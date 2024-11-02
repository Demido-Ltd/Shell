import type DemidoShell from "./DemidoShell.ts";
import path from "node:path";
import fs from "node:fs";

export interface Command {
    name: string;
    aliases?: string[];
    execute: (params: string[], flags: { [key: string]: string | null }, shell: DemidoShell) => Promise<void>;
}

export default class CommandHandler {
    private readonly shell: DemidoShell;

    constructor(shell: DemidoShell) {
        this.shell = shell;
        this.loadCommands();
    }

    public getShell = async () => {
        return this.shell;
    }

    private loadCommands = async () => {
        const commandsDir = path.join(__dirname, "./commands");
        const commandFiles = fs.readdirSync(commandsDir, { withFileTypes: true });

        for (const commandFile of commandFiles) {
            const commandsPath = path.join(commandsDir, commandFile.name);

            if (commandFile.isDirectory()) {
                const files = fs.readdirSync(commandsPath);
                for (const file of files) {
                    if (file.endsWith("ts") || file.endsWith("js")) {
                        const command: Command = (await import(path.join(commandsPath, file))).default || {};
                        this.registerCommand(command);
                    }
                }
            } else if (commandFile.name.endsWith("ts") || commandFile.name.endsWith("js")) {
                const command: Command = (await import(commandsPath)).default || {};
                this.registerCommand(command);
            }
        }
    }

    private registerCommand(command: Command) {
        if (command.name) {
            // Register the main command
            this.shell.commands.set(command.name, command);

            // Register aliases if they exist
            if (command.aliases) {
                for (const alias of command.aliases) {
                    this.shell.commands.set(alias, command);
                }
            }
        }
    }
}
