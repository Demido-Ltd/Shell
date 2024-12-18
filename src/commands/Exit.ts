import type DemidoShell from "../DemidoShell.ts";
import {DiscordBot} from "../../discord-bot/DiscordBot.ts";

// TODO: Add Documentation
export const exit = async (shell: DemidoShell, exit: boolean = true) => {
    shell.rl.close();
    shell.exitShell();

    if (process.env.DISCORD_BOT === "true") {
        if (shell.discordClient.isReady()) {
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
