import config from "../config.js";
import Discord from "discord.js";
const { ActivityType } = Discord;

export default (Bot) => {
	Bot.on("ready", () => {
		Bot.user.setActivity({
			name: config.activity_status.name,
			type: ActivityType.Playing,
		});
	});
};
