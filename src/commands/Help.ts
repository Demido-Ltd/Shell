// TODO: Add Documentation
export default {
    name: "help",
    aliases: ["h", "?"],
    execute: async (parameters: string[]) => {
        console.log("TODO: Write the \"help\" command" + (parameters.length > 0 && parameters[0].length > 0 ? ` for "${parameters[0]}"` : ""));
    }
};
