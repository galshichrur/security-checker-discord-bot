import Utils from "../utils/utils.js";
import config from "../config.js";
import Discord from "discord.js";
const {
	ButtonBuilder,
	ActionRowBuilder,
	PermissionFlagsBits,
	InteractionType,
	ChannelType,
} = Discord;

export default (Bot) => {
	Bot.on("interactionCreate", async (interaction) => {
		if (interaction.type === InteractionType.ModalSubmit) {
			if (interaction.customId === "securityCheck") {
				let QuestionName = config.security_check.questions.map((x) => x.name);

				let fields = [];

				[interaction.fields].map((z) =>
					z.fields.map((x) => {
						fields.push(x);
					})
				);

				let Value = fields.map((x) => x.value);

				let Output = Value.map((x, i) => ({
					QuestionName: QuestionName[i],
					Value: x,
				}));

				let Content = Output.map(
					(x, index) => `\n**${x.QuestionName}: ${x.Value}**`
				).join();

				const Channel = interaction.guild.channels.cache.find(
					(x) => x.name === "🚓・" + interaction.user.username
				);

				await interaction.deferReply({ ephemeral: true });

				if (Channel) {
					interaction.followUp({
						content: `כבר יש לך בקשה לבידוק בטחוני`,
						ephemeral: true,
					});
				} else {
					let PermissionsArray = [
						{
							id: interaction.user.id,
							allow: [
								PermissionFlagsBits.ViewChannel,
								PermissionFlagsBits.ReadMessageHistory,
								PermissionFlagsBits.SendMessages,
							],
						},
						{
							id: interaction.guild.id,
							deny: [PermissionFlagsBits.ViewChannel],
						},
					];

					config.security_check.staff_roles.map((x) => {
						PermissionsArray.push({
							id: x,
							allow: [
								PermissionFlagsBits.ViewChannel,
								PermissionFlagsBits.ReadMessageHistory,
								PermissionFlagsBits.SendMessages,
							],
						});
					});

					interaction.guild.channels
						.create({
							name: "🚓・" + interaction.user.username,
							topic: "בידוק בטחוני ל-" + interaction.user.id,
							type: ChannelType.GuildText,
							parent: config.security_check.category,
							permissionOverwrites: PermissionsArray,
						})
						.then(async (Channel) => {
							interaction.followUp({
								content: "בקשת הבידוק בטחוני עברה בהצלחה!",
								ephemeral: true,
							});

							Channel.send({
								content: `[||@everyone||]`,
								embeds: [
									Utils.embed(
										`__**מידע על העובר בדיקת בטחון:**__
										${interaction.user} (\`${interaction.user.id}\`)
										${Content}
										\n\`אנא בחנו את עובר בדיקת הבטחון בצורה נטרלית ומקצועית. יש לתחקר את החשוד על מנת להעביר/לא להעביר אותו.\`
										\n`,
										interaction.guild,
										Bot,
										interaction.user
									),
								],
								components: [Utils.securityCheckVerifyButton()],
							});
						});
				}
			}
		}

		if (!interaction.isButton()) return;

		if (interaction.customId === "securityCheck") {
			await interaction.showModal(Utils.modal());
		}

		if (interaction.customId === "successSecurityCheck") {
			if (
				interaction.channel.parentId === config.security_check.archive_category
			)
				return interaction.followUp({
					content: `חדר זה כבר נמצא בארכיון`,
					ephemeral: true,
				});
			if (
				!config.security_check.staff_roles.some((x) =>
					interaction.member.roles.cache.has(x)
				) &&
				![interaction.guild.ownerId].includes(interaction.user.id)
			) {
				await interaction.deferReply({ ephemeral: true });

				return interaction.followUp({
					content: `רק מורשים יכולים להשתמש במערכת הבידוק הבטחוני.`,
					ephemeral: true,
				});
			} else {
				// Find the existing buttons
				const existingButtons = interaction.message.components[0].components;

				// Update the properties of the existing buttons to set them as disabled
				existingButtons[0] = ButtonBuilder.from(existingButtons[0]).setDisabled(
					true
				);
				existingButtons[1] = ButtonBuilder.from(existingButtons[1]).setDisabled(
					true
				);

				// Update the message with the modified components
				await interaction.update({
					components: [
						new ActionRowBuilder({
							components: existingButtons,
						}),
					],
				});

				interaction.followUp({
					content: `אישרת בהצלחה את בדיקת הבטחון.`,
					ephemeral: true,
				});

				const userId = interaction.channel.topic.replace("בידוק בטחוני ל-", "");
				const member = interaction.guild.members.cache.get(userId);

				const verifiedRole = await interaction.guild.roles.fetch(
					config.security_check.verified_roles
				);

				member.roles.add(verifiedRole).catch(console.error);

				interaction.channel.send({
					content: `[✅] היי <@!${userId}>, הבדיקה הביטחונית אושרה בהצלחה על ידי צוות הבידוק. חדר זה יעבור לארכיון בעוד כ15 שניות.`,
				});

				setTimeout(() => {
					let Parent = interaction.guild.channels.cache.get(
						config.security_check.archive_category
					);

					interaction.channel.permissionOverwrites.delete(userId);

					interaction.channel
						.setParent(Parent.id, { lockPermissions: true })
						.then(async (x) => {
							x.setName(interaction.channel.name.replace("🚓", "📁✅"));
							interaction.message.edit({
								embeds: [
									Utils.embed(
										interaction.message.embeds
											.map((x) => x.description)
											.join(""),
										interaction.guild,
										Bot,
										""
									),
								],
								components: [],
							});
						});

					interaction.channel.send({
						content: `החשוד אומת בהצלחה וחדר זה עבר לארכיון.`,
					});
				}, 15000);
			}
		}

		if (interaction.customId === "failSecurityCheck") {
			if (
				interaction.channel.parentId === config.security_check.archive_category
			)
				return interaction.followUp({
					content: `חדר זה כבר נמצא בארכיון`,
					ephemeral: true,
				});
			if (
				!config.security_check.staff_roles.some((x) =>
					interaction.member.roles.cache.has(x)
				) &&
				![interaction.guild.ownerId].includes(interaction.user.id)
			) {
				await interaction.deferReply({ ephemeral: true });

				return interaction.followUp({
					content: `רק מורשים יכולים להשתמש במערכת הבידוק הבטחוני.`,
					ephemeral: true,
				});
			} else {
				// Find the existing buttons
				const existingButtons = interaction.message.components[0].components;

				// Update the properties of the existing buttons to set them as disabled
				existingButtons[0] = ButtonBuilder.from(existingButtons[0]).setDisabled(
					true
				);
				existingButtons[1] = ButtonBuilder.from(existingButtons[1]).setDisabled(
					true
				);

				// Update the message with the modified components
				await interaction.update({
					components: [
						new ActionRowBuilder({
							components: existingButtons,
						}),
					],
				});

				interaction.followUp({
					content: `פסלת בהצלחה את בדיקת הבטחון.`,
					ephemeral: true,
				});

				const userId = interaction.channel.topic.replace("בידוק בטחוני ל-", "");

				interaction.channel.send({
					content: `[❌] היי <@!${userId}>, הבדיקה הביטחונית נכשלה על ידי צוות הבידוק. חדר זה יעבור לארכיון בעוד כ15 שניות.`,
				});

				setTimeout(() => {
					let Parent = interaction.guild.channels.cache.get(
						config.security_check.archive_category
					);

					interaction.channel.permissionOverwrites.delete(userId);

					interaction.channel
						.setParent(Parent.id, { lockPermissions: true })
						.then(async (x) => {
							x.setName(interaction.channel.name.replace("🚓", "📁❌"));
							interaction.message.edit({
								embeds: [
									Utils.embed(
										interaction.message.embeds
											.map((x) => x.description)
											.join(""),
										interaction.guild,
										Bot,
										""
									),
								],
								components: [],
							});
						});

					interaction.channel.send({
						content: `החשוד נכשל וחדר זה עבר לארכיון.`,
					});
				}, 15000);
			}
		}
	});
};
