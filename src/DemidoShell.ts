import * as readline from "node:readline";
import "dotenv/config";
import CommandHandler, {type Command} from "./CommandHandler.ts";

export default class DemidoShell {
    public readonly rl;
    public commands: Map<string, Command> = new Map<string, Command>();

    private parseCommand = async (command: string): Promise<{ parameters: string[]; flags: { [key: string]: string | null } }> => {
        const words = command.match(/(?:[^\s"]+|"[^"]*")+/g) || [];

        const result = {
            parameters: [] as string[],
            flags: {} as { [key: string]: string | null }
        };

        const length = words.length;

        if (length === 0) {
            console.error("No command provided.");
            return result;
        }

        for (let i = 0; i < length; i++) {
            const currentWord = words[i];

            if (currentWord.startsWith('--')) {
                const key = currentWord.slice(2).replace(/-/g, "_");
                if (i + 1 < length && !words[i + 1].startsWith('--')) result.flags[key] = words[++i].replace(/^"|"$/g, '');
                else result.flags[key] = null;
            } else result.parameters.push(currentWord.replace(/(^"|"$)/g, ''));
        }

        return result;
    };

    constructor() {
        this.rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        new CommandHandler(this);
        const promptUser = () => {
            // @ts-ignore
            !this.rl.closed && this.rl.question(process.env.CLI_PREFIX!, async (input: string) => {
                const command = await this.parseCommand(input.trim().replace(/\s+/g, ' '));
                const commandName = command.parameters.at(0);
                if (!commandName) return promptUser();

                // Find the command handler by name or alias
                const commandHandler = this.commands.get(commandName);
                if (!commandHandler) await this.noCommandError(commandName);
                else await commandHandler.execute(command.parameters.slice(1), command.flags, this);

                promptUser();
            });
        };

        promptUser();
    }

    private noCommandError = async (command: string) => {
        console.log(`There is no command named \`${command}\`.\nCheck "help" for more information.`);
    };
}
