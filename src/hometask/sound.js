// Volitelné zvuky vyrobené přímo v prohlížeči (WebAudio) – žádné soubory, hra funguje i bez nich.
let ctx = null;
function ac() {
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    try { ctx = new C(); } catch { return null; }
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}
function noise(c, dur) {
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = c.createBufferSource(); s.buffer = buf; return s;
}
function tone(c, freq, dur, type = "sine", vol = 0.12, when = 0) {
  const t = c.currentTime + when;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
}
export function play(kind, enabled) {
  if (!enabled) return;
  const c = ac(); if (!c) return;
  try {
    if (kind === "tick") tone(c, 1900, 0.03, "square", 0.04);
    else if (kind === "lamp") tone(c, 520, 0.05, "square", 0.05);
    else if (kind === "wrong") tone(c, 140, 0.25, "sawtooth", 0.07);
    else if (kind === "found") { tone(c, 660, 0.18, "sine", 0.09); tone(c, 990, 0.3, "sine", 0.07, 0.1); }
    else if (kind === "chime") { [392, 494, 587, 784].forEach((f, i) => tone(c, f, 1.1, "sine", 0.08, i * 0.12)); }
    else if (kind === "crack") {
      const n = noise(c, 0.18), f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 1400;
      const g = c.createGain(); g.gain.value = 0.35; n.connect(f).connect(g).connect(c.destination); n.start();
      tone(c, 90, 0.12, "triangle", 0.15);
    } else if (kind === "paper") {
      const n = noise(c, 0.35), f = c.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 2600; f.Q.value = 0.6;
      const g = c.createGain(); g.gain.value = 0.18; n.connect(f).connect(g).connect(c.destination); n.start();
    }
  } catch { /* zvuk je jen bonus */ }
}
