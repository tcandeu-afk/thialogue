import {
  STORAGE_KEYS,
  DEFAULT_ELEVENLABS_VOICE_ID,
  ACQUISITION_EXPOSURE_THRESHOLD,
  MAX_RECYCLED_WORDS_PER_CHAPTER,
} from '../types/schema';
import { INITIAL_PROFILES } from '../data/initialProfiles';

export function loadProfiles() {
  try {
    const rawV4 = localStorage.getItem(STORAGE_KEYS.PROFILES);
    const rawV3 = localStorage.getItem(STORAGE_KEYS.LEGACY_PROFILES_V3);
    const rawV2 = localStorage.getItem(STORAGE_KEYS.LEGACY_PROFILES_V2);
    const rawV1 = localStorage.getItem(STORAGE_KEYS.LEGACY_PROFILES);
    const raw = rawV4 || rawV3 || rawV2 || rawV1;
    const isCurrentVersion = Boolean(rawV4);

    const merged = structuredClone(INITIAL_PROFILES);

    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(merged));
      return merged;
    }

    const parsed = JSON.parse(raw);

    for (const langId of Object.keys(merged)) {
      const savedProf = parsed[langId];
      if (!savedProf) continue;

      // Merge vocabBank (keep user's saved words + starter words)
      const savedVocab = Array.isArray(savedProf.vocabBank) ? savedProf.vocabBank : [];
      const existingBases = new Set(savedVocab.map((v) => v.baseForm));
      const combinedVocab = [
        ...savedVocab,
        ...merged[langId].vocabBank.filter((v) => !existingBases.has(v.baseForm)),
      ];

      // If loading from v4, preserve user's chapters and active progress.
      // If migrating from v1/v2/v3, load the new expanded v4 (8-9 sentence) character-and-dialogue fiction chapters!
      const starterChapters = merged[langId].chapters;
      const savedChapters = Array.isArray(savedProf.chapters) ? savedProf.chapters : [];

      const combinedChapters =
        isCurrentVersion && savedChapters.length > 0
          ? savedChapters.map((ch, idx) => ({
              ...ch,
              chapterNumber: idx + 1,
            }))
          : starterChapters;

      merged[langId] = {
        ...merged[langId],
        ...(isCurrentVersion ? savedProf : {}),
        storyTitle: merged[langId].storyTitle,
        vocabBank: combinedVocab,
        chapters: combinedChapters,
        activeChapterIndex: isCurrentVersion
          ? Math.min(savedProf.activeChapterIndex || 0, combinedChapters.length - 1)
          : 0,
      };
    }

    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(merged));
    return merged;
  } catch (err) {
    console.error('Failed to load profiles from localStorage, falling back to defaults:', err);
    return structuredClone(INITIAL_PROFILES);
  }
}

export function saveProfiles(profiles) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  } catch (err) {
    console.error('Failed to save profiles to localStorage:', err);
  }
}

export function loadActiveLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_LANG);
    if (saved && INITIAL_PROFILES[saved]) {
      return saved;
    }
  } catch (err) {
    console.error('Failed to read active language:', err);
  }
  return 'fr';
}

export function saveActiveLang(langId) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_LANG, langId);
  } catch (err) {
    console.error('Failed to save active language:', err);
  }
}

