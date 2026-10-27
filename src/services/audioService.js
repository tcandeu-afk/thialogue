import { DEFAULT_ELEVENLABS_VOICE_ID, DEFAULT_ELEVENLABS_MODEL } from '../types/schema';

/**
 * Global array preventing Safari/WebKit JavaScriptCore from garbage-collecting
 * active SpeechSynthesisUtterance objects before `onend` fires.
 */
const ACTIVE_UTTERANCE_REFS = [];

/**
 * Switches iOS 16.4+ Safari's audio session from 'ambient' (muted by hardware Silent Switch)
 * to 'playback' (plays through speaker even when iPhone Silent Switch is on).
 */
export function ensurePlaybackAudioSession() {
  try {
    if (typeof navigator !== 'undefined' && 'audioSession' in navigator && navigator.audioSession) {
      navigator.audioSession.type = 'playback';
    }
  } catch {
    // ignore if unsupported
  }
}

/**
 * Returns the local server HTTP URL (`audio/<chapterId>.wav`) for pre-rendered native chapter audio.
 */
export function getPreRenderedChapterAudioUrl(chapter) {
  if (!chapter?.id) return null;
  const exactId = chapter.id;
  const baseId = (chapter.preRenderedAudioId || exactId).replace(
    /__(simplify|maintain|challenge)$/,
    ''
  );
  const suffixMatch = exactId.match(/__(simplify|challenge)$/);
  const difficultySuffix = suffixMatch ? suffixMatch[0] : '';
  return `audio/${baseId}${difficultySuffix}.wav`;
}

/**
 * Generates a short 0.25-second silent PCM WAV Blob URL (`blob:http://...`)
 * so `<audio>` can be unlocked synchronously inside the user's tap gesture
 * while the browser fetches the ElevenLabs neural MP3 directly from `api.elevenlabs.io`!
 */
