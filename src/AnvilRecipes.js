import { ForgeRules } from "./ForgeRule.js";

const AnvilRecipes = {
    AXE_HEAD: [ForgeRules.PUNCH_LAST, ForgeRules.HIT_SECOND_LAST, ForgeRules.UPSET_THIRD_LAST],
    SHEET: [ForgeRules.HIT_LAST, ForgeRules.HIT_SECOND_LAST, ForgeRules.HIT_THIRD_LAST],
    TUYERE: [ForgeRules.BEND_LAST, ForgeRules.BEND_SECOND_LAST],
    REDUCE: []
};

export { AnvilRecipes };