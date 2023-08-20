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
								content: `@everyone`,
								embeds: [
									Utils.embed(
										`__**מידע על העובר בדיקת בטחון:**__
										${interaction.user.id} (\`${interaction.user.id}\`)
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
				!config.security_check.staff_roles.some((x) =>
					interaction.member.roles.cache.has(x)
				) &&
				![interaction.guild.ownerId].includes(interaction.user.id)
			)
				return interaction.followUp({
					content: `רק מורשים יכולים להשתמש במערכת הבידוק הבטחוני.`,
					ephemeral: true,
				});

			if (
				interaction.channel.parentId === config.security_check.archive_category
			)
				return interaction.followUp({
					content: `חדר זה כבר נמצא בארכיון`,
					ephemeral: true,
				});

			const userToRole = interaction.guild.members.cache.get(
				interaction.channel.name.replace("🚓・", "")
			);

			if (userToRole) {
				const verifiedRole = interaction.guild.roles.cache.get(
					config.security_check.verified_roles
				);

				if (verifiedRole) {
					userToRole.roles.add(verifiedRole).catch((error) => {
						console.error("Failed to add role to user:", error);
					});
				}
			}

			interaction.channel.send({
				content: `היי <@!${interaction.channel.name.replace(
					"🚓・",
					""
				)}>הבדיקה הביטחונית אושרה בהצלחה על ידי צוות הבידוק. חדר זה יעבור לארכיון בעוד כ60 שניות.`,
			});

			setTimeout(function () {
				let Parent = interaction.guild.channels.cache.get(
					config.security_check.archive_category
				);

				interaction.channel.permissionOverwrites.delete(
					interaction.channel.name.replace("🚓・", "")
				);

				interaction.channel
					.setParent(Parent.id, { lockPermissions: false })
					.then(async (x) => {
						x.setName(interaction.channel.name.replace("🚓・", "ארכיון"));

						interaction.message.edit({
							embeds: [
								Utils.embed(
									interaction.message.embeds.map((x) => x.description).join(""),
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
			}, 60000);
		}
		/*
		if (interaction.customId === "deleteTicket") {
			await interaction.deferReply({ ephemeral: true });

			let User = interaction.channel.name.replace("✅・בידוק-בטחוני-", "");

			if ([User].includes(interaction.user.id)) {
				if (
					interaction.message.components[0].components[0].data.disabled === true
				)
					return interaction.followUp({
						content: `The support request has been approved by the authorities, you can no longer delete it.`,
						ephemeral: true,
					});
			} else {
				if (
					!config.security_check.staff_roles.some((x) =>
						interaction.member.roles.cache.has(x)
					) &&
					![interaction.guild.ownerId].includes(interaction.user.id)
				)
					return;
			}

			interaction.followUp({
				content: `Your request has been received successfully after \`5 seconds\` the channel will be deleted automatically.`,
				ephemeral: true,
			});

			setTimeout(() => {
				interaction.channel.delete().catch(() => {
					return undefined;
				});
			}, 1000 * 5);
		}
		*/
	});
};
