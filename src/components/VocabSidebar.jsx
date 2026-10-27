import React, { useState, useMemo } from 'react';
import {
  BookMarked,
  CheckCircle2,
  Volume2,
  Sparkles,
  ScrollText,
  Trash2,
  RefreshCw,
  Search,
  BookOpen,
  Plus,
  ArrowLeftRight,
  Loader2,
  X,
} from 'lucide-react';
import { speakSingleWord } from '../services/audioService';
import {
  getPriorityLearningWords,
  normalizeLexeme,
  isProperNounOrNonLexicalToken,
} from '../services/storageService';
import { lookupDictionaryWordOrPhrase } from '../services/translateService';
import { ACQUISITION_EXPOSURE_THRESHOLD } from '../types/schema';

export default function VocabSidebar({
  profile,
  chapter,
  onToggleWordStatus,
  onRemoveWord,
  onAddCustomVocabWord,
}) {
  const [activeTab, setActiveTab] = useState('learning');

  const [dictQuery, setDictQuery] = useState('');
  const [dictDirection, setDictDirection] = useState('to_en');
  const [dictResult, setDictResult] = useState(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [dictError, setDictError] = useState(null);
  const [justAddedToBank, setJustAddedToBank] = useState(false);

  const vocabBank = (profile?.vocabBank || []).filter(
    (w) => !isProperNounOrNonLexicalToken(w)
  );
  const learningWords = vocabBank.filter((w) => w.status === 'learning');
  const acquiredWords = vocabBank.filter((w) => w.status === 'acquired');
  const priorityNextFive = getPriorityLearningWords(vocabBank, 5);
  const priorityBaseForms = new Set(priorityNextFive.map((w) => w.baseForm));

  const displayedWords = activeTab === 'learning' ? learningWords : acquiredWords;

  const uniqueChapterWords = useMemo(() => {
    const seen = new Set();
    const list = [];

    (chapter?.sentences || []).forEach((sentence) => {
      (sentence.tokens || []).forEach((token) => {
        if (isProperNounOrNonLexicalToken(token)) return;

        const cleanSurface = (token.surface || '')
          .replace(/[.,!?;:«»"“”'’()[\]{}،、。！？「」『』・]/g, '')
          .trim();
        const cleanBase = (token.baseForm || cleanSurface)
          .replace(/[.,!?;:«»"“”'’()[\]{}،、。！？「」『』・]/g, '')
          .trim();

        if (!cleanSurface && !cleanBase) return;

        const dedupeKey = normalizeLexeme(cleanBase || cleanSurface);
        if (!dedupeKey || seen.has(dedupeKey)) return;

        seen.add(dedupeKey);
        list.push({
          surface: cleanSurface || token.surface,
          baseForm: cleanBase || cleanSurface,
          reading: token.reading || null,
          contextualMeaning: token.contextualMeaning || '',
        });
      });
    });

    return list;
  }, [chapter]);

  const handleDictionaryLookup = async (e) => {
    e?.preventDefault();
    const trimmed = dictQuery.trim();
    if (!trimmed) return;

    setIsLookingUp(true);
    setDictError(null);
    setJustAddedToBank(false);

    const sl = dictDirection === 'to_en' ? profile.translateCode : 'en';
    const tl = dictDirection === 'to_en' ? 'en' : profile.translateCode;

    try {
      const res = await lookupDictionaryWordOrPhrase({
        query: trimmed,
        sourceLang: sl,
        targetLang: tl,
      });
      setDictResult(res);
    } catch (err) {
      setDictError(err.message || 'Lookup failed. Check your connection.');
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleSaveLookupToBank = () => {
    if (!dictResult) return;
    const targetWord =
      dictDirection === 'to_en' ? dictResult.query : dictResult.primaryTranslation;
    const englishMeaning =
      dictDirection === 'to_en' ? dictResult.primaryTranslation : dictResult.query;

    onAddCustomVocabWord({
      surface: targetWord,
      reading: dictResult.phonetic || null,
      baseForm: targetWord,
      contextualMeaning: englishMeaning,
    });
    setJustAddedToBank(true);
  };

  return (
    <aside className="space-y-4">
      {/* 1. Interactive Dictionary & Phrase Lookup Box (Quiet Fjord Blue Zone) */}
      <div className="rounded-2xl border border-[#C9DCE8] bg-[#FFFFFF] p-4 shadow-2xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#234E68]">
            <BookOpen className="h-4 w-4" />
            <span>Dictionary &amp; Phrase Lookup</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setDictDirection((prev) => (prev === 'to_en' ? 'from_en' : 'to_en'));
              setDictResult(null);
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-[#C9DCE8] bg-[#F1F6FA] px-2 py-0.5 text-[11px] font-semibold text-[#1E3F54] hover:bg-[#E4EFF6]"
            title="Switch lookup direction"
          >
            <span>
              {dictDirection === 'to_en'
                ? `${profile.name} → English`
                : `English → ${profile.name}`}
            </span>
            <ArrowLeftRight className="h-3 w-3 text-[#234E68]" />
          </button>
        </div>

        <p className="mt-1 text-[11px] text-[#5C6661]">
          Consult any word or sentence (even outside the story) and save it to your Vocab Bank.
        </p>

        <form onSubmit={handleDictionaryLookup} className="mt-2.5 flex gap-1.5">
          <input
            type="text"
            value={dictQuery}
            onChange={(e) => setDictQuery(e.target.value)}
            placeholder={
              dictDirection === 'to_en'
                ? `Type any ${profile.name} word or sentence...`
                : `Type an English word or phrase...`
            }
            className="flex-1 rounded-xl border border-[#C9DCE8] bg-[#F4F8FA] px-3 py-1.5 text-xs text-[#181D1B] placeholder:text-[#7B8E99] focus:border-[#234E68] focus:bg-white focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLookingUp || !dictQuery.trim()}
            className="inline-flex items-center gap-1 rounded-xl bg-[#234E68] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#1B3E54] disabled:opacity-50"
          >
            {isLookingUp ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Search className="h-3.5 w-3.5" />
            )}
            <span>Consult</span>
          </button>
        </form>

        {dictError && (
          <p className="mt-2 text-xs text-[#8C4A3E]">{dictError}</p>
        )}

        {dictResult && (
          <div className="mt-3 rounded-xl border border-[#C9DCE8] bg-[#F3F8FB] p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-serif text-base font-bold text-[#181D1B]">
                    {dictResult.primaryTranslation}
                  </span>
                  {dictResult.phonetic && (
                    <span className="rounded border border-[#D5D9E8] bg-[#FFFFFF] px-1.5 py-0.5 text-[10px] font-medium text-[#3E4563]">
                      {dictResult.phonetic}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#5C6661]">
                  Query: &ldquo;{dictResult.query}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const textToSpeak =
                      dictDirection === 'to_en'
                        ? dictResult.query
                        : dictResult.primaryTranslation;
                    speakSingleWord(textToSpeak, profile.bcp47);
                  }}
                  className="rounded-lg border border-[#C9DCE8] bg-[#FFFFFF] p-1.5 text-[#234E68] hover:bg-[#E4EFF6]"
                  title={`Pronounce in ${profile.name} (${profile.bcp47})`}
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleSaveLookupToBank}
                  disabled={justAddedToBank}
                  className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition ${
                    justAddedToBank
                      ? 'bg-[#2D5A46] text-white'
                      : 'bg-[#234E68] text-white hover:bg-[#1B3E54]'
                  }`}
                  title="Add this word to your Vocab Bank for story recycling"
                >
                  {justAddedToBank ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3 w-3" />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {Array.isArray(dictResult.dictionaryEntries) &&
              dictResult.dictionaryEntries.length > 0 && (
                <div className="mt-2.5 space-y-1.5 border-t border-[#D5E4EE] pt-2">
                  {dictResult.dictionaryEntries.map((entry, idx) => (
                    <div key={idx} className="text-[11px]">
                      <span className="font-semibold italic text-[#234E68]">
                        {entry.partOfSpeech}:{' '}
                      </span>
                      <span className="text-[#181D1B]">
                        {entry.terms.join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}
      </div>

      {/* 2. Independent Vocabulary Bank Card (Warm Ochre Learning + Pine-Sage Acquired) */}
      <div className="rounded-2xl border border-[#E2E7E4] bg-[#FFFFFF] p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#785420]">
            <BookMarked className="h-4 w-4 text-[#B88328]" />
            <span>{profile.name} Vocab Bank</span>
          </div>
          <span className="rounded-full border border-[#E8D7B4] bg-[#FDF8EE] px-2 py-0.5 text-[11px] font-semibold text-[#785420]">
            {vocabBank.length} Total
          </span>
        </div>

        {/* Next Chapter Priority Queue Banner with X remove buttons */}
        {priorityNextFive.length > 0 && (
          <div className="mt-3 rounded-xl border border-[#E6D6B8] bg-[#FBF7F0] p-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#785420]">
              <Sparkles className="h-3.5 w-3.5 text-[#B88328]" />
              <span>Queued for Next Chapter (Top {priorityNextFive.length}):</span>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {priorityNextFive.map((item, idx) => (
                <span
                  key={`${item.baseForm}-${idx}`}
                  className="inline-flex items-center gap-1 rounded-md border border-[#E6D6B8] bg-[#FFFFFF] pl-2 pr-1 py-0.5 text-[11px] font-medium text-[#181D1B] shadow-2xs"
                >
                  <span>{item.baseForm}</span>
                  <span className="text-[10px] font-semibold text-[#9C6F23]">
                    ({item.exposures}/5)
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveWord(item.baseForm)}
                    className="ml-0.5 rounded p-0.5 text-[#87928D] transition hover:bg-red-100 hover:text-red-800"
                    title={`Remove "${item.baseForm}" from queue and Vocab Bank`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tabs: Learning (Warm Ochre) vs Acquired (Pine-Sage) */}
        <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-[#F3F6F4] p-1">
          <button
            type="button"
            onClick={() => setActiveTab('learning')}
            className={`rounded-lg py-1.5 text-xs font-semibold transition ${
              activeTab === 'learning'
                ? 'bg-[#8F6523] text-white shadow-2xs'
                : 'text-[#5C6661] hover:text-[#181D1B]'
            }`}
          >
            Learning ({learningWords.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('acquired')}
            className={`rounded-lg py-1.5 text-xs font-semibold transition ${
              activeTab === 'acquired'
                ? 'bg-[#2D5A46] text-white shadow-2xs'
                : 'text-[#5C6661] hover:text-[#181D1B]'
            }`}
          >
            Acquired ({acquiredWords.length})
          </button>
        </div>

        {/* Independent Scrollable Word List */}
        <div className="mt-3 max-h-[260px] space-y-2 overflow-y-auto pr-1">
          {displayedWords.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#D5DDD9] p-5 text-center text-xs text-[#737F79]">
              {activeTab === 'learning'
                ? 'Click any word in the story or use the Dictionary box above to save words to your Learning bank.'
                : 'Words automatically graduate to Acquired once they reach 5 contextual exposures across chapters.'}
            </div>
          ) : (
            displayedWords.map((entry, idx) => {
              const isQueued =
                entry.status === 'learning' && priorityBaseForms.has(entry.baseForm);
              const progressPct = Math.min(
                100,
                Math.round(((entry.exposures || 0) / ACQUISITION_EXPOSURE_THRESHOLD) * 100)
              );

              return (
                <div
                  key={`${entry.baseForm}-${idx}`}
                  className="rounded-xl border border-[#E6ECE9] bg-[#F9FBF9] p-2.5 transition hover:border-[#C9D6D0]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-baseline gap-1.5">
                        <span className="font-serif text-base font-bold text-[#181D1B]">
                          {entry.word}
                        </span>
                        {entry.reading && (
                          <span className="text-[11px] font-medium text-[#464E70]">
                            [{entry.reading}]
                          </span>
                        )}
                        {entry.baseForm && entry.baseForm !== entry.word && (
                          <span className="text-[11px] text-[#737F79]">
                            ({entry.baseForm})
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs font-medium text-[#2C3531]">
                        {entry.contextualMeaning}
                      </p>
                    </div>

                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => speakSingleWord(entry.word, profile.bcp47)}
                        className="rounded-md p-1.5 text-[#5C6661] hover:bg-[#E4EFF6] hover:text-[#234E68]"
                        title={`Pronounce (${profile.bcp47})`}
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleWordStatus(entry.baseForm)}
                        className="rounded-md p-1.5 text-[#5C6661] hover:bg-[#E5F0EA] hover:text-[#2D5A46]"
                        title={
                          entry.status === 'learning'
                            ? 'Mark as Acquired now'
                            : 'Move back to Learning'
                        }
                      >
                        {entry.status === 'learning' ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <RefreshCw className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveWord(entry.baseForm)}
                        className="rounded-md p-1.5 text-[#87928D] hover:bg-red-100 hover:text-red-800"
                        title="Remove from Vocab Bank"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Exposure Progress Bar */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[10px] font-medium text-[#5C6661]">
                      <span>
                        Exposures: <strong>{entry.exposures}</strong> /{' '}
                        {ACQUISITION_EXPOSURE_THRESHOLD}
                      </span>
                      {isQueued && (
                        <span className="rounded border border-[#E6D6B8] bg-[#FDF8EE] px-1.5 py-0.2 font-semibold text-[#785420]">
                          Next Chapter Target
                        </span>
                      )}
                      {entry.status === 'acquired' && (
                        <span className="rounded border border-[#C2DFD0] bg-[#EFF6F2] px-1.5 py-0.2 font-semibold text-[#285943]">
                          Acquired
                        </span>
                      )}
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#E6ECE9]">
                      <div
                        className={`h-full transition-all duration-300 ${
                          entry.status === 'acquired' ? 'bg-[#3B7A57]' : 'bg-[#C9963E]'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. Chapter Word Vocab Table (Prominent Bottom-Right Desktop Reference Table) */}
      <div className="rounded-2xl border border-[#D5E1E8] bg-[#FFFFFF] p-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-[#E8ECEA] pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#234E68]">
            <BookOpen className="h-4 w-4 text-[#234E68]" />
            <span>Chapter {chapter?.chapterNumber || 1} Word Vocab Table</span>
          </div>
          <span className="rounded-full border border-[#C9DCE8] bg-[#F1F6FA] px-2 py-0.5 text-[11px] font-semibold text-[#1E3F54]">
            {uniqueChapterWords.length} Words
          </span>
        </div>

        <div className="mt-2 max-h-[340px] overflow-y-auto pr-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E6ECE9] text-[10px] font-semibold uppercase tracking-wider text-[#5C6661]">
                <th className="py-1.5 pr-2">Word / Base</th>
                <th className="py-1.5 px-2">Meaning in Chapter</th>
                <th className="py-1.5 pl-1 text-right">Audio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF2F0] text-xs">
              {uniqueChapterWords.map((item, idx) => (
                <tr
                  key={`${item.baseForm}-${idx}`}
                  className="transition hover:bg-[#F4F8FA]"
                >
                  <td className="py-2 pr-2 align-top">
                    <button
                      type="button"
                      onClick={() => {
                        speakSingleWord(item.surface, profile.bcp47);
                        onAddCustomVocabWord?.(item);
                      }}
                      className="text-left font-serif text-sm font-bold text-[#181D1B] hover:text-[#234E68]"
                      title="Click to pronounce and save to Vocab Bank"
                    >
                      {item.surface}
                    </button>
                    {item.reading && (
                      <span className="ml-1 text-[10px] font-medium text-[#525A78]">
                        [{item.reading}]
                      </span>
                    )}
                    {item.baseForm &&
                      normalizeLexeme(item.baseForm) !== normalizeLexeme(item.surface) && (
                        <div className="text-[10px] italic text-[#737F79]">
                          base: {item.baseForm}
                        </div>
                      )}
                  </td>
                  <td className="py-2 px-2 align-top text-xs font-medium text-[#2C3531]">
                    {item.contextualMeaning}
                  </td>
                  <td className="py-2 pl-1 align-top text-right">
                    <button
                      type="button"
                      onClick={() => speakSingleWord(item.surface, profile.bcp47)}
                      className="inline-flex items-center justify-center rounded-lg border border-[#DCE2DF] bg-[#F7F9F8] p-1.5 text-[#234E68] hover:bg-[#E4EFF6]"
                      title={`Pronounce "${item.surface}"`}
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Running Story Arc Summary Card */}
      <div className="rounded-2xl border border-[#E2E7E4] bg-[#FFFFFF] p-4 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#464E70]">
          <ScrollText className="h-4 w-4" />
          <span>Running Story Arc Summary</span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-[#2C3531]">
          {profile.storyArcSummary}
        </p>
        <div className="mt-2.5 flex items-center justify-between border-t border-[#E8ECEA] pt-2 text-[11px] text-[#737F79]">
          <span>Fed into Gemini 2.5 Flash on next chapter</span>
          <span className="font-semibold text-[#464E70]">
            {profile.chapters?.length || 1} Chapters
          </span>
        </div>
      </div>
    </aside>
  );
}
