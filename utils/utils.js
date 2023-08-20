// Import required modules
import Fs from "fs";
import Discord from "discord.js";

// Destructure specific components from the Discord module
const {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	TextInputBuilder,
	ModalBuilder,
	Colors,
} = Discord;

// Import the configuration file
import config from "../config.js";

// Define a Utils class
class Utils {
	// Method to log in the bot using the provided token or environment variable
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

	// Method to handle event registration
	static event(Bot) {
		// Read event files from the "./events" directory
		Fs.readdirSync("./events").forEach(async (file) => {
			// Import each event and execute its default function
			const Event = await import(`../events/${file}`).then((x) => x);
			Event.default(Bot);
		});
	}

	// Method to create an embed with specified content, guild, bot, and user information
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

	// Method to create a button component
	static button(style, label, emoji, id, disabled) {
		// Create an action row with a single button
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

	// Method to create action row with security check verification buttons
	static securityCheckVerifyButton() {
		let Buttons = [];

		// Iterate through the defined buttons in the configuration
		config.security_check.buttons.map((x) => {
			// Create a button component for each defined button
			const Button = new ButtonBuilder()
				.setCustomId(x.id)
				.setLabel(x.label)
				.setStyle(x.style)
				.setEmoji(x.emote)
				.setDisabled(x.disabled);

			Buttons.push(Button);
		});

		// Create an action row with the generated buttons
		let Row = new ActionRowBuilder().addComponents(Buttons);

		return Row;
	}

	// Method to create a modal component with text input fields
	static modal() {
		let Inputs = [];

		// Iterate through the defined questions in the configuration
		config.security_check.questions.map((v) => {
			// Create a text input component for each defined question
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

		// Create a modal with a title and components for each text input field
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
