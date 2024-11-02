import * as readline from "node:readline";
import type DemidoShell from "../DemidoShell.ts";

export default {
    name: "exit",
    aliases: ["quit", "stop"],
    execute: async (parameters: null, flags: null, shell: DemidoShell) => {
        shell.rl.close();
    }
};
