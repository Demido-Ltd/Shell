import type DemidoShell from "../DemidoShell.ts";
import { DiscordBot } from "../../discord-bot/DiscordBot.ts";

export default {
    name: "exit",
    aliases: ["quit", "stop"],
    execute: async (_parameters: null, _flags: null, shell: DemidoShell) => {
        shell.rl.close();
        shell.exitShell();
        if (process.env.DISCORD_BOT === "true") await DiscordBot.stop();
        console.log("Goodbye!");
        process.exit(0);
    }
};
