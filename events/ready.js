import config from "../config.js";

export default (Bot) => {
	Bot.on("ready", () => {
		Bot.user.setActivity({
			name: config.activity_status.name,
			type: config.activity_status.type,
		});
	});
};
