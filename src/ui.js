import { Texture, Sheet, PaneUI } from "https://superwibr.github.io/PaneUI/lib/PaneUI.js";
import { ForgeStep } from "./ForgeRule.js";

const width = 176;
const height = 112;
const state = {
	target: 0,
	head: 0,
	medal: -1
};

const a = p => new URL(p, new URL("../assets/textures/", import.meta.url));

const anvil = await Sheet(a("./anvil.png"));
const actionIcons = await Sheet(a("./actionIcons.png"));
const bonusIcons = await Sheet(a("./bonuses.png"));
const recipe_icons = {
	brass_sheet: await Texture(a("./recipe_icons/brass_sheet.png")),
	bronze_axe_head: await Texture(a("./recipe_icons/bronze_axe_head.png")),
	high_carbon_steel: await Texture(a("./recipe_icons/high_carbon_steel.png")),
	wrought_iron_tuyere: await Texture(a("./recipe_icons/wrought_iron_tuyere.png")),
};
const medals = await Sheet(a("./medals.png"));

const background = {
	type: "static",
	elements: [{ texture: anvil.texture(0, 0, width, height) }]
};

const stepMap = {
	EMPTY: ["EMPTY", null, null, 9]
};
Object.entries(ForgeStep).forEach(([name, step]) => {
	if (!step.iconX) return;
	stepMap[name] = step;
});

const stepButtons = {
	type: "static",
	elements: Object.entries(stepMap).filter(s => s[1].iconX).map(([name, step]) => ({
		name: name,
		x: step.iconX, y: step.iconY,
		width: 16,
		height: 16,
		texture: actionIcons.texture(step.iconS * 32, 0, 32, 32),
		area: {}
	}))
};

const cursors = {
	elements: [
		["head", 1],
		["target", 0]
	].map(c => ({
		name: c[0],
		update: me => me.x = 11 + state[c[0]],
		y: 94 + c[1] * 6,
		texture: anvil.texture(!c[1] * 5, 112, 5, 5)
	}))
};

const lastThree = {
	type: "static",
	name: "three-ops",
	ops: [null, null, null], // set by smithing.js
	elements: [0, 1, 2].map(s => ({
		x: 102 - s * 19,
		y: 31,
		width: 10,
		height: 10,
		update: me => me.texture = actionIcons.texture(lastThree.ops[s]?.iconS * 32, 0, 32, 32)
	}))
};

const rulesDisplay = [0, 1, 2].map(i => {
	const xOffset = i * 19;

	const ruleLayer = {
		name: `rule_${i}`,
		type: "static",

		// set by smithing.js
		rule: null,
		matched: false,

		elements: [
			{
				// action icon
				x: 64 + xOffset,
				y: 10,
				width: 10,
				height: 10,
				update: me => me.texture = actionIcons.texture(ruleLayer.rule ? ruleLayer.rule.iconS() * 32 : 288, 0, 32, 32)
			},
			{
				// overlay
				x: 59 + xOffset,
				y: 7,
				update: me => me.texture = anvil.texture(196 + 20 * ruleLayer.matched, ruleLayer.rule ? ruleLayer.rule.overlayY() : 132, 20, 22)
			}
		]
	}

	return ruleLayer;
});

const resultsDisplay = {
	type: "static",
	name: "results",

	results: [], // set by smithing.js

	elements: [0, 1, 2, 3].map(i => ({
		x: 12,
		y: 13 + 18 * i,
		width: 18,
		height: 18,
		update: me => me.texture = bonusIcons.texture(4 + resultsDisplay.results[i] * 32, 4, 24, 24)
	}))
};

const recipeButtons = {
	type: "static",

	elements: [
		["reduce", "high_carbon_steel"],
		["tuyere", "wrought_iron_tuyere"],
		["sheet", "brass_sheet"],
		["axe_head", "bronze_axe_head"]
	].map(([name, texture], i) => ({
		name,
		x: 146 + 1,
		y: 13 + 1 + 18 * i,
		width: 16,
		height: 16,
		update: me => me.texture = recipe_icons[texture],
		area: {}
	}))
};

const medal = {
	elements: [{
		x: 34,
		y: 14,
		width: 16,
		height: 34,
		update: me => me.texture = medals.texture(state.medal * 16, 0, 16, 34)
	}]
}

const createUI = (container, canvas) => {
	const pane = PaneUI({
		container, canvas,
		width, height,
		layers: [
			background,
			stepButtons,
			cursors,
			lastThree,
			...rulesDisplay,
			resultsDisplay,
			recipeButtons,
			medal
		]
	});

	return {
		pane,
		state
	};
};

export { createUI };