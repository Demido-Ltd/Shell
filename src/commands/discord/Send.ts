import type DemidoShell from "../../DemidoShell.ts";
import mime from "mime-types";
import axios from "axios";
import chalk from "chalk";
import {EmbedBuilder} from "discord.js";

// TODO: Add Documentation
export default {
    name: "send",
    execute: async (parameters: string[], flags: { [key: string]: string | null }, shell: DemidoShell): Promise<void> => {
        if (parameters.length < 1) return console.error("Insufficient parameters provided. Check the manual for \"discord send\".");

        const { guild_id, server_id, channel_id, chat_id, file_name, file_description } = flags;
        const guild = shell.discordClient.guilds.cache.get(guild_id || server_id);
        if (!guild) return console.error(`Guild not found for ID: ${guild_id || server_id}.`);

        const channel = guild.channels.cache.get(channel_id || chat_id);
        if (!channel || !("send" in channel)) return console.error(`Channel not found or unsupported: ${channel_id || chat_id}.`);

        const generateRandomString = (length: number): string =>
            "demido_" + [...Array(length)].map(() => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_"[Math.random() * 63 | 0]).join("");

        if (parameters[0] === "message" || parameters[0] === "msg") {
            await channel.send(parameters[1]);
            console.log(`Message sent to ${channel.name} (${channel_id || chat_id}) in ${guild.name} (${guild_id}).`);
        }

        else if (parameters[0] === "embed") {
            const embed = new EmbedBuilder()
            if (!["none", "null", "nothing", "empty", "undefined"].includes(parameters[1])) embed.setTitle(parameters[1]);
            if (!["none", "null", "nothing", "empty", "undefined"].includes(parameters[2])) embed.setDescription(parameters[2]);
            if (flags.color) embed.setColor(parseInt(flags.color.replace("#", ""), 16)|| 0x57f287); else embed.setColor(0x57f287);
            if (flags.author) {
                let authorObject: {name: string, iconURL: undefined | string} = {name: flags.author, iconURL: undefined};
                if (!flags.disable_author_icon) authorObject.iconURL = flags.author_icon || "https://www.iprcenter.gov/image-repository/blank-profile-picture.png/@@images/image.png";
                embed.setAuthor(authorObject);
            }
            if (flags.footer) embed.setFooter({text: flags.footer});
            if (flags.thumbnail) embed.setThumbnail(flags.thumbnail);
            if (flags.image) embed.setImage(flags.image);
            if (flags.url) embed.setURL(flags.url);

            await channel.send({ embeds: [embed] });
            console.log(`Embed sent to ${channel.name} (${channel_id || chat_id}) in ${guild.name} (${guild_id}).`);
        }

        else if (["image", "img", "photo", "picture"].includes(parameters[0])) {
            console.log("Sending image...");
            console.log(chalk.gray("(This may take a while)"));
            const fileUrl = parameters[1].replace("/m/", "/").replace(/media\d+/g, "media");
            try {
                const mimeType = (await axios.head(fileUrl)).headers["content-type"];
                if (!mimeType || !mimeType.startsWith("image/")) return console.error("The provided link is not a supported image.");

                const extension = mime.extension(mimeType) || "jpg";
                const finalFileName = (file_name || generateRandomString(28)) + `.${extension}`;
                await channel.send({ files: [{ attachment: fileUrl, name: finalFileName, description: file_description || null }] });
                const clearLines = (lines: number) => {
                    for (let i = 0; i < lines; i++) {
                        process.stdout.moveCursor(0, -1);
                        process.stdout.clearLine(1);
                    }
                };
                clearLines(2);
                console.log(`File sent to ${channel.name} (${channel_id || chat_id}) in ${guild.name} (${guild_id}).`);
            } catch {
                console.error(`Only image files are allowed.\n${fileUrl} is not an image.`);
            }
        }

        else {
            console.error(`Invalid command: ${parameters[0]}. Expected "message" or "msg".`);
        }
    }
};
