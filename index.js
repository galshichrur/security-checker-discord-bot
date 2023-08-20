// Import necessary modules
import { Client, GatewayIntentBits } from "discord.js";
import Utils from "./utils/utils.js";

// Create a new Discord bot client instance with specified intents
const Bot = (global.bot = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.MessageContent,
	],
}));

// Initialize event handling for the bot using the Utils module
Utils.event(Bot);

// Log in the bot using the Utils module
Utils.login(Bot);