let cachedSilentBlobUrl = null;
export function getSilentUnlockBlobUrl() {
  if (cachedSilentBlobUrl) return cachedSilentBlobUrl;
  const sampleRate = 8000;
  const numSamples = 2000; // 0.25 seconds
  const byteLength = 44 + numSamples * 2;
  const buffer = new ArrayBuffer(byteLength);
  const view = new DataView(buffer);

  const writeStr = (offset, str) => {
    for (let i = 0; i < str.length; i += 1) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, byteLength - 8, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  const blob = new Blob([buffer], { type: 'audio/wav' });
  cachedSilentBlobUrl = URL.createObjectURL(blob);
  return cachedSilentBlobUrl;
}

let sharedWordAudioEl = null;

function getSharedWordAudioElement() {
  if (typeof window === 'undefined') return null;
  if (!sharedWordAudioEl) {
    sharedWordAudioEl = new Audio();
    sharedWordAudioEl.preload = 'auto';
    sharedWordAudioEl.playsInline = true;
  }
  return sharedWordAudioEl;
}

export const ELEVENLABS_VOICE_PRESETS = [
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George (Default — Warm Multilingual Narrator)' },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (Clear & Calm Storyteller)' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah (Soft & Expressive)' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam (Articulate & Natural)' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte (Rich European Multilingual)' },
];

const VOICE_NAME_TO_ID_MAP = {
  george: 'JBFqnCBsd6RMkjVDRZzb',
  rachel: '21m00Tcm4TlvDq8ikWAM',
  sarah: 'EXAVITQu4vr4xnSDxMaL',
  liam: 'TX3LPaxmHKxFdv7VOQHJ',
  charlotte: 'XB0fDUnXU5powFXDhCwa',
};

export function sanitizeApiKey(rawKey) {
  if (!rawKey) return '';
  return rawKey
    .trim()
    .replace(/^['"]+|['"]+$/g, '')
    .replace(/^Bearer\s+/i, '')
    .trim();
}

export function resolveVoiceId(rawVoiceId) {
  const cleaned = (rawVoiceId || DEFAULT_ELEVENLABS_VOICE_ID)
    .trim()
    .replace(/^['"]+|['"]+$/g, '');
  if (!cleaned) return DEFAULT_ELEVENLABS_VOICE_ID;
  const mapped = VOICE_NAME_TO_ID_MAP[cleaned.toLowerCase()];
  return mapped || cleaned;
}

export function findBestWebSpeechVoice(bcp47) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }
  const voices = window.speechSynthesis.getVoices() || [];
  if (!voices.length) return null;

  const normalizedTarget = (bcp47 || 'fr-FR').replace('_', '-').toLowerCase();
  const langPrefix = normalizedTarget.split('-')[0];

  const exactMatches = voices.filter(
    (v) => v.lang && v.lang.replace('_', '-').toLowerCase() === normalizedTarget
  );
  if (exactMatches.length > 0) {
    const localDefault = exactMatches.find((v) => v.localService && v.default);
    if (localDefault) return localDefault;
    const localVoice = exactMatches.find((v) => v.localService);
    if (localVoice) return localVoice;
    return exactMatches[0];
  }

  const prefixMatches = voices.filter(
    (v) => v.lang && v.lang.replace('_', '-').toLowerCase().startsWith(langPrefix)
  );
  if (prefixMatches.length > 0) {
    const localPrefix = prefixMatches.find((v) => v.localService);
    return localPrefix || prefixMatches[0];
  }

  return null;
}

function speakUtteranceSafely(text, bcp47 = 'fr-FR', rate = 0.95, callbacks = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    callbacks.onError?.('Speech synthesis is not supported on this browser.');
    return null;
  }

  try {
    ensurePlaybackAudioSession();

    const utterance = new SpeechSynthesisUtterance(text);
    ACTIVE_UTTERANCE_REFS.push(utterance);

    utterance.lang = bcp47;
    utterance.rate = rate;
    utterance.volume = 1.0;

    const voice = findBestWebSpeechVoice(bcp47);
    if (voice && voice.localService) {
      utterance.voice = voice;
    }

    const cleanupRef = () => {
      const idx = ACTIVE_UTTERANCE_REFS.indexOf(utterance);
      if (idx !== -1) ACTIVE_UTTERANCE_REFS.splice(idx, 1);
    };

    utterance.onstart = () => {
      callbacks.onStart?.();
    };

    utterance.onend = () => {
      cleanupRef();
      callbacks.onEnd?.();
    };

    utterance.onerror = (event) => {
      cleanupRef();
      if (event.error === 'canceled' || event.error === 'interrupted') {
        return;
      }
      callbacks.onError?.(event);
    };

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 35);
    } else {
      window.speechSynthesis.speak(utterance);
    }

    return utterance;
  } catch (err) {
    callbacks.onError?.(err);
    return null;
  }
}

const WORD_PHRASE_AUDIO_CACHE = new Map();

/**
 * Instant word or phrase pronunciation on tap/click.
 * Automatically uses ElevenLabs Neural Voice when an ElevenLabs API key is saved in settings
 * (caching the Blob URL in memory for 0ms replay), falling back to `/api/tts` or Web Speech if no key is set.
 */
