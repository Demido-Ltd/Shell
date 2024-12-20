import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";

type ErrorType = 'missing' | 'invalid' | 'invalidDefault' | 'emptyString' | 'invalidFormat';

interface ENVError {
    key: string;
    errorCode: number;
    errorMessage: string;
}

/**
 * Utility class for sanitizing and validating configuration variables defined in the .env file.
 * This class checks for required variables, validates their formats, and provides error reporting.
 * @author [Stefan Cucoranu](https://github.com/elpideus)
 */
export default class ENVSanitizer {
    private static readonly requiredEnvVars = [
        { key: "DISCORD_BOT", type: "boolean", default: "true", allowDefault: true },
        { key: "TELEGRAM_BOT", type: "boolean", default: "true", allowDefault: true },
        { key: "DISCORD_BOT_TOKEN", type: "string", default: "Place your bot token here", allowDefault: false },
        { key: "DISCORD_BOT_CLIENT_ID", type: "string", default: "Place your bot client ID here", allowDefault: false },
        { key: "CLI_PREFIX", type: "string", default: "[DEMIDO] -> ", allowDefault: true },
    ];

    private static errorMessages = {
        missing: (key: string) => `Configuration value for ${key} is missing.`,
        invalidDefault: (key: string, current: string) => `Default configuration value for ${key} is not allowed.` + (current ? chalk.gray(` ${current}`) : ""),
        invalidFormat: (key: string, current: string) => `Configuration value for ${key} is invalid.` + (current ? chalk.gray(` ${current}`) : ""),
        emptyString: (key: string) => `Configuration value for ${key} cannot be an empty string.`,
    };

    private static ERROR_CODES: Record<ErrorType, number> = { missing: 2, invalid: 1, invalidDefault: 1, emptyString: 3, invalidFormat: 4 };

    /**
     * Checks the required environment variables and returns an array of errors, if any.
     * @returns {ENVError[]} An array of ENVError objects detailing any issues found.
     */
    public static check = (): ENVError[] => {
        return this.requiredEnvVars.map(({ key, type, default: def, allowDefault }) => {
            const value = process.env[key];
            if (!value) return { key, errorCode: this.ERROR_CODES.missing, errorMessage: this.errorMessages.missing(key) };
            if (value === def && !allowDefault) return { key, errorCode: this.ERROR_CODES.invalidDefault, errorMessage: this.errorMessages.invalidDefault(key, value) };
            if (key === "DISCORD_BOT_CLIENT_ID" && !/^\d{19}$/.test(value)) return { key, errorCode: this.ERROR_CODES.invalidFormat, errorMessage: this.errorMessages.invalidFormat(key, value) };
            if (type === "boolean" && !["true", "false", "0", "1", "yes", "no", "y", "n"].includes(value.toLowerCase())) return { key, errorCode: this.ERROR_CODES.invalidFormat, errorMessage: this.errorMessages.invalidFormat(key, value) };
            if (type === "string" && !value.trim()) return { key, errorCode: this.ERROR_CODES.emptyString, errorMessage: this.errorMessages.emptyString(key) };
        }).filter((error): error is ENVError => Boolean(error)) || [];
    };

    /**
     * Analyzes the .env file for required variables, validates their values,
     * and updates them if necessary, logging any errors found.
     * @returns {Promise<void>}
     */
    public static sanitize = async (): Promise<void> => {
        console.log("Analyzing .env...");
        const errors = this.check();
        if (!errors.length) return console.clear();

        const filteredErrors = errors.filter(error => {
            return !(process.env.DISCORD_BOT && error.key.includes("DISCORD"));
        });

        filteredErrors.forEach((error) => {
            console.error(error.errorMessage);
        });

        if (filteredErrors.length > 0) console.error(`! Found ${filteredErrors.length} errors in .env !`);
        const defaultErrors = filteredErrors.filter(e => e.errorCode === 1).length;

        if (defaultErrors < filteredErrors.length) {
            console.log("Copying contents of .env to .env.bckp");
            fs.copyFileSync(path.join(process.cwd(), ".env"), path.join(process.cwd(), ".env.bckp"));
            console.log("Starting sanitization process...");
            await Promise.all(filteredErrors.map(e => this.updateEnvIfNeeded(e.key)));
            console.log("Sanitization process completed.");
        }
    };

    /**
     * Updates the .env file if the specified variable is missing or has an invalid value.
     * @private
     * @param {string} key - The key of the environment variable to check and potentially update.
     * @returns {Promise<void>}
     */
    private static updateEnvIfNeeded = async (key: string): Promise<void> => {
        const envVar = this.requiredEnvVars.find(v => v.key === key);
        if (!envVar || process.env[key] === envVar.default) return;
        try {
            const data = await fs.promises.readFile(path.join(process.cwd(), ".env"), 'utf8');
            const updatedEnv = data.split('\n').map(line => line.startsWith(`${key}=`) ? `${key}="${envVar.default}"` : line).join('\n');
            await fs.promises.writeFile(path.join(process.cwd(), ".env"), updatedEnv, 'utf8');
            console.log(chalk.green(`Updated "${key}" in .env to "${envVar.default}"`));
        } catch (e) { console.error('Error updating .env file:', e); }
    };
}
