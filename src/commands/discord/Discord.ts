import type DemidoShell from "../../DemidoShell.ts";
import path from "node:path";
import fs from "node:fs";
import CommandsHandler, {type Command} from "../../CommandsHandler.ts";

export class DiscordCommandsHandler {

    public static discordCommands: Map<string, any> = new Map<string, any>();

    private registerCommand = (command: Command) => {
        if (command.name) {
            DiscordCommandsHandler.discordCommands.set(command.name, command);

            if (command.aliases) {
                for (const alias of command.aliases) {
                    DiscordCommandsHandler.discordCommands.set(alias, command);
                }
            }
        }
    }

    public loadCommands = async (): Promise<void> => {
        const commandsDir = __dirname;

        /**
         * Recursively loads commands from a specified directory.
         * @param {string} dir - The directory to load commands from.
         * @returns {Promise<void>}
         */
        const loadCommandsFromDirectory = async (dir: string): Promise<void> => {
            const commandFiles = fs.readdirSync(dir, {withFileTypes: true});

            for (const commandFile of commandFiles) {
                const commandPath = path.join(dir, commandFile.name);

                if (commandFile.isDirectory()) {
                    await loadCommandsFromDirectory(commandPath);
                } else if (commandFile.name.endsWith("ts") || commandFile.name.endsWith("js")) {
                    const command: Command = (await import(commandPath)).default || {};
                    this.registerCommand(command);
                }
            }
        }

        await loadCommandsFromDirectory(commandsDir);
    }
}

export default {
    name: "discord",
    aliases: ["ds"],
    execute: async (parameters: string[], flags: { [key: string]: string | null }, shell: DemidoShell): Promise<void> => {
        if (!shell.discordClient) return console.log("Discord client unavailable.");

        if (!parameters || parameters.length < 1) return console.log("TODO: Write discord usage manual");

        DiscordCommandsHandler.discordCommands.get(parameters[0]).execute();
        // TODO: Complete discord commands

        // const guilds = shell.discordClient.guilds.cache.map(guild => ({ name: guild.name, id: guild.id }));
        //
        // const printOutput = (data: any[] | number) => {
        //     const output = typeof data === "number" ?
        //         ("number_only" in flags ? data : `Demido is part of ${data} Discord servers.`) :
        //         ("as_array" in flags ? data : ("as_string" in flags ? data.join(", ") : data.map(item => item).join("\n")));
        //     console.log(output);
        // };
        //
        // const handleGuildsWithInvites = async () => {
        //     const guildInvites = await Promise.all(guilds.map(async (guild) => {
        //         try {
        //             const invites = await shell.discordClient?.guilds.cache.get(guild.id)?.invites.fetch();
        //             return { name: guild.name, invites: invites ? invites.map(invite => invite.code) : [] };
        //         } catch {
        //             return { name: guild.name, invites: [] };
        //         }
        //     }));
        //     printOutput(guildInvites.map(({ name, invites }) => `${name}: (${invites.length > 0 ? invites.join(", ") : "No invites"})`));
        // };
        //
        // if (parameters[0] === "get" && ["servers", "guilds"].includes(parameters[1])) {
        //     if (parameters.includes("name") && parameters.includes("id")) {
        //         printOutput(guilds.map(info => `${info.name} (${info.id})`));
        //     } else if (parameters.includes("name") && parameters.includes("invite")) {
        //         await handleGuildsWithInvites();
        //     } else if (parameters.includes("name")) {
        //         printOutput(guilds.map(guild => guild.name));
        //     } else if (parameters.some(param => ["count", "number", "#"].includes(param))) {
        //         printOutput(guilds.length);
        //     }
        // }
    }
};
