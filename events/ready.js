// Import the configuration module
import config from "../config.js";

// Import the Discord.js library
import Discord from "discord.js";

// Destructure ActivityType from Discord
const { ActivityType } = Discord;

// Export a function that takes a Bot parameter
export default (Bot) => {
	// Set up a listener for when the bot is ready
	Bot.on("ready", () => {
		// Set the bot's activity status using configuration values
		Bot.user.setActivity({
			name: config.activity_status.name, // Set the activity name from config
			type: ActivityType.Playing, // Set the activity type to "Playing"
		});
	});
};
