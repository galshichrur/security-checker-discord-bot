// Import required modules
import Utils from "../utils/utils.js";
import config from "../config.js";
import Discord from "discord.js";
const { ButtonStyle } = Discord;

// Export a function that sets up behavior when the bot is ready
export default (Bot) => {
	Bot.once("ready", async () => {
		try {
			// Get the security check channel using the channel ID from config
			let securityCheckChannel = Bot.channels.cache.get(
				config.security_check.channel
			);

			// Check if the security check channel is missing or does not exist
			if (!securityCheckChannel) {
				console.log("Verify channel is missing or does not exist");
				return;
			}

			// Fetch all messages in the security check channel
			const messages = await securityCheckChannel.messages.fetch();

			// Filter out messages authored by the bot
			const botMessages = messages.filter(
				(message) => message.author.id === Bot.user.id
			);

			// Check if a verification message already exists
			if (botMessages.first()) {
				return;
			}

			// Send a verification message with an embed and a button
			securityCheckChannel.send({
				embeds: [
					Utils.embed(
						config.security_check.message,
						securityCheckChannel.guild,
						Bot,
						""
					),
				],
				components: [
					Utils.button(
						ButtonStyle.Primary,
						"בידוק",
						"🎫",
						"securityCheck",
						false
					),
				],
			});
		} catch (error) {
			console.log(error);
		}
	});
};
