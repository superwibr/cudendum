// Define ForgeStep constants with precomputed paths and methods
const ForgeStep = (() => {
    const ops = {
        HIT_LIGHT: { step: -3, iconX: 53, iconY: 50, iconS: 4 },
        HIT_MEDIUM: { step: -6, iconX: 71, iconY: 50, iconS: 5 },
        HIT_HARD: { step: -9, iconX: 53, iconY: 68, iconS: 6 },
        DRAW: { step: -15, iconX: 71, iconY: 68, iconS: 7 },

        PUNCH: { step: 2, iconX: 89, iconY: 50, iconS: 0 },
        BEND: { step: 7, iconX: 107, iconY: 50, iconS: 1 },
        UPSET: { step: 13, iconX: 89, iconY: 68, iconS: 2 },
        SHRINK: { step: 16, iconX: 107, iconY: 68, iconS: 3 },
    };

    const LIMIT = 150;
    const PATHS = Array(LIMIT).fill(-1);
    PATHS[0] = 0;

    const queue = [0];
    let reached = 1;

    for (let steps = 1; reached < LIMIT; steps++) {
        const nextQueue = [];
        for (const value of queue) {
            Object.values(ops).forEach(({ step }) => {
                const nextValue = value + step;
                if (nextValue >= 0 && nextValue < LIMIT && PATHS[nextValue] === -1) {
                    PATHS[nextValue] = steps;
                    nextQueue.push(nextValue);
                    reached++;
                }
            });
        }
        queue.length = 0;
        Array.prototype.push.apply(queue, nextQueue);
    }

    const getOptimalStepsToTarget = (target) => {
        return target < 0 || target >= PATHS.length ? Number.MAX_SAFE_INTEGER : PATHS[target];
    };

    return {
        ...ops,
        LIMIT,
        getOptimalStepsToTarget,
    };
})();

// Define the Order Enum
const Order = {
    ANY: { y: 88 },
    LAST: { y: 0 },
    NOT_LAST: { y: 66 },
    SECOND_LAST: { y: 22 },
    THIRD_LAST: { y: 44 },
};

// ForgeRule Class
class ForgeRule {
    constructor(order, type) {
        this.order = order;
        this.type = type;
    }

    matches = (last, secondLast, thirdLast) => {
        switch (this.order) {
            case Order.ANY:
                return this.matchesStep(last) || this.matchesStep(secondLast) || this.matchesStep(thirdLast);
            case Order.NOT_LAST:
                return this.matchesStep(secondLast) || this.matchesStep(thirdLast);
            case Order.LAST:
                return this.matchesStep(last);
            case Order.SECOND_LAST:
                return this.matchesStep(secondLast);
            case Order.THIRD_LAST:
                return this.matchesStep(thirdLast);
            default:
                return false;
        }
    };

    matchesStep = (step) => {
        if (this.type === ForgeStep.HIT_LIGHT) {
            return [ForgeStep.HIT_LIGHT, ForgeStep.HIT_MEDIUM, ForgeStep.HIT_HARD].includes(step);
        }
        return this.type === step;
    };

    iconS = () => (this.type === ForgeStep.HIT_LIGHT ? 8 : this.type.iconS);
  
    overlayY = () => this.order.y;
}

