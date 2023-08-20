import Fs from "fs";
import Discord from "discord.js";
const {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	TextInputBuilder,
	ModalBuilder,
	Colors,
} = Discord;
import config from "../config.js";
class Utils {
	static login(Bot) {
		Bot.login(config.token ? config.token : process.env.token)
			.then(() =>
				console.log(
					`Security Checker bot is active!`,
					`Thanks for using security checker bot, made with 💜 by MaybeGal.`
				)
			)
			.catch((err) => console.log("" + err));
	}

	static event(Bot) {
		Fs.readdirSync("./events").forEach(async (file) => {
			const Event = await import(`../events/${file}`).then((x) => x);

			Event.default(Bot);
		});
	}

	static embed(Content, Guild, Bot, User) {
		const Embed = new EmbedBuilder()
			.setAuthor({
				name: `${Guild.name}`,
				iconURL: Guild.iconURL({ dynamic: true }),
			})
			.setDescription(Content)
			.setColor(Colors.DarkNavy)
			.setFooter({
				text: "Security Checker By MaybeGal",
				iconURL: Bot.user.avatarURL({ dynamic: true }),
			})
			.setThumbnail(
				User
					? User.avatarURL({ dynamic: true })
					: Guild.iconURL({ dynamic: true })
			);

		return Embed;
	}

	static button(style, label, emoji, id, disabled) {
		const Row = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId(id)
				.setLabel(label)
				.setStyle(style)
				.setEmoji(emoji)
				.setDisabled(disabled)
		);

		return Row;
	}

	static securityCheckVerifyButton() {
		let Buttons = [];

		config.security_check.buttons.map((x) => {
			const Button = new ButtonBuilder()
				.setCustomId(x.id)
				.setLabel(x.label)
				.setStyle(x.style)
				.setEmoji(x.emote)
				.setDisabled(x.disabled);

			Buttons.push(Button);
		});

		let Row = new ActionRowBuilder().addComponents(Buttons);

		return Row;
	}

	static modal() {
		let Inputs = [];

		config.security_check.questions.map((v) => {
			const Input = new TextInputBuilder()
				.setCustomId(v.id)
				.setLabel(v.label)
				.setStyle(v.style)
				.setMinLength(v.min_length)
				.setMaxLength(v.max_length)
				.setPlaceholder(v.place_holder)
				.setRequired(v.required);

			Inputs.push(Input);
		});

		let Modals = new ModalBuilder()
			.setCustomId("securityCheck")
			.setTitle("Security Check Request");

		let Row = [];
		Inputs.map((x) => Row.push(new ActionRowBuilder().addComponents([x])));
		Modals.addComponents(Row);

		return Modals;
	}
}

export default Utils;
