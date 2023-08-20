import Utils from "../utils/utils.js";
import config from "../config.js";
import Discord from "discord.js";
const { ButtonStyle } = Discord;

export default (Bot) => {
	Bot.once("ready", async () => {
		try {
			let securityCheckChannel = Bot.channels.cache.get(
				config.security_check.channel
			);

			if (!securityCheckChannel) {
				console.log("Verify channel is missing or does not exist");
				return;
			}

			// Check for bot messages and filter them
			const messages = await securityCheckChannel.messages.fetch();
			const botMessages = messages.filter(
				(message) => message.author.id === Bot.user.id
			);

			// Check if verify message exists
			if (botMessages.first()) {
				return;
			}

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
