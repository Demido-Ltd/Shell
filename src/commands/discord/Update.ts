import type DemidoShell from "../../DemidoShell.ts";
import { execSync } from "child_process";
import { existsSync } from "fs";
import path from "node:path";

// TODO: Add Documentation
export class Update{
    discordBotPath: string;
    shell: DemidoShell;

    constructor(shell: DemidoShell) {
        this.discordBotPath = path.join(__dirname, "../../../discord-bot");
        this.shell = shell;
    }

    private runCommand = (command: string) => {
        try {
            return execSync(command, { stdio: "pipe" }).toString().trim();
        } catch (error) {
            console.error(`There has been an error executing command: ${command}\n`, error);
        }
    }

    public runUpdate = async (showUpToDateMessage: boolean = true) => {

        if (existsSync(this.discordBotPath)) {
            process.chdir(this.discordBotPath);
            this.runCommand("git fetch");
            const localCommit = this.runCommand("git rev-parse HEAD");
            const remoteCommit = this.runCommand("git rev-parse \"@{u}\"");

            if (localCommit !== remoteCommit) {
                console.log("Updating Demido Discord bot...");
                this.runCommand("git pull");
            } else if (showUpToDateMessage) console.log("Demido Discord bot is up to date.");
        } else {
            console.log("Downloading latest version of Demido Discord bot...");
            this.runCommand(`git clone ${process.env.DISCORD_BOT_REPO_URL} ${this.discordBotPath}`);
            try {
                await this.shell.initializeBot();
            } catch (error) {
                console.error("Failed to initialize the Discord bot:", error);
            }
        }
    }
}

export default {
    name: "update",
    aliases: ["u"],
    execute: async (parameters: string[], flags: { [key: string]: string | null }, shell: DemidoShell): Promise<void> => {
        await new Update(shell).runUpdate();
    }
};
