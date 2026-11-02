import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Volume2,
  CheckCircle2,
  BookMarked,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ArrowRight,
  Flame,
  Loader2,
  Globe,
  X,
  EyeOff,
  RefreshCw,
  BookOpen,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { speakSingleWord, controlSentenceAudio, stopSentenceAudio } from '../services/audioService';
import { normalizeLexeme } from '../services/storageService';
import { translateToEnglish } from '../services/translateService';
import { ACQUISITION_EXPOSURE_THRESHOLD } from '../types/schema';
import ChapterRecapSection from './ChapterRecapSection';

export default function InteractiveReader({
  profile,
  chapter,
  chapters = [],
  chapterIndex,
  totalChapters,
  onSelectChapterIndex,
  onDeleteChapter,
  onSelectDifficultyLevel,
  readerOnlyMode,
  onToggleReaderOnlyMode,
  strictMode,
  phoneticAid,
  showEnglishTranslation,
  onWordClickAddVocab,
  onGenerateNextChapter,
  onRegenerateCurrentChapter,
  isGeneratingChapter,
  generationError,
  activeSpokenSentenceIdx,
  activeSpokenTokenIdx,
  onTranslateSentence,
}) {
  const [selectedTokenInfo, setSelectedTokenInfo] = useState(null);
  const [openGrammarNotes, setOpenGrammarNotes] = useState({});
  const [fetchedTranslations, setFetchedTranslations] = useState({});
  const [sentenceAudioState, setSentenceAudioState] = useState({
    sentenceKey: null,
    status: 'idle', // 'idle' | 'loading' | 'playing' | 'paused'
    tokenIndex: null,
  });
  const popupCardRef = useRef(null);
  const storyScrollContainerRef = useRef(null);
  const sentenceCardRefs = useRef({});
  const lastScrolledSentenceRef = useRef(null);

  useEffect(() => {
    setSelectedTokenInfo(null);
    stopSentenceAudio();
    setSentenceAudioState({ sentenceKey: null, status: 'idle', tokenIndex: null });
    lastScrolledSentenceRef.current = null;
    if (storyScrollContainerRef.current) {
      storyScrollContainerRef.current.scrollTop = 0;
    }
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  }, [strictMode, chapter?.id, profile?.id]);

  // Smoothly auto-scroll ONLY the left-hand story container (never the whole page or right-hand panels!)
  useEffect(() => {
    let targetSentenceIdx = null;
    if (activeSpokenSentenceIdx !== null && activeSpokenSentenceIdx !== undefined) {
      targetSentenceIdx = activeSpokenSentenceIdx;
    } else if (
      sentenceAudioState.status === 'playing' &&
      sentenceAudioState.sentenceKey &&
      chapter?.id &&
      sentenceAudioState.sentenceKey.startsWith(`${chapter.id}-`)
    ) {
      const parsedIdx = Number(
        sentenceAudioState.sentenceKey.slice(`${chapter.id}-`.length)
      );
      if (Number.isFinite(parsedIdx)) {
        targetSentenceIdx = parsedIdx;
      }
    }

    if (targetSentenceIdx === null) {
      lastScrolledSentenceRef.current = null;
      return;
    }

    const scrollKey = `${chapter?.id}-${targetSentenceIdx}`;
    if (lastScrolledSentenceRef.current === scrollKey) return;
    lastScrolledSentenceRef.current = scrollKey;

    const containerEl = storyScrollContainerRef.current;
    const cardEl = sentenceCardRefs.current[targetSentenceIdx];

    if (containerEl && cardEl) {
      const containerRect = containerEl.getBoundingClientRect();
      const cardRect = cardEl.getBoundingClientRect();
      const relativeTop = cardRect.top - containerRect.top + containerEl.scrollTop;
      const targetScrollTop = Math.max(
        0,
        relativeTop - containerEl.clientHeight / 2 + cardRect.height / 2
      );
      containerEl.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth',
      });
    }
  }, [
    activeSpokenSentenceIdx,
    sentenceAudioState.status,
    sentenceAudioState.sentenceKey,
    chapter?.id,
  ]);

  // Close word popup when tapping anywhere outside the popup or pressing Escape
  useEffect(() => {
    if (!selectedTokenInfo) return;
    const handlePointerDownOutside = (e) => {
      if (popupCardRef.current && popupCardRef.current.contains(e.target)) {
        return;
      }
      if (e.target?.closest?.('[data-word-token="true"]')) {
        return;
      }
      setSelectedTokenInfo(null);
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedTokenInfo(null);
    };
    document.addEventListener('mousedown', handlePointerDownOutside);
    document.addEventListener('touchstart', handlePointerDownOutside, { passive: true });
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDownOutside);
      document.removeEventListener('touchstart', handlePointerDownOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedTokenInfo]);

  useEffect(() => {
    setOpenGrammarNotes({});
  }, [chapter?.id]);

  useEffect(() => {
    if (!showEnglishTranslation || strictMode || !chapter?.sentences) return;

    chapter.sentences.forEach((sentence, idx) => {
      const cacheKey = `${chapter.id}-${idx}`;
      if (!sentence.englishTranslation && !fetchedTranslations[cacheKey]) {
        const targetLang = profile.id === 'en' ? 'pt' : 'en';
        translateToEnglish(sentence.fullSentence, profile.translateCode, targetLang)
          .then((res) => {
            if (res?.translatedText) {
              setFetchedTranslations((prev) => ({
                ...prev,
                [cacheKey]: res.translatedText,
              }));
            }
          })
          .catch(() => {});
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEnglishTranslation, strictMode, chapter?.id, profile?.translateCode, profile?.id]);

  if (!chapter) return null;

  const activeDifficulty = chapter.activeDifficulty || 'maintain';
  const isCJK = profile.id === 'ja';
  const isJapanese = profile.id === 'ja';
  const isPtBr = profile.id === 'en';
  const showPhonetics = isCJK && phoneticAid && !strictMode;
  const showEnglishUnderSentence = showEnglishTranslation && !strictMode;

  const vocabLookup = new Map();
  (profile.vocabBank || []).forEach((entry) => {
    const baseKey = normalizeLexeme(entry.baseForm);
    const wordKey = normalizeLexeme(entry.word);
    if (baseKey) vocabLookup.set(baseKey, entry);
    if (wordKey && !vocabLookup.has(wordKey)) vocabLookup.set(wordKey, entry);
  });

  const getTokenVocabStatus = (token) => {
    const byBase = vocabLookup.get(normalizeLexeme(token.baseForm));
    if (byBase) return byBase;
    return vocabLookup.get(normalizeLexeme(token.surface)) || null;
  };

  const handleTokenClick = (sentenceIndex, tokenIndex, token) => {
    if (strictMode) return;
    if (
      selectedTokenInfo &&
      selectedTokenInfo.sentenceIndex === sentenceIndex &&
      selectedTokenInfo.tokenIndex === tokenIndex
    ) {
      setSelectedTokenInfo(null);
      return;
    }
    setSelectedTokenInfo({ sentenceIndex, tokenIndex, token });
    speakSingleWord(token.surface, profile.bcp47);
    onWordClickAddVocab(token);
  };

  const toggleGrammarNote = (sIdx) => {
    setOpenGrammarNotes((prev) => ({
      ...prev,
      [sIdx]: !prev[sIdx],
    }));
  };

  const selectedVocabEntry = selectedTokenInfo
    ? getTokenVocabStatus(selectedTokenInfo.token)
    : null;

  const difficultyOptions = [
    {
      id: 'simplify',
      shortLabel: isPtBr ? 'Muito Difícil (Mais Simples)' : 'Too Hard (Simpler)',
      title: isPtBr ? 'Muito Difícil — Deixar Mais Simples' : 'Too Hard — Make Simpler',
      desc: isPtBr
        ? 'Versão mais curta e fácil deste capítulo com frases mais simples'
        : 'Shorter, easier version of this chapter with simpler sentences',
      icon: SlidersHorizontal,
    },
    {
      id: 'maintain',
      shortLabel: isPtBr ? 'Ideal (Padrão)' : 'Just Right (Standard)',
      title: isPtBr ? 'Ideal — Padrão' : 'Just Right — Standard',
      desc: isPtBr
        ? 'Versão original padrão deste capítulo'
        : 'Original baseline version of this chapter',
      icon: CheckCircle2,
    },
    {
      id: 'challenge',
      shortLabel: isPtBr ? 'Muito Fácil (Mais Complexo)' : 'Too Easy (More Complex)',
      title: isPtBr ? 'Muito Fácil — Mais Complexo' : 'Too Easy — Challenge Me',
      desc: isPtBr
        ? 'Versão mais longa e rica deste capítulo'
        : 'Longer, richer version of this chapter with deeper grammar',
      icon: Flame,
    },
  ];

  return (
    <article
      className={`relative rounded-2xl border border-[#E2E7E4] bg-[#FFFFFF] shadow-2xs ${
        readerOnlyMode ? 'p-5 sm:p-11' : 'p-4 sm:p-9'
      }`}
    >
      {/* Streamlined Editorial Story Header */}
      <div className="mb-6 border-b border-[#E8ECEA] pb-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#234E68]">
              <span>{profile.storyTitle}</span>
              <span className="text-[#87928D]">•</span>
              <span className="rounded-md border border-[#C9DCE8] bg-[#F1F6FA] px-2 py-0.5 text-[#1E3F54]">
                {chapter.difficultyLabel || profile.cefrLevel}
              </span>
              {readerOnlyMode && (
                <span className="rounded-md border border-[#CDE0D6] bg-[#EFF6F2] px-2 py-0.5 text-[#285943]">
                  {isPtBr ? 'Modo Leitura' : 'Reader View'}
                </span>
              )}
            </div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-[#181D1B] sm:text-3xl">
              {chapter.chapterTitle}
            </h2>
          </div>

          {/* Unified Chapter Pill Switcher */}
          <div className="flex flex-wrap items-center gap-1.5">
            {chapters.map((ch, idx) => {
              const isActive = idx === chapterIndex;
              return (
                <div
                  key={ch.id || idx}
                  className={`inline-flex items-center rounded-xl border text-xs font-semibold transition ${
                    isActive
                      ? 'border-[#234E68] bg-[#234E68] text-white shadow-sm'
                      : 'border-[#DCE2DF] bg-[#F7F9F8] text-[#5C6661] hover:bg-[#EEF2F0] hover:text-[#181D1B]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectChapterIndex(idx)}
                    className="px-3 py-1.5 cursor-pointer focus:outline-none"
                  >
                    {isPtBr ? `Capítulo ${idx + 1}` : `Chapter ${idx + 1}`}
                  </button>
                  {!readerOnlyMode && totalChapters > 1 && onDeleteChapter && idx >= 3 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChapter(idx);
                      }}
                      title={
                        isPtBr
                          ? `Excluir Capítulo ${idx + 1}`
                          : `Delete Chapter ${idx + 1}`
                      }
                      aria-label={
                        isPtBr
                          ? `Excluir Capítulo ${idx + 1}`
                          : `Delete Chapter ${idx + 1}`
                      }
                      className={`mr-1 flex h-4 w-4 items-center justify-center rounded-full transition ${
                        isActive
                          ? 'text-[#C6D8E4] hover:bg-white/20 hover:text-white'
                          : 'text-[#87928D] hover:bg-[#DCE2DF] hover:text-[#181D1B]'
                      }`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}

            {!readerOnlyMode && (
              <button
                type="button"
                disabled={isGeneratingChapter}
                onClick={() => onGenerateNextChapter('maintain')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-[#8AAEC4] bg-[#F1F6FA] px-3 py-1.5 text-xs font-semibold text-[#234E68] transition hover:bg-[#E4EFF6] disabled:opacity-70 cursor-pointer"
                title={isPtBr ? 'Gerar próximo capítulo' : 'Generate next chapter'}
              >
                {isGeneratingChapter ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#EA580C]" />
                    <span className="text-[#EA580C]">
                      {isPtBr
                        ? `Gerando Capítulo ${totalChapters + 1}...`
                        : `Generating Chapter ${totalChapters + 1}...`}
                    </span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    <span>
                      {isPtBr ? `Capítulo ${totalChapters + 1}` : `Chapter ${totalChapters + 1}`}
                    </span>
                  </>
                )}
              </button>
            )}

            {readerOnlyMode && onToggleReaderOnlyMode && (
              <button
                type="button"
                onClick={onToggleReaderOnlyMode}
                className="inline-flex items-center gap-1 rounded-xl border border-[#DCE2DF] bg-[#F7F9F8] px-2.5 py-1.5 text-xs font-semibold text-[#4A5550] transition hover:bg-[#EEF2F0] hover:text-[#181D1B]"
                title={isPtBr ? 'Sair do Modo Leitura' : 'Exit Reader View'}
              >
                <span>{isPtBr ? 'Sair do Modo Leitura' : 'Exit Reader'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Single Compact Sub-Toolbar: Difficulty Level + Reading Legend (Hidden in Reader View) */}
        {!readerOnlyMode && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E6ECE9] bg-[#F8FAF9] px-3.5 py-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5C6661] mr-1">
                {isPtBr ? 'Nível:' : 'Level:'}
              </span>
              {difficultyOptions.map((opt) => {
                const isSelected = activeDifficulty === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isGeneratingChapter}
                    onClick={() => onSelectDifficultyLevel?.(opt.id)}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition cursor-pointer disabled:opacity-50 ${
                      isSelected
                        ? 'border-[#2D5A46] bg-[#2D5A46] text-white shadow-sm'
                        : 'border-[#DCE2DF] bg-[#FFFFFF] text-[#4A5550] hover:border-[#2D5A46] hover:text-[#181D1B]'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="h-3 w-3 text-[#BCE0CE]" />}
                    <span>
                      {opt.id === 'simplify'
                        ? isPtBr
                          ? 'Mais Simples'
                          : 'Simpler'
                        : opt.id === 'maintain'
                        ? isPtBr
                          ? 'Padrão'
                          : 'Standard'
                        : isPtBr
                        ? 'Mais Complexo'
                        : 'More Complex'}
                    </span>
                  </button>
                );
              })}
            </div>

            {strictMode ? (
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#7A3E33]">
                <EyeOff className="h-3.5 w-3.5 shrink-0 text-[#8C4A3E]" />
                <span>
                  {isPtBr
                    ? 'Modo Sem Dicas ATIVO (Leitura direta)'
                    : 'Strict Mode ON (Uninterrupted reading)'}
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#5C6661]">
                <span>
                  {isPtBr
                    ? 'Toque em qualquer palavra para ver a tradução e ouvir a pronúncia'
                    : 'Tap any word for instant meaning & audio'}
                </span>
                <span className="hidden sm:inline text-[#C5CECA]">•</span>
                <span className="inline-flex items-center gap-1 font-medium text-[#7C581E]">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#C9963E]" />
                  {isPtBr ? 'Aprendendo' : 'Learning'}
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-[#285943]">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#3B7A57]" />
                  {isPtBr ? 'Aprendida' : 'Acquired'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Zero-Latency Word Meaning & Pronunciation Box (Always visible in viewport without scrolling!) */}
      {!strictMode && selectedTokenInfo && (
        <div
          ref={popupCardRef}
          className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-lg -translate-x-1/2 rounded-2xl border-2 border-[#234E68]/35 bg-[#FFFFFF]/98 p-4 shadow-2xl backdrop-blur-md transition-all"
        >
          {/* Prominent, Always-Reachable Top-Right Close Button */}
          <button
            type="button"
            onClick={() => setSelectedTokenInfo(null)}
            aria-label="Close word definition popup"
            className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg border border-[#DCE2DF] bg-[#F7F9F8] px-2.5 py-1.5 text-xs font-semibold text-[#181D1B] shadow-2xs transition hover:bg-[#E4EFF6] active:scale-95"
          >
            <X className="h-3.5 w-3.5" />
            <span>{isPtBr ? 'Fechar' : 'Close'}</span>
          </button>

          <div className="pr-20 space-y-1.5">
            <div className="flex flex-wrap items-baseline gap-2.5">
              <span className="font-serif text-2xl font-bold text-[#181D1B]">
                {selectedTokenInfo.token.surface}
              </span>
              {selectedTokenInfo.token.reading && (
                <span className="rounded border border-[#D5D9E8] bg-[#F2F3F8] px-2 py-0.5 text-xs font-semibold text-[#3E4563]">
                  {selectedTokenInfo.token.reading}
                </span>
              )}
              <span className="text-xs text-[#5C6661]">
                {isPtBr ? 'Forma base:' : 'Base:'}{' '}
                <strong className="font-semibold text-[#181D1B]">
                  {selectedTokenInfo.token.baseForm}
                </strong>
              </span>
            </div>

            <p className="text-base font-semibold text-[#1E3F54]">
              “{selectedTokenInfo.token.contextualMeaning}”
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  speakSingleWord(selectedTokenInfo.token.surface, profile.bcp47)
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#234E68] bg-[#234E68] px-3 py-1 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#1B3E54] active:scale-95"
                title={isPtBr ? 'Ouvir a pronúncia novamente' : 'Pronounce word again'}
              >
                <Volume2 className="h-3.5 w-3.5" />
                <span>{isPtBr ? 'Ouvir Pronúncia' : `Listen (${profile.bcp47})`}</span>
              </button>

              {selectedVocabEntry && (
                <div
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                    selectedVocabEntry.status === 'acquired'
                      ? 'border-[#C2DFD0] bg-[#EFF6F2] text-[#285943]'
                      : 'border-[#E8D7B4] bg-[#FDF8EE] text-[#7C581E]'
                  }`}
                >
                  {selectedVocabEntry.status === 'acquired' ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#3B7A57]" />
                      <span>
                        {isPtBr
                          ? `Aprendida (${selectedVocabEntry.exposures}/5)`
                          : `Acquired (${selectedVocabEntry.exposures}/5)`}
                      </span>
                    </>
                  ) : (
                    <>
                      <BookMarked className="h-3.5 w-3.5 text-[#B88328]" />
                      <span>
                        {isPtBr
                          ? `Salva no Banco (${selectedVocabEntry.exposures}/${ACQUISITION_EXPOSURE_THRESHOLD})`
                          : `Saved (${selectedVocabEntry.exposures}/${ACQUISITION_EXPOSURE_THRESHOLD})`}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Pre-Tokenised Story Body (Independent Auto-Scroll Container with Visible Right-Edge Scrollbar) */}
      <div
        ref={storyScrollContainerRef}
        className="story-scroll-box max-h-[58vh] overflow-y-scroll pr-3 space-y-5 rounded-xl border border-[#E6ECE9] bg-[#F9FBF9]/60 p-3"
      >
        {(chapter.sentences || []).map((sentence, sIdx) => {
          const isGrammarOpen = Boolean(openGrammarNotes[sIdx]);
          const sentenceKey = `${chapter.id}-${sIdx}`;
          const isThisSentenceActive = sentenceAudioState.sentenceKey === sentenceKey;
          const isThisSentencePlaying =
            isThisSentenceActive && sentenceAudioState.status === 'playing';
          const isThisSentencePaused =
            isThisSentenceActive && sentenceAudioState.status === 'paused';
          const isThisSentenceLoading =
            isThisSentenceActive && sentenceAudioState.status === 'loading';
          const isSentenceSpeaking =
            activeSpokenSentenceIdx === sIdx || isThisSentencePlaying || isThisSentencePaused;
          const englishLine =
            sentence.englishTranslation ||
            fetchedTranslations[sentenceKey] ||
            '';

          return (
            <div
              key={sIdx}
              ref={(el) => {
                sentenceCardRefs.current[sIdx] = el;
              }}
              className={`group relative rounded-xl border px-3.5 py-3 transition-all duration-200 ${
                isSentenceSpeaking
                  ? 'border-[#234E68] bg-[#EEF6FB] ring-2 ring-[#234E68]/25 shadow-sm'
                  : 'border-[#E6ECE9] bg-[#FCFDFC] hover:border-[#C9D8D1] hover:bg-[#F8FAF9]'
              }`}
            >
              {/* Top-Right Sentence ElevenLabs Play/Pause + Restart Mini Controls */}
              <div className="float-right ml-3 mb-1 inline-flex items-center gap-1 rounded-lg border border-[#D5E1E8] bg-white/95 px-1.5 py-1 shadow-sm">
                <button
                  type="button"
                  onClick={() =>
                    controlSentenceAudio({
                      sentenceKey,
                      sentenceText: sentence.fullSentence,
                      tokens: sentence.tokens || [],
                      bcp47: profile.bcp47,
                      forceRestart: false,
                      onStateChange: setSentenceAudioState,
                    })
                  }
                  title={
                    isThisSentencePlaying
                      ? isPtBr
                        ? `Pausar frase ${sIdx + 1}`
                        : `Pause sentence ${sIdx + 1} (ElevenLabs)`
                      : isThisSentencePaused
                      ? isPtBr
                        ? `Continuar frase ${sIdx + 1}`
                        : `Resume sentence ${sIdx + 1} (ElevenLabs)`
                      : isPtBr
                      ? `Ouvir frase ${sIdx + 1}`
                      : `Play sentence ${sIdx + 1} (ElevenLabs)`
                  }
                  aria-label={
                    isThisSentencePlaying
                      ? `Pause sentence ${sIdx + 1}`
                      : `Play sentence ${sIdx + 1}`
                  }
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-md transition cursor-pointer ${
                    isThisSentencePlaying
                      ? 'bg-[#EA580C] text-white shadow-sm'
                      : isThisSentencePaused
                      ? 'bg-[#234E68] text-white'
                      : 'text-[#234E68] hover:bg-[#E4EFF6]'
                  }`}
                >
                  {isThisSentenceLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#EA580C]" />
                  ) : isThisSentencePlaying ? (
                    <Pause className="h-3.5 w-3.5" />
                  ) : (
                    <Play className="h-3.5 w-3.5 translate-x-[0.5px]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    controlSentenceAudio({
                      sentenceKey,
                      sentenceText: sentence.fullSentence,
                      tokens: sentence.tokens || [],
                      bcp47: profile.bcp47,
                      forceRestart: true,
                      onStateChange: setSentenceAudioState,
                    })
                  }
                  title={
                    isPtBr
                      ? `Repetir frase ${sIdx + 1} desde o início`
                      : `Restart sentence ${sIdx + 1} from beginning (ElevenLabs)`
                  }
                  aria-label={`Restart sentence ${sIdx + 1}`}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#5C6661] transition hover:bg-[#E4EFF6] hover:text-[#181D1B] cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Sentence Tokens Flow */}
              <div className="font-serif text-xl leading-[2.25] tracking-normal text-[#181D1B] sm:text-[23px] sm:leading-[2.35]">
                {(sentence.tokens || []).map((token, tIdx) => {
                  const vocabEntry = !strictMode ? getTokenVocabStatus(token) : null;
                  const isSelected =
                    !strictMode &&
                    selectedTokenInfo?.sentenceIndex === sIdx &&
                    selectedTokenInfo?.tokenIndex === tIdx;

                  const isSpokenWordNow =
                    (activeSpokenSentenceIdx === sIdx && activeSpokenTokenIdx === tIdx) ||
                    ((isThisSentencePlaying || isThisSentencePaused) &&
                      sentenceAudioState.tokenIndex === tIdx);

                  const shouldRenderRuby =
                    isJapanese && showPhonetics && Boolean(token.reading);

                  let statusClasses = '';
                  if (isSpokenWordNow) {
                    statusClasses =
                      'bg-[#FDE68A] text-[#7C2D12] font-semibold rounded-md px-1 ring-2 ring-[#EA580C] shadow-xs transition-all duration-100';
                  } else if (!strictMode) {
                    if (isSelected) {
                      statusClasses =
                        'bg-[#DCEBF4] text-[#181D1B] rounded px-1 ring-1 ring-[#234E68]';
                    } else if (vocabEntry?.status === 'learning') {
                      statusClasses =
                        'decoration-[#C9963E] decoration-dotted underline decoration-2 underline-offset-4 bg-[#FDF8EE] rounded px-0.5 hover:bg-[#F9EED8]';
                    } else if (vocabEntry?.status === 'acquired') {
                      statusClasses =
                        'decoration-[#52826A] decoration-solid underline decoration-1 underline-offset-4 hover:bg-[#EFF6F2] rounded px-0.5';
                    } else {
                      statusClasses =
                        'hover:bg-[#EEF2F0] rounded px-0.5 transition-colors';
                    }
                  }

                  return (
                    <React.Fragment key={tIdx}>
                      <span
                        data-word-token="true"
                        role={strictMode ? undefined : 'button'}
                        tabIndex={strictMode ? -1 : 0}
                        onClick={() => handleTokenClick(sIdx, tIdx, token)}
                        onKeyDown={(e) => {
                          if (!strictMode && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault();
                            handleTokenClick(sIdx, tIdx, token);
                          }
                        }}
                        className={`inline-block select-text ${
                          strictMode ? 'cursor-default' : 'cursor-pointer'
                        } ${statusClasses}`}
                      >
                        {shouldRenderRuby ? (
                          <ruby>
                            {token.surface}
                            <rt>{token.reading}</rt>
                          </ruby>
                        ) : (
                          token.surface
                        )}
                      </span>
                      {!profile.noWordSpaces && tIdx < sentence.tokens.length - 1 ? ' ' : ''}
                    </React.Fragment>
                  );
                })}

                {/* End-of-Sentence Subtle Grammar Pattern Icon & Translate Icon (Hidden in Reader View) */}
                {!readerOnlyMode && (
                  <span className="ml-2 inline-flex items-center gap-1 align-middle font-sans">
                    <button
                      type="button"
                      onClick={() => toggleGrammarNote(sIdx)}
                      title={
                        isPtBr
                          ? 'Explicação da Frase: Clique para ver uma explicação simples de como esta frase funciona'
                          : "Pattern Recognition Note: Click for a plain-English explanation of this sentence's grammar pattern"
                      }
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium transition ${
                        isGrammarOpen
                          ? 'border-[#464E70] bg-[#464E70] text-white'
                          : 'border-[#D6D9E8] bg-[#F5F6FA] text-[#464E70] opacity-85 hover:bg-[#E8EAF4] group-hover:opacity-100'
                      }`}
                    >
                      <Sparkles className="h-3 w-3" />
                      <span className="hidden sm:inline">
                        {isPtBr ? 'Explicação' : 'Pattern'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onTranslateSentence(sentence.fullSentence)}
                      title={
                        isPtBr
                          ? 'Abrir esta frase no painel do Tradutor no topo da página'
                          : 'Open this sentence in the top Translator panel'
                      }
                      className="inline-flex items-center gap-1 rounded-full border border-[#C9DCE8] bg-[#F2F7FA] px-2 py-0.5 text-[11px] font-medium text-[#234E68] opacity-80 transition hover:bg-[#E4EFF6] group-hover:opacity-100"
                    >
                      <Globe className="h-3 w-3" />
                      <span className="hidden md:inline">
                        {isPtBr ? 'Traduzir' : 'Translate'}
                      </span>
                    </button>
                  </span>
                )}
              </div>

              {/* Subtle Romanisation Line (Heather-Slate) */}
              {showPhonetics && sentence.romanisation && (
                <p className="mt-1 font-sans text-xs italic tracking-wide text-[#525A78]">
                  {sentence.romanisation}
                </p>
              )}

              {/* Optional English Translation Line (Quiet Nordic Sage-Mist) */}
              {showEnglishUnderSentence && (
                <p className="mt-1.5 rounded-lg border-l-2 border-[#4C7C64] bg-[#F2F7F4] px-3 py-1 font-sans text-sm font-medium text-[#244233]">
                  {englishLine ||
                    (isPtBr
                      ? 'Traduzindo frase para o Português...'
                      : 'Translating sentence to English...')}
                </p>
              )}

              {/* Plain-English 1-Sentence Grammar Pattern Callout (Quiet Nordic Heather-Indigo) */}
              {!readerOnlyMode && isGrammarOpen && sentence.grammarNote && (
                <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-[#D6D9E8] bg-[#F5F6FA] px-3.5 py-2 font-sans text-xs leading-relaxed text-[#333954]">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#464E70]" />
                  <div>
                    <span className="font-semibold">
                      {isPtBr ? 'Explicação da Frase: ' : 'Sentence Pattern: '}
                    </span>
                    <span>{sentence.grammarNote}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recycled Target Vocabulary Pill Summary (Hidden in Reader View) */}
      {!readerOnlyMode &&
        Array.isArray(chapter.recycledWordsUsed) &&
        chapter.recycledWordsUsed.length > 0 && (
          <div className="mt-8 border-t border-[#E8ECEA] pt-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#5C6661]">
              <span className="font-semibold text-[#181D1B]">
                {isPtBr
                  ? 'Palavras-Alvo Praticadas Neste Capítulo:'
                  : 'Target Words Woven Into This Chapter:'}
              </span>
              {chapter.recycledWordsUsed.map((word, idx) => (
                <span
                  key={idx}
                  className="rounded-md border border-[#E8D7B4] bg-[#FDF8EE] px-2 py-0.5 font-medium text-[#7C581E]"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

      {/* Compact Story Adaptation Bar right below the story text (Hidden in Reader View) */}
      {!readerOnlyMode && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2E7E4] bg-[#F8FAF9] px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#4A5550]">
              {isPtBr ? 'Nível da História:' : 'Story Level:'}
            </span>
            {difficultyOptions.map((opt) => {
              const isSelected = activeDifficulty === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isGeneratingChapter}
                  onClick={() => onSelectDifficultyLevel?.(opt.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition cursor-pointer disabled:opacity-50 ${
                    isSelected
                      ? 'border-[#2D5A46] bg-[#2D5A46] text-white shadow-sm'
                      : 'border-[#DCE2DF] bg-[#FFFFFF] text-[#4A5550] hover:border-[#2D5A46] hover:text-[#181D1B]'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="h-3 w-3 text-[#BCE0CE]" />}
                  <span>{opt.shortLabel}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={isGeneratingChapter}
            onClick={onRegenerateCurrentChapter}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#94B8CE] bg-[#F1F6FA] px-3 py-1.5 text-xs font-semibold text-[#1E3F54] transition hover:bg-[#E3EEF5] cursor-pointer disabled:opacity-50"
            title={
              isPtBr
                ? 'Gerar uma nova variação desta história para praticar mais'
                : 'Generate a fresh story with new vocabulary for this chapter'
            }
          >
            {isGeneratingChapter ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#234E68]" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5 text-[#234E68]" />
            )}
            <span>{isPtBr ? 'Nova Variação da História' : 'New Story Variant'}</span>
          </button>

          {generationError && (
            <div className="w-full rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-900">
              {generationError}
            </div>
          )}
        </div>
      )}

      {/* End-of-Chapter Learning Consolidation & Active-Recall Recap (Hidden in Reader View) */}
      {!readerOnlyMode && (
        <ChapterRecapSection
          profile={profile}
          chapter={chapter}
          chapterIndex={chapterIndex}
          totalChapters={totalChapters}
          onSelectChapterIndex={onSelectChapterIndex}
          onGenerateNextChapter={onGenerateNextChapter}
          isGeneratingChapter={isGeneratingChapter}
        />
      )}
    </article>
  );
}
