/**
 * ============================================================================
 * LOCALSTORAGE & GEMINI ARCHITECTURE SCHEMA
 * ============================================================================
 *
 * 1. LocalStorage Keys:
 *    - "luminaread_profiles_v4": Record<LanguageId, LanguageProfile>
 *    - "luminaread_active_lang_v1": LanguageId ('fr' | 'it' | 'ja' | 'es')
 *    - "luminaread_settings_v1": UserSettings
 *    - "luminaread_reader_prefs_v1": ReaderPrefs
 */

export const STORAGE_KEYS = {
  PROFILES: 'luminaread_profiles_v4',
  LEGACY_PROFILES_V3: 'luminaread_profiles_v3',
  LEGACY_PROFILES_V2: 'luminaread_profiles_v2',
  LEGACY_PROFILES: 'luminaread_profiles_v1',
  ACTIVE_LANG: 'luminaread_active_lang_v1',
  SETTINGS: 'luminaread_settings_v1',
  READER_PREFS: 'luminaread_reader_prefs_v1',
};

export const DEFAULT_ELEVENLABS_VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb';
export const DEFAULT_ELEVENLABS_MODEL = 'eleven_v3';
export const ACQUISITION_EXPOSURE_THRESHOLD = 5;
export const MAX_RECYCLED_WORDS_PER_CHAPTER = 5;

export const LANGUAGE_METADATA = [
  {
    id: 'fr',
    name: 'French',
    nativeName: 'Français',
    cefrLevel: 'A1 Beginner',
    bcp47: 'fr-FR',
    translateCode: 'fr',
    flag: '🇫🇷',
    isCJK: false,
    hasFurigana: false,
    noWordSpaces: false,
    domainFocus: 'Everyday Paris Mystery & Café Culture',
  },
  {
    id: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    cefrLevel: 'A1 Beginner',
    bcp47: 'it-IT',
    translateCode: 'it',
    flag: '🇮🇹',
    isCJK: false,
    hasFurigana: false,
    noWordSpaces: false,
    domainFocus: 'Travel, Trains & Italian Piazzas',
  },
  {
    id: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    cefrLevel: 'A1 Beginner',
    bcp47: 'ja-JP',
    translateCode: 'ja',
    flag: '🇯🇵',
    isCJK: true,
    hasFurigana: true,
    noWordSpaces: true,
    domainFocus: 'Kyoto Shops, Seasons & Daily Conversations',
  },
  {
    id: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    cefrLevel: 'B1 Intermediate',
    bcp47: 'es-ES',
    translateCode: 'es',
    flag: '🇪🇸',
    isCJK: false,
    hasFurigana: false,
    noWordSpaces: false,
    domainFocus: 'Coastal Mystery & Rich Narrative',
  },
];

/**
 * Strict JSON Schema passed to Gemini 2.5 Flash via generationConfig.responseSchema
 * to guarantee pre-tokenised sentences, Furigana readings, English translations, and 0ms click latency.
 */
export const GEMINI_CHAPTER_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    chapterTitle: {
      type: 'STRING',
      description: 'Title of the chapter in the target language (with an English subtitle)',
    },
    updatedArcSummary: {
      type: 'STRING',
      description: '2-sentence summary in English of the story plot so far, including the events of this chapter.',
    },
    recycledWordsUsed: {
      type: 'ARRAY',
      description: 'List of baseForms of the target learning words that were naturally woven into this chapter.',
      items: { type: 'STRING' },
    },
    sentences: {
      type: 'ARRAY',
      description: 'Sequential sentences forming a cohesive, engaging graded-reader story chapter.',
      items: {
        type: 'OBJECT',
        properties: {
          fullSentence: {
            type: 'STRING',
            description: 'The complete native sentence string.',
          },
          englishTranslation: {
            type: 'STRING',
            description: 'Natural, clear English translation of the full sentence for beginners.',
          },
          romanisation: {
            type: 'STRING',
            nullable: true,
            description: 'Hepburn Romaji for Japanese. Must be null for French, Italian, and Spanish.',
          },
          grammarNote: {
            type: 'STRING',
            description: '1-sentence plain-English explanation of the core sentence pattern used in this sentence, avoiding dense textbook jargon.',
          },
          tokens: {
            type: 'ARRAY',
            description: 'Every clickable word/morpheme token in order so concatenating them reconstructs the sentence cleanly.',
            items: {
              type: 'OBJECT',
              properties: {
                surface: {
                  type: 'STRING',
                  description: 'Exact word or token as it appears in the sentence.',
                },
                reading: {
                  type: 'STRING',
                  nullable: true,
                  description: 'Hiragana reading (Furigana) ONLY when the language is Japanese AND this token contains Kanji. Null for others.',
                },
                baseForm: {
                  type: 'STRING',
                  description: 'Dictionary or infinitive form of the word.',
                },
                contextualMeaning: {
                  type: 'STRING',
                  description: 'Brief, natural English meaning in this specific sentence context.',
                },
              },
              required: ['surface', 'reading', 'baseForm', 'contextualMeaning'],
            },
          },
        },
        required: ['fullSentence', 'englishTranslation', 'romanisation', 'grammarNote', 'tokens'],
      },
    },
    recapModule: {
      type: 'OBJECT',
      description: 'Complete end-of-chapter learning consolidation & active-recall module tailored to this chapter.',
      properties: {
        subtitle: {
          type: 'STRING',
          description: 'Short summary of the key grammar & vocabulary focus of this chapter.',
        },
        vocabReuses: {
          type: 'ARRAY',
          description: '3 key words/phrases from this chapter transferred into fresh everyday sentences.',
          items: {
            type: 'OBJECT',
            properties: {
              word: { type: 'STRING', description: 'Target word/phrase with English gloss in parentheses, e.g. "la clé (the key)"' },
              storyContext: { type: 'STRING', description: 'Exact sentence from this chapter where the word appeared.' },
              newPhrase: { type: 'STRING', description: 'Brand-new everyday sentence in the target language using this word in a different context.' },
              english: { type: 'STRING', description: 'English translation of newPhrase.' },
            },
            required: ['word', 'storyContext', 'newPhrase', 'english'],
          },
        },
        construction: {
          type: 'OBJECT',
          description: 'Core sentence pattern blueprint from this chapter with formula and 3 highlighted examples.',
          properties: {
            patternName: { type: 'STRING', description: 'Clear name of the grammatical pattern.' },
            explanation: { type: 'STRING', description: 'Plain-English 1-2 sentence explanation of how the pattern works.' },
            formula: {
              type: 'ARRAY',
              description: '3 to 4 formula building block chips showing how the pattern is constructed.',
              items: { type: 'STRING' },
            },
            examples: {
              type: 'ARRAY',
              description: '3 fresh example sentences illustrating this pattern.',
              items: {
                type: 'OBJECT',
                properties: {
                  target: { type: 'STRING', description: 'Example sentence in the target language.' },
                  english: { type: 'STRING', description: 'English translation of the example sentence.' },
                  highlight: { type: 'STRING', description: 'Exact substring inside target to highlight.' },
                },
                required: ['target', 'english', 'highlight'],
              },
            },
          },
          required: ['patternName', 'explanation', 'formula', 'examples'],
        },
      },
      required: ['subtitle', 'vocabReuses', 'construction'],
    },
  },
  required: ['chapterTitle', 'updatedArcSummary', 'recycledWordsUsed', 'sentences', 'recapModule'],
};