// Rule instances from ForgeRule.java
const ForgeRules = {
    HIT_ANY: new ForgeRule(Order.ANY, ForgeStep.HIT_LIGHT),
    HIT_NOT_LAST: new ForgeRule(Order.NOT_LAST, ForgeStep.HIT_LIGHT),
    HIT_LAST: new ForgeRule(Order.LAST, ForgeStep.HIT_LIGHT),
    HIT_SECOND_LAST: new ForgeRule(Order.SECOND_LAST, ForgeStep.HIT_LIGHT),
    HIT_THIRD_LAST: new ForgeRule(Order.THIRD_LAST, ForgeStep.HIT_LIGHT),
    DRAW_ANY: new ForgeRule(Order.ANY, ForgeStep.DRAW),
    DRAW_LAST: new ForgeRule(Order.LAST, ForgeStep.DRAW),
    DRAW_NOT_LAST: new ForgeRule(Order.NOT_LAST, ForgeStep.DRAW),
    DRAW_SECOND_LAST: new ForgeRule(Order.SECOND_LAST, ForgeStep.DRAW),
    DRAW_THIRD_LAST: new ForgeRule(Order.THIRD_LAST, ForgeStep.DRAW),
    PUNCH_ANY: new ForgeRule(Order.ANY, ForgeStep.PUNCH),
    PUNCH_LAST: new ForgeRule(Order.LAST, ForgeStep.PUNCH),
    PUNCH_NOT_LAST: new ForgeRule(Order.NOT_LAST, ForgeStep.PUNCH),
    PUNCH_SECOND_LAST: new ForgeRule(Order.SECOND_LAST, ForgeStep.PUNCH),
    PUNCH_THIRD_LAST: new ForgeRule(Order.THIRD_LAST, ForgeStep.PUNCH),
    BEND_ANY: new ForgeRule(Order.ANY, ForgeStep.BEND),
    BEND_LAST: new ForgeRule(Order.LAST, ForgeStep.BEND),
    BEND_NOT_LAST: new ForgeRule(Order.NOT_LAST, ForgeStep.BEND),
    BEND_SECOND_LAST: new ForgeRule(Order.SECOND_LAST, ForgeStep.BEND),
    BEND_THIRD_LAST: new ForgeRule(Order.THIRD_LAST, ForgeStep.BEND),
    UPSET_ANY: new ForgeRule(Order.ANY, ForgeStep.UPSET),
    UPSET_LAST: new ForgeRule(Order.LAST, ForgeStep.UPSET),
    UPSET_NOT_LAST: new ForgeRule(Order.NOT_LAST, ForgeStep.UPSET),
    UPSET_SECOND_LAST: new ForgeRule(Order.SECOND_LAST, ForgeStep.UPSET),
    UPSET_THIRD_LAST: new ForgeRule(Order.THIRD_LAST, ForgeStep.UPSET),
    SHRINK_ANY: new ForgeRule(Order.ANY, ForgeStep.SHRINK),
    SHRINK_LAST: new ForgeRule(Order.LAST, ForgeStep.SHRINK),
    SHRINK_NOT_LAST: new ForgeRule(Order.NOT_LAST, ForgeStep.SHRINK),
    SHRINK_SECOND_LAST: new ForgeRule(Order.SECOND_LAST, ForgeStep.SHRINK),
    SHRINK_THIRD_LAST: new ForgeRule(Order.THIRD_LAST, ForgeStep.SHRINK),
};

// Check Consistency Function
const isConsistent = (rules) => {
    if (rules.length === 0 || rules.length > 3) {
        return false;
    }

    let last = null, secondLast = null, thirdLast = null, notLast1 = null, notLast2 = null;

    for (const rule of rules) {
        if ([last, secondLast, thirdLast, notLast1, notLast2].includes(rule)) {
            continue;
        }
        switch (rule.order) {
            case Order.THIRD_LAST:
                if (thirdLast) return false;
                thirdLast = rule;
                break;
            case Order.SECOND_LAST:
                if (secondLast) return false;
                secondLast = rule;
                break;
            case Order.LAST:
                if (last) return false;
                last = rule;
                break;
            case Order.NOT_LAST:
                if (notLast2) return false;
                notLast2 = notLast1;
                notLast1 = rule;
                break;
        }
    }

    return conflict3(notLast1, secondLast, thirdLast) &&
        conflict3(secondLast, notLast1, notLast2) &&
        conflict3(thirdLast, notLast1, notLast2);
};

const conflict3 = (rule1, rule2, rule3) => {
    return !rule1 || !rule2 || !rule3 || rule1.type === rule2.type || rule1.type === rule3.type;
};

// Calculate Optimal Steps to Target
const calculateOptimalStepsToTarget = (target, rules) => {
    const lastSteps = [null, null, null];

    // Assign rules to last, second last, third last
    for (const rule of rules) {
        switch (rule.order) {
            case Order.LAST:
                lastSteps[0] = rule;
                break;
            case Order.SECOND_LAST:
                lastSteps[1] = rule;
                break;
            case Order.THIRD_LAST:
                lastSteps[2] = rule;
                break;
        }
    }

    // Assign any or not last rules
    for (const rule of rules) {
        if (rule.order === Order.NOT_LAST || rule.order === Order.ANY) {
            let placed = false;
            for (let i = 2; i >= 0; i--) {
                if (lastSteps[i] && lastSteps[i].type === rule.type && (rule.order === Order.ANY || i > 0)) {
                    lastSteps[i] = rule;
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                for (let i = 2; i >= 0; i--) {
                    if (!lastSteps[i]) {
                        lastSteps[i] = rule;
                        break;
                    }
                }
            }
        }
    }

    let requiredSteps = 0;
    let requiredHits = 0;

    for (const rule of lastSteps) {
        if (rule) {
            requiredSteps++;
            target -= rule.type.step;
            if (rule.type === ForgeStep.HIT_LIGHT) {
                requiredHits++;
            }
        }
    }

    let minimumSteps = ForgeStep.getOptimalStepsToTarget(target);

    for (let hit = 0; hit < requiredHits * 2; hit++) {
        target -= ForgeStep.HIT_LIGHT.step;
        minimumSteps = Math.min(minimumSteps, ForgeStep.getOptimalStepsToTarget(target));
    }

    return requiredSteps + minimumSteps;
};

export {
    ForgeStep,
    ForgeRule,
    ForgeRules,
    Order,
    isConsistent,
    calculateOptimalStepsToTarget,
};