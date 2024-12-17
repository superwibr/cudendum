const ForgingBonus = {
	bonuses: [
		{
			iconOffset: 0,
			adverb: "",
			minRatio: Infinity
		},
		{
			iconOffset: 1,
			adverb: "Modestly",
			minRatio: 10
		},
		{
			iconOffset: 2,
			adverb: "Well",
			minRatio: 5
		},
		{
			iconOffset: 3,
			adverb: "Expertly",
			minRatio: 2
		},
		{
			iconOffset: 4,
			adverb: "Perfectly",
			minRatio: 1.5
		}
	],

	overworkedBonus: {
		iconOffset: 5
	},

	getByRatio: ratio => ForgingBonus.bonuses.toReversed().find(quality => quality.minRatio > ratio)
};

export { ForgingBonus };