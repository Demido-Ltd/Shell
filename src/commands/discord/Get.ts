import type DemidoShell from "../../DemidoShell.ts";
import chalk from "chalk";

// TODO: Add Documentation
export default {
    name: "get",
    execute: async (parameters: string[], flags: { [key: string]: string | null }, shell: DemidoShell) => {

        // TODO: Optimize code, add oneliners, separate concerns

        const printOutput = (data: any[] | number) => {
            const output = typeof data === "number"
                ? ("number_only" in flags ? data : `Demido is part of ${data} Discord servers.`)
                : ("as_array" in flags ? data
                    : ("as_string" in flags ? data.join(", ")
                        : data.join("\n")));
            console.log(output);
        };

        if (parameters.length < 1 || !["servers", "guilds"].includes(parameters[0])) {
            console.log("Invalid command. Please check the manual on how to use the \"get\" command.");
            console.log(chalk.gray("help discord get"));
            return;
        }

        if (!shell.discordClient) {
            console.log("Discord client unavailable.");
            return;
        }

        const guilds = shell.discordClient.guilds.cache.map((guild: { name: string; id: string }) => ({
            name: guild.name,
            id: guild.id,
        }));

        const handleGuildsWithInvites = async () => {
            const guildInvites = await Promise.all(
                guilds.map(async (guild: { id: any; name: any; }) => {
                    try {
                        const invites = await shell.discordClient?.guilds.cache.get(guild.id)?.invites.fetch();
                        return { name: guild.name, invites: invites ? invites.map((invite: { code: any; }) => invite.code) : [] };
                    } catch {
                        return { name: guild.name, invites: [] };
                    }
                })
            );
            printOutput(
                guildInvites.map(({ name, invites }) => `${name} -> (${invites.length ? invites.join(", ") : "No invites"})`)
            );
        };

        if (parameters.includes("name") && parameters.includes("id")) {
            printOutput(guilds.map((info: { name: any; id: any; }) => `${info.name} (${info.id})`));
        } else if (parameters[1] === "invite") {
            await handleGuildsWithInvites();
        } else if (parameters[1] === "name") {
            printOutput(guilds.map((guild: { name: any; }) => guild.name));
        } else if (
            parameters.includes("members") &&
            parameters.some((param) => ["count", "number", "#"].includes(param))
        ) {
            console.log("Counting members...");
            let members = 0;

            const clearLines = (lines: number) => {
                for (let i = 0; i < lines; i++) {
                    process.stdout.moveCursor(0, -1);
                    process.stdout.clearLine(1);
                }
            };

            const countMembers = async () => {
                for (const guild of shell.discordClient!.guilds.cache.values()) {
                    const users = await guild.members.fetch();
                    members += users.size;
                }
                clearLines(1);
                console.log(`There are ${members} users across all the servers using Demido.`);
            };
            await countMembers();
        } else if (["count", "number", "#"].includes(parameters[1])) {
            printOutput(guilds.length);
        } else {
            console.log("Invalid command. Please check the manual on how to use the \"get servers|guilds\" command.");
            console.log(chalk.gray("help discord get servers") + " or " + chalk.gray("help discord get guilds"));
        }
    },
};
