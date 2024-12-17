import { AnvilRecipes } from "./AnvilRecipes.js";
import { calculateOptimalStepsToTarget, ForgeStep } from "./ForgeRule.js";
import { ForgingBonus } from "./ForgingBonus.js";
import { cyrbsfcd } from "./random.js";
import { playsound } from "./sfx.js";
import { createUI } from "./ui.js";

const container = document.querySelector(".smithui");
const canvas = container.children[0];

const { pane, state: uiState } = createUI(container, canvas);

const ui = {
	// reds
	light_hit: pane.element("HIT_LIGHT"),
	medium_hit: pane.element("HIT_MEDIUM"),
	heavy_hit: pane.element("HIT_HARD"),
	draw: pane.element("DRAW"),

	// greens
	punch: pane.element("PUNCH"),
	bend: pane.element("BEND"),
	upset: pane.element("UPSET"),
	shrink: pane.element("SHRINK"),

	// heads
	target: pane.element("target"),
	head: pane.element("head"),

	// last three ops
	op_0: pane.element("op_0"),
	op_1: pane.element("op_1"),
	op_2: pane.element("op_2"),

	// recipe select buttons
	reduce: pane.element("reduce"),
	tuyere: pane.element("tuyere"),
	sheet: pane.element("sheet"),
	axe_head: pane.element("axe_head")
};

const barlength = 150;
const targetlength = 74;
const targetoffset = 40;
const state = {
	target: 0,
	head: 0,
	ops: [],
	rules: AnvilRecipes.REDUCE,
	steps: 0,
	optimalSteps: 0,
	attempt: 0,
	attempts: [],
	processing: false,
};

const makeTarget = () => {
	const rand = location.search
		? cyrbsfcd(location.search, 8)
		: Math.random();

	state.target = Math.floor(rand * targetlength) + targetoffset;
	updateHeads();

	state.optimalSteps = calculateOptimalStepsToTarget(state.target, state.rules);
};

const checkRules = () => {
	const lastSteps = state.ops.toReversed();
	const matches = state.rules.map(rule => rule.matches(...lastSteps));
	const match = matches.every(m => m);

	return { matches, match };
};

const doOp = name => {
	if (state.processing) return;

	const move = ForgeStep[name];
	const step = move.step;

	if (!step) return;

	if (state.head + step > barlength) {
		if (state.head == barlength) return console.log("Can't move beyond the end (150)");
		state.head = barlength;
	} else if (state.head + step < 0) {
		if (state.head == 0) return console.log("can't move before the start (0)");
		state.head = 0;
	} else {
		state.head += step;
	}

	state.ops.push(move);
	state.ops.shift();
	state.steps++;

	console.log(`head: ${state.head} (${Math.sign(step) == 1 ? "+" : ""}${step})`);

	const ruleCheck = checkRules();
	updateRules(ruleCheck.matches);

	if (state.head == state.target && ruleCheck.match) {
		// successful forging
		const ratio = state.steps / state.optimalSteps;
		const bonus = ForgingBonus.getByRatio(ratio);

		console.log(ratio);
		console.log(`You smithed successfully! ${bonus.adverb} forged (target was ${state.target})`);

		finishAttempt(ratio);
	}

	playsound("hit");

	updateHeads();
	updateOperations();
};

const finishAttempt = (ratio, success = true) => {
	state.attempts[state.attempt] = {
		ratio,
		success
	}
	state.attempt++;

	console.log(state.attempts);

	// reset
	state.processing = true;
	playsound(success ? "anvil_use" : "anvil_break");
	setTimeout(() => {
		reset();
		updateHeads();
		updateRules([false, false, false]);
		updateResults();
		updateOperations();

		// lock game after end
		if (state.attempt < state.attempts.length) {
			state.processing = false;
		} else {
			uiState.medal = ForgingBonus.getByRatio(state.attempts.sort((a, b) => a.ratio - b.ratio)[0].ratio).iconOffset;
		}

	}, 900);
};

const selectRecipe = name => {
	reset(true);

	state.rules = AnvilRecipes[name];

	updateHeads();
	updateRules([false, false, false]);
	updateResults();
	updateOperations();
};

const reset = (full = false) => {
	state.head = 0;
	state.ops = new Array(3).fill(null);
	state.steps = 0;
	if (full) {
		state.attempt = 0;
		state.attempts = new Array(4).fill(null);
		uiState.medal = -1;
		state.processing = false;
	}
};

const updateHeads = () => {
	uiState.target = state.target;
	uiState.head = state.head;
};

const opsLayer = pane.layer("three-ops");
const updateOperations = () => {
	opsLayer.ops = state.ops;
	opsLayer.cached = false;
};

const updateRules = (matches) => {
	matches.forEach((match, i) => {
		const ruleLayer = pane.layer(`rule_${i}`);
		ruleLayer.matched = match;
		ruleLayer.rule = state.rules[i];
		ruleLayer.cached = false;
	})
};

const resultsLayer = pane.layer("results");
const updateResults = () => {
	resultsLayer.results = state.attempts
		.map(a => {
			// console.log(a, a === null, a?.success);
			return a === null ? null : a.success
				? ForgingBonus.getByRatio(a.ratio)
				: ForgingBonus.overworkedBonus
		})
		.map(a => a?.iconOffset || -32);
	resultsLayer.cached = false;
};

container.addEventListener("click", e => {
	switch (e.target) {
		// Actions
		case ui.light_hit.areaElement: return doOp("HIT_LIGHT");
		case ui.medium_hit.areaElement: return doOp("HIT_MEDIUM");
		case ui.heavy_hit.areaElement: return doOp("HIT_HARD");
		case ui.draw.areaElement: return doOp("DRAW");

		case ui.punch.areaElement: return doOp("PUNCH");
		case ui.bend.areaElement: return doOp("BEND");
		case ui.upset.areaElement: return doOp("UPSET");
		case ui.shrink.areaElement: return doOp("SHRINK");

		// Selecting recipes
		case ui.reduce.areaElement: return selectRecipe("REDUCE");
		case ui.tuyere.areaElement: return selectRecipe("TUYERE");
		case ui.sheet.areaElement: return selectRecipe("SHEET");
		case ui.axe_head.areaElement: return selectRecipe("AXE_HEAD");
	}
});

reset(true);
makeTarget();
updateRules([false, false, false]);

const drawLoop = () => {
	pane.render();
	requestAnimationFrame(drawLoop);
};
drawLoop();

const audioLoop = () => {
	playsound("blastfurnace");
	setTimeout(audioLoop, 1000);
};
audioLoop();

window.pane = pane;
window.state = state;