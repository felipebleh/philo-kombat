"""Generate original arcade effects, vocal-like KO sounds and a looping crowd.

Run with Python/numpy/scipy and ffmpeg. No samples or external recordings.
"""
from pathlib import Path
import subprocess
import tempfile
import numpy as np
from scipy import signal
from scipy.io import wavfile

RATE = 44100
RNG = np.random.default_rng(1987)
OUT = Path(__file__).resolve().parents[1] / "public/audio"
OUT.mkdir(parents=True, exist_ok=True)

def time(duration):
    return np.arange(round(duration * RATE)) / RATE

def noise(t, low=250, high=9000):
    return signal.sosfilt(signal.butter(3, [low, high], btype="bandpass", fs=RATE, output="sos"), RNG.standard_normal(len(t)))

def envelope(t, attack=.005, decay=.09):
    return np.minimum(1, t / attack) * np.exp(-t / decay)

def impact(duration=.27, weight=1):
    t = time(duration)
    f = 62 + 115 * weight * np.exp(-t / .025)
    body = np.sin(2*np.pi*np.cumsum(f)/RATE) * envelope(t, .002, .07)
    snap = noise(t, 600, 9500) * envelope(t, .001, .023)
    return .85*body + .6*snap

def whoosh(duration=.2):
    t = time(duration)
    return noise(t, 800, 6000) * np.sin(np.pi*t/duration)**1.5 * .38

def layered(duration, parts):
    audio = np.zeros(round(duration*RATE))
    for start, clip in parts:
        offset = round(start*RATE)
        available = min(len(clip), len(audio)-offset)
        audio[offset:offset+available] += clip[:available]
    return audio

def power(duration, ultimate=False):
    t = time(duration)
    charge = np.clip(1 - t/(duration*.7), 0, 1)
    pitch = 130 + (480 if ultimate else 330)*t/duration
    oscillator = signal.sawtooth(2*np.pi*np.cumsum(pitch)/RATE, width=.55)
    pulse = .65 + .35*np.sin(2*np.pi*19*t)
    energy = signal.sosfilt(signal.butter(3, 2600, fs=RATE, output="sos"), oscillator)*charge*pulse*.32
    energy += noise(t, 500, 8500)*np.sin(np.pi*t/duration)**2*.1
    burst = layered(duration, [(duration*.43, impact(.6, 1.6 if ultimate else 1)), (duration*.48, whoosh(duration*.42))])
    if ultimate:
        energy += np.sin(2*np.pi*48*t)*envelope(np.maximum(0,t-.48), .025, .45)*np.where(t>.48, .3, 0)
    return energy + burst

def groan(female=False):
    duration = 1.05 if female else 1.12
    t = time(duration)
    # Glottal excitation with a falling pitch, breath and three vowel formants.
    f0 = (225 if female else 116) * (1-.3*t/duration) + 2.5*np.sin(2*np.pi*5*t)
    phase = np.cumsum(f0)/RATE
    glottal = sum(np.sin(2*np.pi*h*phase)/h**1.2 for h in range(1,30))
    vocal = np.zeros_like(t)
    for f, q, gain in [(720 if female else 600, 7, 1), (1260 if female else 1000, 8, .7), (2600 if female else 2300, 10, .25)]:
        b,a = signal.iirpeak(f, q, fs=RATE)
        vocal += signal.lfilter(b,a,glottal)*gain
    breath = noise(t, 500, 5800)*.065
    rough = .78 + .22*np.sin(2*np.pi*31*t)
    env = (1-np.exp(-t/.025))*np.exp(-t/.55)*np.minimum(1,(duration-t)/.12)
    return (vocal*rough + breath)*env

def crash():
    t = time(1.6)
    freq = 900*np.exp(-t/1.0)+65
    digital = signal.square(2*np.pi*np.cumsum(freq)/RATE)*(.15+.08*np.sin(2*np.pi*30*t))
    digital *= .55+.45*signal.square(2*np.pi*(9*t+14*t*t))
    static = noise(t, 250, 12000)*.23
    return (digital+static)*envelope(t,.004,.55) + np.sin(2*np.pi*np.cumsum(115*np.exp(-t/.32))/RATE)*.18*envelope(t,.01,.6)

def applause():
    duration = 8
    stereo = np.zeros((round(duration*RATE),2))
    # Independent hands, timing and positions; wrap tails for an even loop seam.
    for _ in range(520):
        clip_t = time(RNG.uniform(.08,.17))
        clap = noise(clip_t, 750, 11500)*envelope(clip_t,.0008,RNG.uniform(.013,.033))
        clap += np.sin(2*np.pi*RNG.uniform(170,330)*clip_t)*envelope(clip_t,.001,.02)*.12
        pos = RNG.uniform(-.85,.85)
        offset = RNG.integers(0,len(stereo))
        indices = (offset+np.arange(len(clap)))%len(stereo)
        strength = RNG.uniform(.12,.35)
        stereo[indices,0] += clap*strength*np.sqrt((1-pos)/2)
        stereo[indices,1] += clap*strength*np.sqrt((1+pos)/2)
    return stereo

sounds = {
    "sfx_soco": layered(.32, [(0,whoosh(.08)), (.055,impact())]),
    "sfx_chute": layered(.46, [(0,whoosh(.18)), (.13,impact(.33,1.2))]),
    "sfx_combo": layered(.84, [(0,impact(.25)), (.19,impact(.3,1.1)), (.44,impact(.4,1.35))]),
    "sfx_especial_1": power(1.08),
    "sfx_especial_2": power(1.5,True),
    "sfx_derrota_masculina": groan(),
    "sfx_derrota_feminina": groan(True),
    "sfx_derrota_superinteligencia": crash(),
    "aplausos_final_loop": applause(),
}

with tempfile.TemporaryDirectory() as folder:
    for name, audio in sounds.items():
        audio = np.tanh(audio*1.4)
        peak = np.max(np.abs(audio))
        audio *= (.63 if name == "aplausos_final_loop" else .8)/max(peak,.001)
        wav = Path(folder)/f"{name}.wav"
        wavfile.write(wav,RATE,(audio*32767).astype(np.int16))
        target = OUT/f"{name}.mp3"
        subprocess.run(["ffmpeg","-y","-v","error","-i",str(wav),"-codec:a","libmp3lame","-b:a","128k",str(target)],check=True)
        print(f"{name}: {len(audio)/RATE:.2f}s, {target.stat().st_size} bytes")
