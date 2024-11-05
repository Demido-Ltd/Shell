import {exit} from "./Exit.ts";
import DemidoShell from "../DemidoShell.ts";

export default {
    name: "restart",
    execute: async (parameters: any, flags: any, shell: DemidoShell) => {
        await exit(shell, false);
        new DemidoShell();
    }
};
