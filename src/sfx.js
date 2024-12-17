import { Howl } from "./howler.min.js";

const sounds = {};

const addSound = (name, url, params = {}) => sounds[name] = new Howl({
    src: [new URL(url, import.meta.url)],
    html5: true,
    ...params
});

const addPool = (name, soundNames) => sounds[name] = { pool: soundNames };

addSound("hit1", "../assets/sound/hit/hit1.ogg");
addSound("hit2", "../assets/sound/hit/hit2.ogg");
addSound("hit3", "../assets/sound/hit/hit3.ogg");
addSound("hit4", "../assets/sound/hit/hit4.ogg");
addPool("hit", ["hit1", "hit2", "hit3", "hit4"]);

addSound("anvil_use", "../assets/sound/anvil/anvil_use.ogg");
addSound("anvil_break", "../assets/sound/anvil/anvil_break.ogg");

addSound("crackle1", "../assets/sound/campfire/crackle1.ogg");
addSound("crackle2", "../assets/sound/campfire/crackle2.ogg");
addSound("crackle3", "../assets/sound/campfire/crackle3.ogg");
addSound("crackle4", "../assets/sound/campfire/crackle4.ogg");
addSound("crackle5", "../assets/sound/campfire/crackle5.ogg");
addSound("crackle6", "../assets/sound/campfire/crackle6.ogg");
addPool("crackle", ["crackle1", "crackle2", "crackle3", "crackle4", "crackle5", "crackle6"]);

addSound("blastfurnace1", "../assets/sound/blast_furnace/blastfurnace1.ogg");
addSound("blastfurnace2", "../assets/sound/blast_furnace/blastfurnace2.ogg");
addSound("blastfurnace3", "../assets/sound/blast_furnace/blastfurnace3.ogg");
addSound("blastfurnace4", "../assets/sound/blast_furnace/blastfurnace4.ogg");
addSound("blastfurnace5", "../assets/sound/blast_furnace/blastfurnace5.ogg");
addPool("blastfurnace", ["blastfurnace1", "blastfurnace2", "blastfurnace3", "blastfurnace4", "blastfurnace5"]);

addSound("beacon_power1", "../assets/sound/beacon/power1.ogg");
addSound("beacon_power2", "../assets/sound/beacon/power2.ogg");
addSound("beacon_power3", "../assets/sound/beacon/power3.ogg");
addPool("beacon_power", ["beacon_power1", "beacon_power2", "beacon_power3"]);


const playsound = name => {
    const sound = sounds[name];

    if (sound.pool) return playsound(sound.pool[Math.floor(Math.random() * sound.pool.length)]);

    const id = sound.play();

    return {
        play() { sound.play(id) },
        pause() { sound.pause(id) },
        stop() { sound.stop(id) },
        fade(from, to, duration) { sound.fade(from, to, duration, id) },
        loop(state) { sound.loop(state, id) },
        volume(volume) { sound.volume(volume, id) }
    };
}

export { playsound };