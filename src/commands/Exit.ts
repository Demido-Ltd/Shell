import type DemidoShell from "../DemidoShell.ts";
import { DiscordBot } from "../../discord-bot/DiscordBot.ts";

export const exit = async (shell: DemidoShell, exit: boolean = true) => {
    shell.rl.close();
    shell.exitShell();
    if (process.env.DISCORD_BOT === "true" && DiscordBot.client?.isReady()) DiscordBot.stop().then(() => {
        console.log("Goodbye!");
        if (exit) process.exit(0);
    });
}

export default {
    name: "exit",
    aliases: ["quit", "stop"],
    execute: async (_parameters: null, _flags: null, shell: DemidoShell) => {
        await exit(shell);
    }
};
