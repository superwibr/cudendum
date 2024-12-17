// copy-pasted from my dungeon generator

const cyrb128 = str => {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
    return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
};

const sfc32 = (a, b, c, d) => {
    return () => {
        a |= 0; b |= 0; c |= 0; d |= 0;
        const t = (a + b | 0) + d | 0;
        d = d + 1 | 0;
        a = b ^ b >>> 9;
        b = c + (c << 3) | 0;
        c = (c << 21 | c >>> 11);
        c = c + t | 0;
        return (t >>> 0) / 4294967296;
    };
};

const cyrbsfc = seedstr => sfc32(...cyrb128(seedstr));

const sfc32direct = (a, b, c, d, i = 1) => {
    a |= 0; b |= 0; c |= 0; d |= 0;
    const t = (a + b | 0) + d | 0;
    while (i--) {
        d = d + 1 | 0;
        a = b ^ b >>> 9;
        b = c + (c << 3) | 0;
        c = (c << 21 | c >>> 11);
        c = c + t | 0;
    }
    return (t >>> 0) / 4294967296;
};

const cyrbsfcd = (seedstr, i) => sfc32direct(...cyrb128(seedstr), i);

const xor32 = (seed) => {
    let x = Math.floor(seed * 0xffffffff) || 1;
    return () => {
        x ^= x << 13;
        x ^= x >> 17;
        x ^= x << 5;
        return (x >>> 0) / 0x100000000;
    };
};

export { cyrb128, sfc32, cyrbsfc, sfc32direct, cyrbsfcd, xor32 };