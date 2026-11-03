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
  Lightbulb,
  Check,
} from 'lucide-react';
import { speakSingleWord } from '../services/audioService';
import {
  getPriorityLearningWords,
  normalizeLexeme,
  isProperNounOrNonLexicalToken,
} from '../services/storageService';
import {
  lookupDictionaryWordOrPhrase,
  getCuratedWordUsageData,
} from '../services/translateService';
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

  // Popup modal state for inspecting a word from the Chapter Word Table
  const [inspectedWord, setInspectedWord] = useState(null);
  const [inspectedDictData, setInspectedDictData] = useState(null);
  const [isInspectingDict, setIsInspectingDict] = useState(false);
  const [inspectedSaved, setInspectedSaved] = useState(false);

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

    return list.sort((a, b) =>
      (a.surface || '').localeCompare(b.surface || '', profile?.bcp47 || undefined, {
        sensitivity: 'base',
      })
    );
  }, [chapter, profile?.bcp47]);

  const handleDictionaryLookup = async (e) => {
    e?.preventDefault();
    const trimmed = dictQuery.trim();
    if (!trimmed) return;

    setIsLookingUp(true);
    setDictError(null);
    setJustAddedToBank(false);

    const helperCode = profile?.id === 'en' ? 'pt' : 'en';
    const sl = dictDirection === 'to_en' ? profile.translateCode : helperCode;
    const tl = dictDirection === 'to_en' ? helperCode : profile.translateCode;

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

  const helperLangLabel = profile?.id === 'en' ? 'Português (BR)' : 'English';
  const isPtBr = profile?.id === 'en';
  const targetLangShort = isPtBr ? 'Inglês' : profile.name.split(' ')[0];

  const handleInspectChapterWord = async (wordItem) => {
    const usageData = getCuratedWordUsageData(wordItem, chapter, profile);
    setInspectedWord({
      ...wordItem,
      ...usageData,
    });
    setInspectedDictData(null);
    setInspectedSaved(false);
    setIsInspectingDict(true);

    speakSingleWord(wordItem.surface, profile.bcp47);

    const helperCode = isPtBr ? 'pt' : 'en';
    try {
      const res = await lookupDictionaryWordOrPhrase({
        query: wordItem.baseForm || wordItem.surface,
        sourceLang: profile.translateCode,
        targetLang: helperCode,
      });
      setInspectedDictData(res);
    } catch {
      // Keep curated + chapter usage even if offline
    } finally {
      setIsInspectingDict(false);
    }
  };

  return (
    <aside className="space-y-4">
      {/* 1. Interactive Dictionary & Phrase Lookup Box (Quiet Fjord Blue Zone) */}
      <div className="rounded-2xl border border-[#C9DCE8] bg-[#FFFFFF] p-4 shadow-2xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#234E68]">
            <BookOpen className="h-4 w-4" />
            <span>
              {isPtBr
                ? 'Dicionário e Busca de Frases'
                : 'Dictionary & Phrase Lookup'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setDictDirection((prev) => (prev === 'to_en' ? 'from_en' : 'to_en'));
              setDictResult(null);
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-[#C9DCE8] bg-[#F1F6FA] px-2 py-0.5 text-[11px] font-semibold text-[#1E3F54] hover:bg-[#E4EFF6]"
            title={
              isPtBr ? 'Inverter direção da tradução' : 'Switch lookup direction'
            }
          >
            <span>
              {dictDirection === 'to_en'
                ? `${targetLangShort} → ${helperLangLabel}`
                : `${helperLangLabel} → ${targetLangShort}`}
            </span>
            <ArrowLeftRight className="h-3 w-3 text-[#234E68]" />
          </button>
        </div>

        <p className="mt-1 text-[11px] text-[#5C6661]">
          {isPtBr
            ? 'Consulte qualquer palavra ou frase (mesmo fora da história) e salve no seu Banco de Vocabulário.'
            : 'Consult any word or sentence (even outside the story) and save it to your Vocab Bank.'}
        </p>

        <form onSubmit={handleDictionaryLookup} className="mt-2.5 flex gap-1.5">
          <input
            type="text"
            value={dictQuery}
            onChange={(e) => setDictQuery(e.target.value)}
            placeholder={
              isPtBr
                ? dictDirection === 'to_en'
                  ? 'Digite uma palavra ou frase em Inglês...'
                  : 'Digite uma palavra ou frase em Português...'
                : dictDirection === 'to_en'
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
            <span>{isPtBr ? 'Consultar' : 'Consult'}</span>
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
                  {isPtBr ? 'Busca:' : 'Query:'} &ldquo;{dictResult.query}&rdquo;
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
                  title={
                    isPtBr
                      ? 'Ouvir pronúncia em Inglês'
                      : `Pronounce in ${profile.name} (${profile.bcp47})`
                  }
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
                  title={
                    isPtBr
                      ? 'Salvar esta palavra no seu Banco de Vocabulário'
                      : 'Add this word to your Vocab Bank for story recycling'
                  }
                >
                  {justAddedToBank ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{isPtBr ? 'Salva' : 'Saved'}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3 w-3" />
                      <span>{isPtBr ? 'Salvar' : 'Save'}</span>
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

      {/* 2. Independent Vocabulary Bank Card */}
      <div className="rounded-2xl border border-[#E2E7E4] bg-[#FFFFFF] p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#785420]">
            <BookMarked className="h-4 w-4 text-[#B88328]" />
            <span>
              {isPtBr
                ? 'Banco de Vocabulário (Inglês)'
                : `${profile.name} Vocab Bank`}
            </span>
          </div>
          <span className="rounded-full border border-[#E8D7B4] bg-[#FDF8EE] px-2 py-0.5 text-[11px] font-semibold text-[#785420]">
            {isPtBr ? `${vocabBank.length} no Total` : `${vocabBank.length} Total`}
          </span>
        </div>

        {/* Independent Scrollable Word List */}
        <div className="mt-3 max-h-[280px] space-y-2 overflow-y-auto pr-1">
          {vocabBank.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#D5DDD9] p-5 text-center text-xs text-[#737F79]">
              {isPtBr
                ? 'Clique em qualquer palavra na história ou use o Dicionário acima para salvar palavras no seu Banco de Vocabulário.'
                : 'Click any word in the story or use the Dictionary box above to save words to your Vocab Bank.'}
            </div>
          ) : (
            vocabBank.map((entry, idx) => (
              <div
                key={`${entry.baseForm}-${idx}`}
                className="flex items-center justify-between gap-2 rounded-xl border border-[#E6ECE9] bg-[#F9FBF9] px-3 py-2.5 transition hover:border-[#C9D6D0]"
              >
                <div className="min-w-0">
                  <div className="font-serif text-base font-bold text-[#181D1B]">
                    {entry.word}
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-[#2C3531]">
                    {entry.contextualMeaning}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => speakSingleWord(entry.word, profile.bcp47)}
                    className="rounded-md p-1.5 text-[#5C6661] hover:bg-[#E4EFF6] hover:text-[#234E68] cursor-pointer"
                    title={isPtBr ? 'Ouvir pronúncia' : `Pronounce (${profile.bcp47})`}
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveWord(entry.baseForm)}
                    className="rounded-md p-1.5 text-[#87928D] hover:bg-red-100 hover:text-red-800 cursor-pointer"
                    title={
                      isPtBr ? 'Remover do Banco de Vocabulário' : 'Remove from Vocab Bank'
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. Chapter Word Vocab Table (Full Alphabetical Reference Table without inner scrollbar) */}
      <div className="rounded-2xl border border-[#D5E1E8] bg-[#FFFFFF] p-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-[#E8ECEA] pb-2.5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#234E68]">
              <BookOpen className="h-4 w-4 text-[#234E68]" />
              <span>
                {isPtBr
                  ? `Palavras do Capítulo ${chapter?.chapterNumber || 1} (A–Z)`
                  : `Chapter ${chapter?.chapterNumber || 1} Word Vocab Table (A–Z)`}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-[#5C6661]">
              {isPtBr
                ? 'Clique em qualquer palavra para ver exemplos de uso no dia a dia e variações.'
                : 'Click any word to open everyday examples, nuances, and variations.'}
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-[#C9DCE8] bg-[#F1F6FA] px-2 py-0.5 text-[11px] font-semibold text-[#1E3F54]">
            {isPtBr
              ? `${uniqueChapterWords.length} Palavras`
              : `${uniqueChapterWords.length} Words`}
          </span>
        </div>

        <div className="mt-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E6ECE9] text-[10px] font-semibold uppercase tracking-wider text-[#5C6661]">
                <th className="py-1.5 pr-2">
                  {isPtBr ? 'Palavra em Inglês' : 'Word / Base'}
                </th>
                <th className="py-1.5 px-2">
                  {isPtBr ? 'Significado no Capítulo' : 'Meaning in Chapter'}
                </th>
                <th className="py-1.5 pl-1 text-right">
                  {isPtBr ? 'Ouvir' : 'Audio'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF2F0] text-xs">
              {uniqueChapterWords.map((item, idx) => (
                <tr
                  key={`${item.baseForm}-${idx}`}
                  onClick={() => handleInspectChapterWord(item)}
                  className="group cursor-pointer transition hover:bg-[#EDF5FA]"
                >
                  <td className="py-2 pr-2 align-top">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInspectChapterWord(item);
                      }}
                      className="inline-flex items-center gap-1 text-left font-serif text-sm font-bold text-[#181D1B] underline decoration-[#B5C9D6] decoration-dotted underline-offset-4 group-hover:text-[#234E68] group-hover:decoration-[#234E68] cursor-pointer"
                      title={
                        isPtBr
                          ? 'Clique para ver exemplos do dia a dia e variações desta palavra'
                          : 'Click to see everyday examples and variations for this word'
                      }
                    >
                      <span>{item.surface}</span>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        speakSingleWord(item.surface, profile.bcp47);
                      }}
                      className="inline-flex items-center justify-center rounded-lg border border-[#DCE2DF] bg-[#F7F9F8] p-1.5 text-[#234E68] hover:bg-[#E4EFF6] cursor-pointer"
                      title={
                        isPtBr
                          ? `Ouvir "${item.surface}"`
                          : `Pronounce "${item.surface}"`
                      }
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

      {/* Everyday Usage & Variations Popup Modal when clicking any word in the Chapter Table */}
      {inspectedWord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs"
          onClick={() => setInspectedWord(null)}
        >
          <div
            className="relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#C9DCE8] bg-[#FFFFFF] p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#E6ECE9] pb-3.5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-serif text-2xl font-bold text-[#181D1B]">
                    {inspectedWord.surface}
                  </span>
                  {inspectedWord.reading && (
                    <span className="rounded-md border border-[#D5D9E8] bg-[#F4F6FB] px-2 py-0.5 text-xs font-medium text-[#3E4563]">
                      {inspectedWord.reading}
                    </span>
                  )}
                  {inspectedWord.baseForm &&
                    normalizeLexeme(inspectedWord.baseForm) !==
                      normalizeLexeme(inspectedWord.surface) && (
                      <span className="rounded-md bg-[#F1F5F3] px-2 py-0.5 text-xs italic text-[#5C6661]">
                        base: {inspectedWord.baseForm}
                      </span>
                    )}
                </div>
                <p className="mt-1 text-sm font-semibold text-[#234E68]">
                  {isPtBr ? 'No capítulo:' : 'In this chapter:'}{' '}
                  <span className="text-[#181D1B]">
                    {inspectedWord.contextualMeaning}
                  </span>
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => speakSingleWord(inspectedWord.surface, profile.bcp47)}
                  className="inline-flex items-center gap-1 rounded-xl border border-[#C9DCE8] bg-[#F1F6FA] px-2.5 py-1.5 text-xs font-semibold text-[#234E68] hover:bg-[#E2EEF6] cursor-pointer"
                  title={isPtBr ? 'Ouvir pronúncia' : 'Listen to pronunciation'}
                >
                  <Volume2 className="h-4 w-4" />
                  <span>{isPtBr ? 'Ouvir' : 'Listen'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onAddCustomVocabWord?.(inspectedWord);
                    setInspectedSaved(true);
                  }}
                  className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    inspectedSaved
                      ? 'bg-[#2D5A46] text-white'
                      : 'bg-[#234E68] text-white hover:bg-[#1B3E54]'
                  }`}
                >
                  {inspectedSaved ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>{isPtBr ? 'Salva' : 'Saved'}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      <span>{isPtBr ? 'Salvar no Banco' : 'Save to Bank'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setInspectedWord(null)}
                  className="rounded-xl p-1.5 text-[#5C6661] hover:bg-[#EEF2F0] hover:text-[#181D1B] cursor-pointer"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {/* 1. Nuance / False-Friend / Preposition Note */}
              {inspectedWord.nuanceNote && (
                <div className="rounded-xl border border-[#E6D5B8] bg-[#FDF9F1] p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8A5A19]">
                    <Lightbulb className="h-4 w-4 text-[#C68628]" />
                    <span>
                      {isPtBr
                        ? 'Dica de Uso e Nuances no Dia a Dia'
                        : 'Everyday Usage & Nuance Tip'}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#2C3531]">
                    {inspectedWord.nuanceNote}
                  </p>
                </div>
              )}

              {/* 2. Common Variations & Expressions */}
              {Array.isArray(inspectedWord.variations) &&
                inspectedWord.variations.length > 0 && (
                  <div className="rounded-xl border border-[#D5E4EE] bg-[#F4F9FC] p-3.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#234E68]">
                      {isPtBr
                        ? 'Variações e Expressões Comuns'
                        : 'Common Variations & Expressions'}
                    </div>
                    <ul className="mt-2 space-y-1.5">
                      {inspectedWord.variations.map((v, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs font-medium text-[#181D1B]"
                        >
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#234E68]" />
                          <span>{v}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* 3. Live Dictionary Meanings & Alternatives (from Google Dictionary endpoint) */}
              {isInspectingDict && (
                <div className="flex items-center gap-2 text-xs text-[#5C6661]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#234E68]" />
                  <span>
                    {isPtBr
                      ? 'Buscando outros significados no dicionário...'
                      : 'Loading additional dictionary meanings...'}
                  </span>
                </div>
              )}

              {inspectedDictData &&
                Array.isArray(inspectedDictData.dictionaryEntries) &&
                inspectedDictData.dictionaryEntries.length > 0 && (
                  <div className="rounded-xl border border-[#E2E8E5] bg-[#F9FBF9] p-3.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#2F4F42]">
                      {isPtBr
                        ? 'Outros Significados e Categorias'
                        : 'Other Meanings & Parts of Speech'}
                    </div>
                    <div className="mt-2 space-y-1.5">
                      {inspectedDictData.dictionaryEntries.map((entry, idx) => (
                        <div key={idx} className="text-xs">
                          <span className="font-semibold italic text-[#234E68]">
                            {entry.partOfSpeech}:{' '}
                          </span>
                          <span className="text-[#181D1B]">
                            {entry.terms.join(', ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* 4. Practical Everyday Examples */}
              {Array.isArray(inspectedWord.examples) &&
                inspectedWord.examples.length > 0 && (
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[#234E68]">
                      {isPtBr
                        ? 'Exemplos Práticos no Dia a Dia'
                        : 'Practical Everyday Examples'}
                    </div>
                    <div className="mt-2 space-y-2">
                      {inspectedWord.examples.map((ex, i) => (
                        <div
                          key={i}
                          className="flex items-start justify-between gap-2 rounded-xl border border-[#E6ECE9] bg-[#F8FAF9] p-3"
                        >
                          <div>
                            <p className="font-serif text-sm font-bold text-[#181D1B]">
                              {ex.target}
                            </p>
                            <p className="mt-0.5 text-xs text-[#5C6661]">
                              {ex.translation}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => speakSingleWord(ex.target, profile.bcp47)}
                            className="shrink-0 rounded-lg border border-[#DCE2DF] bg-white p-1.5 text-[#234E68] hover:bg-[#E4EFF6] cursor-pointer"
                            title={isPtBr ? 'Ouvir frase' : 'Listen to example'}
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* 5. How it appears in this chapter */}
              {Array.isArray(inspectedWord.chapterMatches) &&
                inspectedWord.chapterMatches.length > 0 && (
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[#5C6661]">
                      {isPtBr
                        ? 'Como Aparece Neste Capítulo'
                        : 'How It Appears in This Chapter'}
                    </div>
                    <div className="mt-2 space-y-2">
                      {inspectedWord.chapterMatches.map((m, i) => (
                        <div
                          key={i}
                          className="flex items-start justify-between gap-2 rounded-xl border border-[#E8ECEA] bg-[#FFFFFF] p-3"
                        >
                          <div>
                            <p className="font-serif text-sm font-medium text-[#181D1B]">
                              {m.target}
                            </p>
                            <p className="mt-0.5 text-xs text-[#5C6661]">
                              {m.translation}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => speakSingleWord(m.target, profile.bcp47)}
                            className="shrink-0 rounded-lg border border-[#DCE2DF] bg-[#F7F9F8] p-1.5 text-[#234E68] hover:bg-[#E4EFF6] cursor-pointer"
                            title={isPtBr ? 'Ouvir frase da história' : 'Listen to story sentence'}
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