export async function speakSingleWord(wordText, bcp47 = 'fr-FR', rate = 0.95) {
  if (typeof window === 'undefined') return;

  const cleaned = (wordText || '')
    .replace(/[«»"“”「」『』]/g, '')
    .trim();
  if (!cleaned) return;

  ensurePlaybackAudioSession();

  const el = getSharedWordAudioElement();

  // 1. Check if the user has configured an ElevenLabs API Key in settings
  let elKey = '';
  let elVoice = DEFAULT_ELEVENLABS_VOICE_ID;
  try {
    const rawSettings = localStorage.getItem('luminaread_settings_v1');
    if (rawSettings) {
      const parsed = JSON.parse(rawSettings);
      elKey = sanitizeApiKey(parsed.elevenLabsApiKey);
      elVoice = resolveVoiceId(parsed.elevenLabsVoiceId);
    }
  } catch {
    // ignore localStorage read error
  }

  if (elKey && el) {
    const cacheKey = `${elVoice}:${cleaned}`;
    const cachedBlobUrl = WORD_PHRASE_AUDIO_CACHE.get(cacheKey);
    if (cachedBlobUrl) {
      try {
        el.pause();
        el.loop = false;
        el.playbackRate = rate;
        el.src = cachedBlobUrl;
        await el.play();
        return;
      } catch {
        // regenerate if revoked
      }
    }

    // Unlock <audio> synchronously inside the click gesture
    try {
      el.loop = false;
      el.src = getSilentUnlockBlobUrl();
      const p = el.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch {
      // ignore
    }

    try {
      const response = await requestElevenLabsTts({
        cleanKey: elKey,
        resolvedVoiceId: elVoice,
        text: cleaned,
        modelId: 'eleven_multilingual_v2',
      });
      if (response.ok) {
        const blob = await response.blob();
        if (blob && blob.size > 128) {
          const blobUrl = URL.createObjectURL(blob);
          WORD_PHRASE_AUDIO_CACHE.set(cacheKey, blobUrl);
          el.pause();
          el.loop = false;
          el.playbackRate = rate;
          el.src = blobUrl;
          await el.play();
          return;
        }
      }
    } catch {
      // fall through to local TTS if network error
    }
  }

  if (el) {
    try {
      const tl = (bcp47 || 'fr-FR').split('-')[0].toLowerCase();
      el.pause();
      el.playbackRate = rate;
      el.src = `/api/tts?tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(cleaned)}`;
      const playPromise = el.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          speakUtteranceSafely(cleaned, bcp47, rate);
        });
      }
      return;
    } catch {
      // fall through to Web Speech
    }
  }

  speakUtteranceSafely(cleaned, bcp47, rate);
}

let sharedSentenceAudioEl = null;
let activeSentenceKey = null;
let activeSentenceStateCallback = null;

function getSharedSentenceAudioElement() {
  if (typeof window === 'undefined') return null;
  if (!sharedSentenceAudioEl) {
    sharedSentenceAudioEl = new Audio();
    sharedSentenceAudioEl.preload = 'auto';
    sharedSentenceAudioEl.playsInline = true;
  }
  return sharedSentenceAudioEl;
}

function getSavedElevenLabsCredentials() {
  let elKey = '';
  let elVoice = DEFAULT_ELEVENLABS_VOICE_ID;
  try {
    const rawSettings = localStorage.getItem('luminaread_settings_v1');
    if (rawSettings) {
      const parsed = JSON.parse(rawSettings);
      elKey = sanitizeApiKey(parsed.elevenLabsApiKey);
      elVoice = resolveVoiceId(parsed.elevenLabsVoiceId);
    }
  } catch {
    // ignore localStorage read error
  }
  return { elKey, elVoice };
}

export function stopSentenceAudio() {
  const el = getSharedSentenceAudioElement();
  if (el) {
    try {
      el.pause();
      el.currentTime = 0;
    } catch {
      // ignore
    }
  }
  if (activeSentenceStateCallback && activeSentenceKey) {
    activeSentenceStateCallback({ sentenceKey: activeSentenceKey, status: 'idle' });
  }
  activeSentenceKey = null;
  activeSentenceStateCallback = null;
}

/**
 * Plays, pauses, or resumes a specific sentence using the user's ElevenLabs Neural Voice.
 * When `forceRestart` is true, immediately restarts the sentence from 0:00.
 */
