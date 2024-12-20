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

    private getPackageManager = (): string => {
        try {
            execSync("which bun", { stdio: "ignore" });
            return "bun";
        } catch (error) { return "npm"; }
    }

    public runUpdate = async (showUpToDateMessage: boolean = true) => {

        if (existsSync(this.discordBotPath)) {
            process.chdir(this.discordBotPath);
            this.runCommand("git submodule update --init --recursive");
            this.runCommand("git fetch");
            //TODO: Add version check so it doesnt try to update every time
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