export function loadSettings() {
  const defaults = {
    geminiApiKey: '',
    elevenLabsApiKey: '',
    elevenLabsVoiceId: DEFAULT_ELEVENLABS_VOICE_ID,
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return {
      geminiApiKey: parsed.geminiApiKey || '',
      elevenLabsApiKey: parsed.elevenLabsApiKey || '',
      elevenLabsVoiceId: (parsed.elevenLabsVoiceId || DEFAULT_ELEVENLABS_VOICE_ID).trim(),
    };
  } catch (err) {
    console.error('Failed to load settings:', err);
    return defaults;
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify({
        geminiApiKey: (settings.geminiApiKey || '').trim(),
        elevenLabsApiKey: (settings.elevenLabsApiKey || '').trim(),
        elevenLabsVoiceId: (settings.elevenLabsVoiceId || DEFAULT_ELEVENLABS_VOICE_ID).trim(),
      })
    );
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function loadReaderPrefs() {
  const defaults = {
    strictMode: false,
    phoneticAid: true,
    showEnglishTranslation: false,
    readerOnlyMode: false,
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.READER_PREFS);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

export function saveReaderPrefs(prefs) {
  try {
    localStorage.setItem(STORAGE_KEYS.READER_PREFS, JSON.stringify(prefs));
  } catch (err) {
    console.error('Failed to save reader preferences:', err);
  }
}

/**
 * Normalizes a token surface or baseForm for reliable matching across Latin, CJK & Thai scripts.
 */
export function normalizeLexeme(str) {
  if (!str) return '';
  return str
    .trim()
    .replace(/[.,!?;:«»"“”'’()[\]{}،、。！？「」『』・—–-]/g, '')
    .toLowerCase();
}

const KNOWN_PROPER_NOUNS_AND_NAMES = new Set([
  // French
  'clara',
  'lucas',
  'paris',
  'henri',
  'monsieur henri',
  'paul',
  'nice',
  'marais',
  'rosiers',
  'café rouge',
  // Italian
  'marco',
  'sofia',
  'bologna',
  'firenze',
  'florence',
  'venezia',
  'venice',
  'bellini',
  'maestro bellini',
  // Spanish
  'elena',
  'mateo',
  'vega',
  'mendoza',
  'sevilla',
  'seville',
  // Korean
  '민호',
  '민호는',
  '민호가',
  '민호에게',
  '민호 씨',
  '지수',
  '지수는',
  '지수가',
  '지수 씨',
  '준호',
  '민지',
  '서울',
  '서울의',
  '한강',
  '인사동',
  // Japanese
  '遥',
  '遥さん',
  '蓮',
  '蓮さん',
  '健太',
  '美咲',
  '京都',
  '鴨川',
  // Thai
  'เลียม',
  'พลอย',
  'สมชาย',
  'ลุงสมชาย',
  'กรุงเทพฯ',
  'เจ้าพระยา',
  'แม่น้ำเจ้าพระยา',
  'ผัดไทย',
]);

const ENGLISH_PROPER_NAME_CUES = [
  'clara',
  'lucas',
  'paris',
  'henri',
  'paul',
  'nice',
  'marais',
  'rosiers',
  'marco',
  'sofia',
  'bologna',
  'florence',
  'venice',
  'bellini',
  'elena',
  'mateo',
  'vega',
  'mendoza',
  'seville',
  'minho',
  'jisoo',
  'junho',
  'minji',
  'seoul',
  'han river',
  'insadong',
  'haruka',
  'ren',
  'kenta',
  'misaki',
  'kyoto',
  'kamo river',
  'liam',
  'ploy',
  'somchai',
  'bangkok',
  'chao phraya',
];

/**
 * Returns true if a token is a character name, city/place name, pure number,
 * or non-lexical proper noun that should NOT be used as a vocabulary quiz target or distractor.
 */
export function isProperNounOrNonLexicalToken(token) {
  if (!token) return true;
  const rawSurf = String(token.surface || token.word || '').trim();
  const normSurf = normalizeLexeme(rawSurf);
  const normBase = normalizeLexeme(token.baseForm || rawSurf);
  const normMeaning = normalizeLexeme(token.contextualMeaning || '');

  if (!normSurf || /^\d+$/.test(normSurf) || /^\d+$/.test(normMeaning)) {
    return true;
  }

  if (KNOWN_PROPER_NOUNS_AND_NAMES.has(normSurf) || KNOWN_PROPER_NOUNS_AND_NAMES.has(normBase)) {
    return true;
  }

  // Check if the English gloss is just a character or city name
  for (const nameCue of ENGLISH_PROPER_NAME_CUES) {
    if (
      normMeaning === nameCue ||
      normMeaning === `as for ${nameCue}` ||
      normMeaning === `to ${nameCue}` ||
      normMeaning === `${nameCue} (subject)` ||
      normMeaning === `${nameCue} (topic)` ||
      normMeaning === `${nameCue}'s`
    ) {
      return true;
    }
  }

  // If capitalized Latin word has identical English translation (e.g. "Clara" -> "Clara", "Lucas" -> "Lucas")
  const strippedPunct = rawSurf.replace(/^[«"“”'’(\s]+|[.,!?;:»"“”'’)\s]+$/g, '');
  if (
    /^[A-ZÀ-ÖØ-Þ]/.test(strippedPunct) &&
    (normSurf === normMeaning || normBase === normMeaning)
  ) {
    return true;
  }

  return false;
}

/**
 * Selects up to 5 'learning' words from a language profile's vocabBank,
 * prioritizing the lowest exposures count first.
 */
export function getPriorityLearningWords(vocabBank = [], maxCount = MAX_RECYCLED_WORDS_PER_CHAPTER) {
  return [...vocabBank]
    .filter((entry) => entry.status === 'learning' && !isProperNounOrNonLexicalToken(entry))
    .sort((a, b) => {
      if (a.exposures !== b.exposures) return a.exposures - b.exposures;
      return (a.addedAt || 0) - (b.addedAt || 0);
    })
    .slice(0, maxCount);
}

/**
 * Increments exposures by +1 for all recycled vocabulary used in the completed chapter,
 * and automatically marks any word reaching 5 exposures as 'acquired'.
 */
export function updateVocabExposuresAfterChapter(vocabBank = [], completedChapter) {
  if (!completedChapter) return vocabBank;

  const usedForms = new Set();

  if (Array.isArray(completedChapter.recycledWordsUsed)) {
    completedChapter.recycledWordsUsed.forEach((w) => {
      usedForms.add(normalizeLexeme(w));
    });
  }

  if (Array.isArray(completedChapter.sentences)) {
    completedChapter.sentences.forEach((sentence) => {
      (sentence.tokens || []).forEach((token) => {
        if (token.baseForm) usedForms.add(normalizeLexeme(token.baseForm));
        if (token.surface) usedForms.add(normalizeLexeme(token.surface));
      });
    });
  }

  return vocabBank.map((entry) => {
    if (entry.status === 'acquired') return entry;

    const normBase = normalizeLexeme(entry.baseForm);
    const normWord = normalizeLexeme(entry.word);
    const wasUsed = (normBase && usedForms.has(normBase)) || (normWord && usedForms.has(normWord));

    if (!wasUsed) return entry;

    const nextExposures = (entry.exposures || 0) + 1;
    const nextStatus = nextExposures >= ACQUISITION_EXPOSURE_THRESHOLD ? 'acquired' : 'learning';

    return {
      ...entry,
      exposures: nextExposures,
      status: nextStatus,
    };
  });
}
