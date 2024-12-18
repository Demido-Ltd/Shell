import chalk from "chalk";
import type DemidoShell from "../../DemidoShell.ts";
import type {Guild} from "discord.js";

export default {
    name: "get",
    execute: async (parameters: string[], flags: { [key: string]: string | null }, shell: DemidoShell) => {
        if (!shell.discordClient) {
            console.log("Discord client unavailable.");
            return;
        }

        const guilds = shell.discordClient.guilds.cache.map(({ name, id }: {name: string, id: string}) => ({ name, id }));

        const printOutput = (data: any[] | number) => {
            const output = typeof data === "number"
                ? ("number_only" in flags ? data : `Demido is part of ${data} Discord servers.`)
                : ("as_array" in flags ? data : data.join(flags["as_string"] ? ", " : "\n"));
            console.log(output);
        };

        if (parameters.length < 1 || !["servers", "guilds"].includes(parameters[0])) {
            console.log("Invalid command. Please check the manual on how to use the \"get\" command.");
            console.log(chalk.gray("help discord get"));
            return;
        }

        const handleGuildsWithInvites = async () => {
            const guildInvites = await Promise.all(
                guilds.map(async ({ id, name }: {id: string, name: string}) => {
                    try {
                        const invites = await shell.discordClient.guilds.cache.get(id)?.invites.fetch();
                        return { name, invites: invites?.map(({ code }: {code: string}) => code) || [] };
                    } catch {
                        return { name, invites: [] };
                    }
                })
            );
            printOutput(guildInvites.map(({ name, invites }) => `${name} -> (${invites.length ? invites.join(", ") : "No invites"})`));
        };

        const handleMemberCount = async () => {
            console.log("Counting members...");
            let members = 0;

            const clearLines = (lines: number) => {
                Array.from({ length: lines }).forEach(() => {
                    process.stdout.moveCursor(0, -1);
                    process.stdout.clearLine(1);
                });
            };

            const memberCounts = await Promise.all(
                Array.from(shell.discordClient.guilds.cache.values()).map(async (g) => {
                    const guild = g as Guild;
                    const members = await guild.members.fetch();
                    return members.size;
                })
            );
            members = memberCounts.reduce((sum, count) => sum + count, 0);

            clearLines(1);
            console.log(`There are ${members} users across all the servers using Demido.`);
        };

        if (parameters.includes("name") && parameters.includes("id")) printOutput(guilds.map(({ name, id }: {name: string, id: string}) => `${name} (${id})`));
        else if (parameters[1] === "invite") await handleGuildsWithInvites();
        else if (parameters[1] === "name") printOutput(guilds.map(({ name }: {name: string}) => name));
        else if (parameters.includes("members") && ["count", "number", "#"].some(param => parameters.includes(param))) await handleMemberCount();
        else if (["count", "number", "#"].includes(parameters[1])) printOutput(guilds.length);
        else {
            console.log("Invalid command. Please check the manual on how to use the \"get servers|guilds\" command.");
            console.log(`${chalk.gray("help discord get servers")} or ${chalk.gray("help discord get guilds")}`);
        }
    },
};
