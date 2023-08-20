import Discord from "discord.js";
const { ButtonStyle, TextInputStyle } = Discord;

//config
export default {
	token:
		"MTE0MjIxMDE4MzUzMjEyNjMxMg.GFXg5E.eZODctxICdiL3K7j-AoG3886IXb793jTE58ODQ",
	activity_status: { name: "נשק יש?", type: "PLAYING" },
	guild_id: "1141449357988728903",
	security_check: {
		channel: "1142210688568275065",
		category: "1142211137140703312",
		archive_category: "1142153346048864306",
		message:
			"על מנת לקבל גישה לצפות בשרת, עליך לעבור בידוק בטחוני. אנא לחץ על אימות.",
		staff_roles: ["1142153054217568256"],
		buttons: [
			{
				style: ButtonStyle.Success,
				label: "עבר",
				emote: "✅",
				id: "successSecurityCheck",
				disabled: false,
			},
			{
				style: ButtonStyle.Danger,
				label: "לא עבר",
				emote: "❌",
				id: "failedSecurityCheck",
				disabled: false,
			},
		],
		questions: [
			{
				id: "name",
				name: "שם",
				label: "מה השם שלך?",
				style: TextInputStyle.Short,
				min_length: 0,
				max_length: 16,
				place_holder: "איתמר",
				required: true,
			},
			{
				id: "gender",
				name: "מגדר",
				label: "מה המגדר שלך?",
				style: TextInputStyle.Short,
				min_length: 0,
				max_length: 4,
				place_holder: "זכר/נקבה/אחר",
				required: true,
			},
			{
				id: "age",
				name: "גיל",
				label: "מה הגיל שלך?",
				style: TextInputStyle.Short,
				min_length: 0,
				max_length: 2,
				place_holder: "8",
				required: true,
			},
		],
	},
};
