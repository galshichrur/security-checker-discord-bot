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
				let Questions = config.security_check.questions.map((x) => x.name);

				let fields = [];

				[interaction.fields].map((z) =>
					z.fields.map((x) => {
						fields.push(x);
					})
				);

				let Value = fields.map((x) => x.value);
				let Output = Value.map((x, i) => ({
					Questions: Questions[i],
					Value: x,
				}));
				let Content = Output.map(
					(x, index) => `\n **${x.Questions}: ${x.Value}**`
				).join();

				const Channel = interaction.guild.channels.cache.find(
					(x) => x.name === "✅・בידוק-בטחוני" + "-" + interaction.user.id
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
							name: "✅・בידוק-בטחוני" + "-" + interaction.user.id,
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
								embeds: [
									Utils.embed(
										`__**מידע על העובר בדיקת בטחון:**__${interaction.user}\n(\`${interaction.user.id}\`) \n${Content}\nאנא בחנו את עובר בדיקת הבטחון בצורה נטרלית ומקצועית. יש לתחקר את עובר בדיקת הבטחון על מנת להעביר/לא להעביר אותו. \n`,
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
			) {
				await interaction.deferReply({ ephemeral: true });

				interaction.followUp({
					content: `רק מורשים יכולים להשתמש במערכת הבידוק הבטחוני.`,
					ephemeral: true,
				});

				return;
			} else {
				await interaction.update({
					components: [
						new ActionRowBuilder({
							components: [
								ButtonBuilder.from(
									interaction.message.components[0].components[0]
								).setDisabled(true),
								ButtonBuilder.from(
									interaction.message.components[0].components[1]
								),
								ButtonBuilder.from(
									interaction.message.components[0].components[2]
								),
							],
						}),
					],
				});

				interaction.followUp({
					content: `הבידוק הביטחוני אושר בהצלחה!`,
					ephemeral: true,
				});

				interaction.channel.send({
					content: `היי! <@!${interaction.channel.name.replace(
						"✅・בידוק-בטחוני-",
						""
					)}>, הבדיקה הביטחונית אושרה בהצלחה על ידי צוות הבידוק.`,
				});
				return;
			}
		}

		if (interaction.customId === "archiveTicket") {
			await interaction.deferReply({ ephemeral: true });

			if (
				!config.security_check.staff_roles.some((x) =>
					interaction.member.roles.cache.has(x)
				) &&
				![interaction.guild.ownerId].includes(interaction.user.id)
			)
				return interaction.followUp({
					content: `Only authorities can use the security_check archive system.`,
					ephemeral: true,
				});

			if (
				interaction.channel.parentId === config.security_check.archive_category
			)
				return interaction.followUp({
					content: `This security_check is already archived.`,
					ephemeral: true,
				});

			let Parent = interaction.guild.channels.cache.get(
				config.security_check.archive_category
			);

			interaction.channel.permissionOverwrites.delete(
				interaction.channel.name.replace("✅・בידוק-בטחוני-", "")
			);

			interaction.channel
				.setParent(Parent.id, { lockPermissions: false })
				.then(async (x) => {
					x.setName(
						interaction.channel.name.replace("✅・בידוק-בטחוני", "ארכיון")
					);

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

					interaction.followUp({
						content: `Ticket successfully archived.`,
						ephemeral: true,
					});
				});
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
