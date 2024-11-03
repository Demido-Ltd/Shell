import * as readline from "node:readline";
import "dotenv/config";
import CommandsHandler, { type Command } from "./CommandsHandler.ts";
import { DiscordBot } from "../discord-bot/DiscordBot.ts";
import ENVSanitizer from "./ENVSanitizer.ts";

export default class DemidoShell {
    private isRunning = true;
    public rl!: readline.Interface;
    public commands = new Map<string, Command>();

    constructor() {
        (async () => {
            await ENVSanitizer.sanitize();
            this.rl = readline.createInterface({ input: process.stdin, output: process.stdout });
            console.log("Starting shell...");
            await this.initializeBot();
        })();
    }

    private initializeBot = async () => {
        if (process.env.DISCORD_BOT === "true") {
            try { console.log(await DiscordBot.run()); } catch (e) { console.error("Error starting Discord bot:", e); }
        }
        new CommandsHandler(this);
        await this.promptUser();
    };

    private promptUser = async () => {
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

    public exitShell = () => {
        this.isRunning = false;
        this.rl.close();
    };

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

    private noCommandError = (command: string) => console.log(`There is no command named \`${command}\`.\nCheck "help" for more information.`);
}
