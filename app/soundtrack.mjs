const track = (file, loop = true, extension = "m4a") => Object.freeze({ src: `/audio/${file}.${extension}`, loop });

export const SOUNDTRACK = Object.freeze({
  title: track("philo_kombat_tela_inicial_sombria_loop"),
  selection: track("philo_kombat_selecao_personagens_loop"),
  preFight: track("philo_kombat_pre_luta_modo_historia"),
  ancient: track("philo_kombat_grecia_arcade_fighter"),
  medieval: track("philo_kombat_idade_media_canto_loop"),
  modern: track("philo_kombat_modernidade_classica_loop"),
  contemporary: track("philo_kombat_contemporanea_jazz_loop"),
  boss: track("philo_kombat_superinteligencia_sombria_loop"),
  result: track("vitoria_arcade", false, "mp3"),
  applause: track("aplausos_final_loop", true, "mp3"),
});

export const AUDIO_SETTINGS_KEY = "philo-kombat:audio";

const ancient = new Set(["amenemope", "homero", "tales", "socrates", "plato", "diogenes", "aristotle", "sidarta", "confucius", "marcus", "hypatia"]);
const medieval = new Set(["agostinho", "averroes", "thomas"]);
const modern = new Set(["machiavelli", "galileo", "descartes", "locke", "hobbes", "rousseau", "smith", "kant", "hegel", "olympe"]);

export function battleTrack(gameMode, fighter, opponent) {
  if (fighter === "superintelligence" || opponent === "superintelligence" || fighter === "felipe-cyborg" || opponent === "felipe-cyborg") return SOUNDTRACK.boss;
  // Versus arenas belong to the player's fighter; Story arenas belong to the encounter.
  const arenaFighter = gameMode === "story" || fighter === "felipe" ? opponent : fighter;
  if (ancient.has(arenaFighter)) return SOUNDTRACK.ancient;
  if (medieval.has(arenaFighter)) return SOUNDTRACK.medieval;
  if (modern.has(arenaFighter)) return SOUNDTRACK.modern;
  return SOUNDTRACK.contemporary;
}

export function soundtrackForPhase(phase, gameMode, fighter, opponent, sceneKind = "intro", endingStage = "waiting") {
  if (["intro", "mode-select", "story-tier-select"].includes(phase)) return SOUNDTRACK.title;
  if (phase === "select") return SOUNDTRACK.selection;
  if (phase === "story-intro" || (phase === "story-scene" && sceneKind === "intro")) return SOUNDTRACK.preFight;
  if (phase === "playing" || phase === "finishing") return battleTrack(gameMode, fighter, opponent);
  // Only the champion screen contains both the winner and final phrase.
  if (phase === "won" || phase === "lost") return SOUNDTRACK.result;
  if (phase === "story-complete" || phase === "doctor-complete") {
    if (endingStage === "celebration") return SOUNDTRACK.applause;
    if (endingStage === "threat") return SOUNDTRACK.boss;
  }
  return null;
}

export function readAudioSettings(storage) {
  try {
    const saved = JSON.parse(storage.getItem(AUDIO_SETTINGS_KEY));
    return {
      volume: typeof saved?.volume === "number" && Number.isFinite(saved.volume) ? Math.max(0, Math.min(1, saved.volume)) : 0.55,
      soundOn: typeof saved?.soundOn === "boolean" ? saved.soundOn : true,
    };
  } catch { return { volume: 0.55, soundOn: true }; }
}

// One HTMLAudioElement owns all music, including the one-shot result fanfare.
// Keeping it outside combat also prevents health/timer updates from restarting it.
export class SoundtrackPlayer {
  constructor(audio) {
    this.audio = audio;
    this.audio.preload = "metadata";
    this.audio.volume = 0.55;
    this.currentKey = null;
    this.currentTrack = null;
    this.unlocked = false;
    this.hidden = false;
    this.completed = false;
    this.destroyed = false;
    this.onEnded = () => { if (!this.audio.loop) this.completed = true; };
    this.audio.addEventListener("ended", this.onEnded);
  }

  select(next, key) {
    const identity = next ? `${key}:${next.src}` : null;
    if (identity === this.currentKey) return;
    this.audio.pause();
    this.audio.currentTime = 0;
    this.currentKey = identity;
    this.currentTrack = next;
    this.completed = false;
    if (!next) {
      this.audio.removeAttribute("src");
      this.audio.load();
      return;
    }
    this.audio.loop = next.loop;
    this.audio.src = next.src;
    this.resume();
  }

  settings(volume, soundOn) {
    this.audio.volume = Math.max(0, Math.min(1, volume));
    this.audio.muted = !soundOn;
  }

  unlock() {
    this.unlocked = true;
    this.resume();
  }

  resume() {
    if (this.destroyed || !this.unlocked || this.hidden || !this.currentTrack || this.completed || !this.audio.paused) return;
    // Browsers may reject autoplay or a play superseded by a fast screen change.
    // Retry only on a new gesture; never schedule stale playback in a promise.
    try { this.audio.play()?.catch(() => {}); } catch { /* Audio never blocks the game. */ }
  }

  visibility(hidden) {
    this.hidden = hidden;
    if (hidden) this.audio.pause();
    else this.resume();
  }

  destroy() {
    this.destroyed = true;
    this.audio.pause();
    this.audio.removeAttribute("src");
    this.audio.load();
    this.audio.removeEventListener("ended", this.onEnded);
  }
}
