import type DemidoShell from "../DemidoShell.ts";
import { existsSync } from "fs";
import path from "node:path";

export const exit = async (shell: DemidoShell, exit: boolean = true) => {
    shell.rl.close();
    shell.exitShell();

    // Check for the existence of the DiscordBot module
    const discordBotPath = path.join(process.cwd(), "discord-bot/DiscordBot.ts");
    if (process.env.DISCORD_BOT === "true" && existsSync(discordBotPath)) {
        const { DiscordBot } = await import(discordBotPath); // Dynamically import if it exists
        if (DiscordBot.client?.isReady()) {
            await DiscordBot.stop();
            console.log("Goodbye!");
        }
    } else {
        console.log("Discord bot not initialized or not found.");
    }

    if (exit) process.exit(0);
}

export default {
    name: "exit",
    aliases: ["quit", "stop"],
    execute: async (_parameters: null, _flags: null, shell: DemidoShell) => {
        await exit(shell);
    }
};
