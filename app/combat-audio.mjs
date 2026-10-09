export const COMBAT_SOUNDS = Object.freeze({
  punch: "/audio/sfx_soco.mp3",
  kick: "/audio/sfx_chute.mp3",
  combo: "/audio/sfx_combo.mp3",
  special1: "/audio/sfx_especial_1.mp3",
  special2: "/audio/sfx_especial_2.mp3",
  defeatMale: "/audio/sfx_derrota_masculina.mp3",
  defeatFemale: "/audio/sfx_derrota_feminina.mp3",
  defeatComputer: "/audio/sfx_derrota_superinteligencia.mp3",
});

export const MOVE_SOUNDS = Object.freeze({ dialetica: "punch", caverna: "kick", ideias: "combo", especial: "special1", transcender: "special2" });
const femaleFighters = new Set(["hypatia", "olympe", "beauvoir", "arendt", "angela-davis"]);
export function defeatSound(fighter) {
  return fighter === "superintelligence" ? "defeatComputer" : femaleFighters.has(fighter) ? "defeatFemale" : "defeatMale";
}

// A shared effects bus reuses decoded samples. Only valid, landed combat moves
// request playback; a generation guard discards delayed decodes after navigation.
export class CombatAudio {
  constructor(createContext, fetchAudio = (url) => fetch(url)) {
    this.createContext = createContext;
    this.fetchAudio = fetchAudio;
    this.context = null;
    this.master = null;
    this.volume = .55;
    this.soundOn = true;
    this.hidden = false;
    this.destroyed = false;
    this.generation = 0;
    this.active = new Set();
    this.buffers = new Map();
    this.requests = new Map();
  }

  unlock() {
    if (this.destroyed) return;
    try {
      if (!this.context) {
        this.context = this.createContext();
        if (!this.context) return;
        this.master = this.context.createGain();
        this.master.connect(this.context.destination);
        this.settings(this.volume, this.soundOn);
        for (const name of Object.keys(COMBAT_SOUNDS)) void this.load(name);
      }
      if (this.context.state === "suspended") void this.context.resume().catch(() => {});
    } catch { /* Lack of audio support never blocks a fight. */ }
  }

  load(name) {
    if (this.buffers.has(name)) return Promise.resolve(this.buffers.get(name));
    if (this.requests.has(name)) return this.requests.get(name);
    if (!this.context || !COMBAT_SOUNDS[name] || this.destroyed) return Promise.resolve(null);
    const context = this.context;
    const request = this.fetchAudio(COMBAT_SOUNDS[name])
      .then((response) => response.ok ? response.arrayBuffer() : null)
      .then((bytes) => bytes && !this.destroyed ? context.decodeAudioData(bytes) : null)
      .then((buffer) => {
        if (buffer && !this.destroyed) this.buffers.set(name, buffer);
        return buffer;
      }).catch(() => null);
    this.requests.set(name, request);
    return request;
  }

  play(name, { gain = 1 } = {}) {
    if (!this.soundOn || this.volume === 0 || this.hidden || this.destroyed) return;
    this.unlock();
    if (!this.context) return;
    const generation = this.generation;
    const start = (buffer) => {
      if (!buffer || generation !== this.generation || this.destroyed || this.hidden || !this.soundOn || this.volume === 0) return;
      while (this.active.size >= 8) this.stopNode(this.active.values().next().value);
      const source = this.context.createBufferSource();
      const level = this.context.createGain();
      level.gain.value = gain;
      source.buffer = buffer;
      source.connect(level);
      level.connect(this.master);
      source.onended = () => { this.active.delete(source); source.disconnect(); level.disconnect(); };
      this.active.add(source);
      source.start();
    };
    const buffer = this.buffers.get(name);
    if (buffer) start(buffer);
    else void this.load(name).then(start);
  }

  tone(frequency, duration = .08, type = "sine") {
    if (!this.soundOn || this.volume === 0 || this.hidden || this.destroyed) return;
    this.unlock();
    if (!this.context) return;
    const oscillator = this.context.createOscillator();
    const level = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
    level.gain.setValueAtTime(.06, this.context.currentTime);
    level.gain.exponentialRampToValueAtTime(.001, this.context.currentTime + duration);
    oscillator.connect(level);
    level.connect(this.master);
    oscillator.onended = () => { this.active.delete(oscillator); oscillator.disconnect(); level.disconnect(); };
    this.active.add(oscillator);
    oscillator.start();
    oscillator.stop(this.context.currentTime + duration);
  }

  settings(volume, soundOn) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.soundOn = soundOn;
    if (this.master) this.master.gain.value = soundOn ? this.volume : 0;
    if (!soundOn || this.volume === 0) this.stopAll();
  }

  stopNode(node) {
    this.active.delete(node);
    try { node.stop(); } catch { /* A finished node is already silent. */ }
  }

  stopAll() {
    this.generation++;
    for (const node of this.active) this.stopNode(node);
  }

  visibility(hidden) {
    this.hidden = hidden;
    if (hidden) this.stopAll();
  }

  destroy() {
    this.destroyed = true;
    this.stopAll();
    void this.context?.close().catch(() => {});
    this.buffers.clear();
  }
}
