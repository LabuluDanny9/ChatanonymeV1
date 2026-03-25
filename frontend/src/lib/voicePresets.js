/**
 * Préréglages de voix pour messages vocaux — traitement côté client (Web Audio API).
 * Export WAV pour compatibilité upload (audio/wav autorisé côté serveur).
 */

/** @typedef {{ id: string, label: string, hint?: string }} VoicePresetMeta */

export const VOICE_PRESETS = /** @type {const} */ ([
  { id: 'normal', label: 'Naturelle', hint: 'Sans modification' },
  { id: 'female', label: 'Femme', hint: 'Ton plus aigu' },
  { id: 'young', label: 'Jeune', hint: 'Léger ton enfant / ado' },
  { id: 'old', label: 'Voix mûre', hint: 'Plus grave, légèrement étouffée' },
  { id: 'robot', label: 'Robot', hint: 'Métallique, filtrée' },
  { id: 'echo', label: 'Écho', hint: 'Réverbération légère' },
  { id: 'radio', label: 'Radio', hint: 'Bande étroite type talkie' },
  { id: 'alien', label: 'Alien', hint: 'Aigu + modulation' },
]);

function getAudioContextClass() {
  return typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
}

/** Courbe de distorsion pour effet robot */
function makeDistortionCurve(amount = 40) {
  const n = 44100;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((3 + amount) * x * 20 * Math.PI) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

/**
 * Encode un AudioBuffer en WAV 16 bits mono ou stéréo
 * @param {AudioBuffer} buffer
 * @returns {Blob}
 */
export function audioBufferToWavBlob(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1;
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataLength = buffer.length * blockAlign;
  const bufferLength = 44 + dataLength;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  const writeStr = (o, s) => {
    for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeStr(36, 'data');
  view.setUint32(40, dataLength, true);

  const channels = [];
  for (let c = 0; c < numChannels; c++) channels.push(buffer.getChannelData(c));

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numChannels; c++) {
      let s = Math.max(-1, Math.min(1, channels[c][i]));
      s = s < 0 ? s * 0x8000 : s * 0x7fff;
      view.setInt16(offset, s, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

/**
 * @param {Blob} inputBlob
 * @param {string} presetId
 * @returns {Promise<Blob>}
 */
export async function applyVoicePreset(inputBlob, presetId) {
  if (!presetId || presetId === 'normal') return inputBlob;

  const Ctor = getAudioContextClass();
  if (!Ctor) throw new Error('AudioContext indisponible');

  const arrayBuffer = await inputBlob.arrayBuffer();
  const ctx = new Ctor();
  let audioBuffer;
  try {
    audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
  } catch (e) {
    await ctx.close();
    throw new Error('Impossible de décoder l’audio');
  }
  await ctx.close();

  const sr = audioBuffer.sampleRate;
  const ch = audioBuffer.numberOfChannels;

  const render = async (playbackRate, setupFn) => {
    const dur = audioBuffer.duration / playbackRate;
    const length = Math.min(
      Math.ceil(sr * dur) + 8192,
      sr * 600
    );
    const offline = new OfflineAudioContext(ch, length, sr);
    const src = offline.createBufferSource();
    src.buffer = audioBuffer;
    src.playbackRate.value = playbackRate;
    setupFn(src, offline, offline.destination);
    src.start(0);
    return offline.startRendering();
  };

  let out;

  switch (presetId) {
    case 'female':
      out = await render(1.14, (src, off, dest) => {
        const hp = off.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 200;
        hp.Q.value = 0.7;
        const peak = off.createBiquadFilter();
        peak.type = 'peaking';
        peak.frequency.value = 2800;
        peak.gain.value = 3;
        peak.Q.value = 1;
        src.connect(hp);
        hp.connect(peak);
        peak.connect(dest);
      });
      break;

    case 'young':
      out = await render(1.1, (src, off, dest) => {
        const hp = off.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 120;
        src.connect(hp);
        hp.connect(dest);
      });
      break;

    case 'old':
      out = await render(0.88, (src, off, dest) => {
        const lp = off.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 3800;
        lp.Q.value = 0.7;
        const shelf = off.createBiquadFilter();
        shelf.type = 'lowshelf';
        shelf.frequency.value = 400;
        shelf.gain.value = 2;
        src.connect(lp);
        lp.connect(shelf);
        shelf.connect(dest);
      });
      break;

    case 'robot':
      out = await render(1, (src, off, dest) => {
        const wave = off.createWaveShaper();
        wave.curve = makeDistortionCurve(28);
        wave.oversample = '4x';
        const bp = off.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 1400;
        bp.Q.value = 0.9;
        const gain = off.createGain();
        gain.gain.value = 0.85;
        src.connect(wave);
        wave.connect(bp);
        bp.connect(gain);
        gain.connect(dest);
      });
      break;

    case 'echo': {
      const dur = audioBuffer.duration;
      const length = Math.ceil(sr * dur) + Math.ceil(sr * 0.5);
      const offline = new OfflineAudioContext(ch, length, sr);
      const src = offline.createBufferSource();
      src.buffer = audioBuffer;
      const dry = offline.createGain();
      dry.gain.value = 0.65;
      const wet = offline.createGain();
      wet.gain.value = 0.35;
      const delay = offline.createDelay(1.0);
      delay.delayTime.value = 0.22;
      src.connect(dry);
      dry.connect(offline.destination);
      src.connect(delay);
      delay.connect(wet);
      wet.connect(offline.destination);
      src.start(0);
      out = await offline.startRendering();
      break;
    }

    case 'radio':
      out = await render(1, (src, off, dest) => {
        const hp = off.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 500;
        const lp = off.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 2800;
        const gain = off.createGain();
        gain.gain.value = 1.2;
        src.connect(hp);
        hp.connect(lp);
        lp.connect(gain);
        gain.connect(dest);
      });
      break;

    case 'alien':
      out = await render(1.22, (src, off, dest) => {
        const ring = off.createBiquadFilter();
        ring.type = 'peaking';
        ring.frequency.value = 900;
        ring.gain.value = 8;
        ring.Q.value = 4;
        const hp = off.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 400;
        src.connect(hp);
        hp.connect(ring);
        ring.connect(dest);
      });
      break;

    default:
      return inputBlob;
  }

  return audioBufferToWavBlob(out);
}