export async function controlSentenceAudio({
  sentenceKey,
  sentenceText,
  bcp47 = 'fr-FR',
  rate = 1.0,
  forceRestart = false,
  onStateChange,
}) {
  if (typeof window === 'undefined') return;
  const cleaned = (sentenceText || '')
    .replace(/[«»"“”「」『』]/g, '')
    .trim();
  if (!cleaned) return;

  ensurePlaybackAudioSession();
  const el = getSharedSentenceAudioElement();
  if (!el) return;

  const notify = (status) => {
    onStateChange?.({ sentenceKey, status });
  };

  // If clicking Play/Pause or Restart on the already-active sentence:
  if (activeSentenceKey === sentenceKey && el.src && !el.src.startsWith('blob:null')) {
    activeSentenceStateCallback = onStateChange;
    if (forceRestart) {
      try {
        el.pause();
        el.currentTime = 0;
        el.playbackRate = rate;
        await el.play();
        notify('playing');
        return;
      } catch {
        // fall through to reload if needed
      }
    } else {
      // Toggle Play / Pause
      if (!el.paused && !el.ended) {
        el.pause();
        notify('paused');
        return;
      }
      if (el.paused && !el.ended && el.currentTime > 0) {
        try {
          el.playbackRate = rate;
          await el.play();
          notify('playing');
          return;
        } catch {
          // fall through to reload
        }
      }
    }
  }

  // Switching to a different sentence: notify previous sentence is now idle
  if (activeSentenceKey && activeSentenceKey !== sentenceKey && activeSentenceStateCallback) {
    activeSentenceStateCallback({ sentenceKey: activeSentenceKey, status: 'idle' });
  }

  activeSentenceKey = sentenceKey;
  activeSentenceStateCallback = onStateChange;

  el.onended = () => {
    if (activeSentenceKey === sentenceKey) {
      notify('idle');
    }
  };
  el.onerror = () => {
    if (activeSentenceKey === sentenceKey) {
      notify('idle');
    }
  };

  const { elKey, elVoice } = getSavedElevenLabsCredentials();
  const cacheKey = `${elVoice}:${cleaned}`;

  if (elKey) {
    const cachedBlobUrl = WORD_PHRASE_AUDIO_CACHE.get(cacheKey);
    if (cachedBlobUrl) {
      try {
        el.pause();
        el.loop = false;
        el.src = cachedBlobUrl;
        el.currentTime = 0;
        el.playbackRate = rate;
        await el.play();
        notify('playing');
        return;
      } catch {
        // regenerate if revoked
      }
    }

    notify('loading');

    // Unlock <audio> synchronously inside user gesture
    try {
      el.loop = false;
      el.src = getSilentUnlockBlobUrl();
      const p = el.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch {
      // ignore
    }

    try {
      const response = await requestElevenLabsTts({
        cleanKey: elKey,
        resolvedVoiceId: elVoice,
        text: cleaned,
        modelId: 'eleven_multilingual_v2',
      });
      if (response.ok) {
        const blob = await response.blob();
        if (blob && blob.size > 128) {
          const blobUrl = URL.createObjectURL(blob);
          WORD_PHRASE_AUDIO_CACHE.set(cacheKey, blobUrl);
          if (activeSentenceKey !== sentenceKey) return;
          el.pause();
          el.loop = false;
          el.src = blobUrl;
          el.currentTime = 0;
          el.playbackRate = rate;
          await el.play();
          notify('playing');
          return;
        }
      }
    } catch {
      // fall through to fallback TTS if network error
    }
  }

  // Fallback if no ElevenLabs key is set yet
  try {
    const tl = (bcp47 || 'fr-FR').split('-')[0].toLowerCase();
    el.pause();
    el.loop = false;
    el.src = `/api/tts?tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(cleaned)}`;
    el.currentTime = 0;
    el.playbackRate = rate;
    await el.play();
    notify('playing');
  } catch {
    notify('idle');
  }
}

async function parseElevenLabsError(response) {
  let statusCode = response.status;
  let rawMessage = '';
  let errorStatus = '';

  try {
    const errData = await response.json();
    if (typeof errData?.detail === 'string') {
      rawMessage = errData.detail;
    } else if (errData?.detail && typeof errData.detail === 'object') {
      rawMessage = errData.detail.message || JSON.stringify(errData.detail);
      errorStatus = errData.detail.status || '';
    } else if (errData?.error) {
      rawMessage = errData.error;
    }
  } catch {
    try {
      rawMessage = await response.text();
    } catch {
      rawMessage = '';
    }
  }

  if (statusCode === 401) {
    return `Invalid ElevenLabs API Key (HTTP 401${rawMessage ? `: ${rawMessage}` : ''}).`;
  }
  if (statusCode === 402 || /quota_exceeded/i.test(errorStatus) || /quota/i.test(rawMessage)) {
    return `ElevenLabs character quota reached (${rawMessage || 'HTTP 402'}).`;
  }
  if (statusCode === 404 || /voice_not_found/i.test(errorStatus)) {
    return `ElevenLabs Voice ID not found (HTTP 404).`;
  }
  return `ElevenLabs TTS Error (HTTP ${statusCode})${rawMessage ? `: ${rawMessage}` : ''}`;
}

async function requestElevenLabsTts({ cleanKey, resolvedVoiceId, text, modelId }) {
  const payload = JSON.stringify({
    text,
    model_id: modelId,
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
    },
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);
  try {
    return await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(
        resolvedVoiceId
      )}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Accept: 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': cleanKey,
        },
        body: payload,
      }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function synthesizeChapterWithElevenLabs({
  chapter,
  elevenLabsApiKey,
  voiceId = DEFAULT_ELEVENLABS_VOICE_ID,
}) {
  const cleanKey = sanitizeApiKey(elevenLabsApiKey);
  if (!cleanKey) {
    throw new Error('No ElevenLabs API key configured.');
  }

  const resolvedVoiceId = resolveVoiceId(voiceId);
  const fullChapterText = (chapter?.sentences || [])
    .map((s) => s.fullSentence)
    .join(' ')
    .trim();

  if (!fullChapterText) {
    throw new Error('Chapter has no sentences to narrate.');
  }

  let response = await requestElevenLabsTts({
    cleanKey,
    resolvedVoiceId,
    text: fullChapterText,
    modelId: 'eleven_multilingual_v2',
  });

  if (!response.ok && response.status !== 401 && response.status !== 402) {
    const fallbackResponse = await requestElevenLabsTts({
      cleanKey,
      resolvedVoiceId,
      text: fullChapterText,
      modelId: DEFAULT_ELEVENLABS_MODEL,
    });
    if (fallbackResponse.ok) {
      response = fallbackResponse;
    }
  }

  if (!response.ok) {
    const detailedError = await parseElevenLabsError(response);
    throw new Error(detailedError);
  }

  const blob = await response.blob();
  if (!blob || blob.size < 256) {
    throw new Error('ElevenLabs returned an empty audio stream.');
  }

  return URL.createObjectURL(blob);
}

export async function testElevenLabsConnection({
  elevenLabsApiKey,
  voiceId = DEFAULT_ELEVENLABS_VOICE_ID,
}) {
  const cleanKey = sanitizeApiKey(elevenLabsApiKey);
  if (!cleanKey) {
    throw new Error('Please enter your ElevenLabs API Key first.');
  }

  const resolvedVoiceId = resolveVoiceId(voiceId);
  const sampleText = 'Bonjour! ElevenLabs multilingual narration is connected.';

  let response = await requestElevenLabsTts({
    cleanKey,
    resolvedVoiceId,
    text: sampleText,
    modelId: 'eleven_multilingual_v2',
  });

  if (!response.ok && response.status !== 401 && response.status !== 402) {
    const fallbackResponse = await requestElevenLabsTts({
      cleanKey,
      resolvedVoiceId,
      text: sampleText,
      modelId: DEFAULT_ELEVENLABS_MODEL,
    });
    if (fallbackResponse.ok) {
      response = fallbackResponse;
    }
  }

  if (!response.ok) {
    const detailedError = await parseElevenLabsError(response);
    throw new Error(detailedError);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export function speakFullChapterWithWebSpeech({
  chapter,
  bcp47 = 'fr-FR',
  rate = 1.0,
  onSentenceStart,
  onComplete,
  onError,
}) {
  const sentences = (chapter?.sentences || []).map((s) => s.fullSentence).filter(Boolean);
  if (sentences.length === 0) {
    onComplete?.();
    return () => {};
  }

  ensurePlaybackAudioSession();

  let cancelled = false;
  let currentIdx = 0;

  const speakNext = () => {
    if (cancelled || currentIdx >= sentences.length) {
      if (!cancelled) onComplete?.();
      return;
    }

    const cleanText =
      sentences[currentIdx].replace(/[«»“”„"「」『』]/g, ' ').replace(/\s+/g, ' ').trim() ||
      sentences[currentIdx];

    speakUtteranceSafely(cleanText, bcp47, rate, {
      onStart: () => {
        if (!cancelled) onSentenceStart?.(currentIdx);
      },
      onEnd: () => {
        if (cancelled) return;
        currentIdx += 1;
        speakNext();
      },
      onError: () => {
        if (cancelled) return;
        onError?.('Tap "Play Full Chapter" once more to start voice narration.');
      },
    });
  };

  speakNext();

  return () => {
    cancelled = true;
    ACTIVE_UTTERANCE_REFS.length = 0;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  };
}
