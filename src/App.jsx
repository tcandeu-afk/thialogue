import React, { useState, useEffect, useRef } from 'react';
import TopReaderBar from './components/TopReaderBar';
import AudioPlayerBar from './components/AudioPlayerBar';
import InteractiveReader from './components/InteractiveReader';
import VocabSidebar from './components/VocabSidebar';
import TranslatorPanel from './components/TranslatorPanel';
import SettingsModal from './components/SettingsModal';
import {
  loadProfiles,
  saveProfiles,
  loadActiveLang,
  saveActiveLang,
  loadSettings,
  saveSettings,
  loadReaderPrefs,
  saveReaderPrefs,
  normalizeLexeme,
  isProperNounOrNonLexicalToken,
  updateVocabExposuresAfterChapter,
} from './services/storageService';
import {
  generateNextChapter,
  generateChapterDifficultyVariant,
} from './services/geminiService';
import { INITIAL_PROFILES } from './data/initialProfiles';
import { ACQUISITION_EXPOSURE_THRESHOLD } from './types/schema';

export default function App() {
  const [profiles, setProfiles] = useState(() => loadProfiles());
  const [activeLang, setActiveLang] = useState(() => loadActiveLang());
  const [settings, setSettings] = useState(() => loadSettings());
  const [readerPrefs, setReaderPrefs] = useState(() => loadReaderPrefs());

  const [showTranslator, setShowTranslator] = useState(false);
  const [translatorSeedText, setTranslatorSeedText] = useState('');
  const [showVocabDrawer, setShowVocabDrawer] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [isGeneratingChapter, setIsGeneratingChapter] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [activeSpokenSentenceIdx, setActiveSpokenSentenceIdx] = useState(null);

  // Ephemeral in-memory Blob URL cache for ElevenLabs chapter audio (NEVER stored in localStorage)
  const [audioBlobUrls, setAudioBlobUrls] = useState({});
  const audioBlobUrlsRef = useRef({});

  // Sync profiles to localStorage
  useEffect(() => {
    saveProfiles(profiles);
  }, [profiles]);

  // Sync active language to localStorage
  useEffect(() => {
    saveActiveLang(activeLang);
    setGenerationError(null);
  }, [activeLang]);

  // Sync reader preferences to localStorage
  useEffect(() => {
    saveReaderPrefs(readerPrefs);
  }, [readerPrefs]);

  // Auto-import API keys when opened on mobile via QR code (?sync=...) OR via /api/settings LAN sync
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const syncToken = params.get('sync');
      if (syncToken) {
        const decoded = JSON.parse(atob(syncToken));
        if (decoded && typeof decoded === 'object') {
          setSettings((prev) => {
            const merged = { ...prev, ...decoded };
            saveSettings(merged);
            return merged;
          });
        }
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch {
      // ignore invalid sync param
    }

    // Sync with local server /api/settings so Mac and Phone automatically share API keys
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
      const current = loadSettings();
      if (current.elevenLabsApiKey?.trim() || current.geminiApiKey?.trim()) {
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(current),
        }).catch(() => {});
      } else {
        fetch('/api/settings')
          .then((r) => (r.ok ? r.json() : null))
          .then((remote) => {
            if (
              remote &&
              (remote.elevenLabsApiKey?.trim() || remote.geminiApiKey?.trim())
            ) {
              setSettings((prev) => {
                const merged = {
                  ...prev,
                  elevenLabsApiKey: prev.elevenLabsApiKey || remote.elevenLabsApiKey || '',
                  elevenLabsVoiceId: prev.elevenLabsVoiceId || remote.elevenLabsVoiceId || '',
                  geminiApiKey: prev.geminiApiKey || remote.geminiApiKey || '',
                };
                saveSettings(merged);
                return merged;
              });
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  // Revoke any created Blob ObjectURLs on unmount
  useEffect(() => {
    return () => {
      Object.values(audioBlobUrlsRef.current).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, []);

  const activeProfile = profiles[activeLang] || profiles.fr;
  const chapters = activeProfile?.chapters || [];
  const currentChapterIndex = Math.min(
    Math.max(0, activeProfile?.activeChapterIndex || 0),
    Math.max(0, chapters.length - 1)
  );
  const currentChapter = chapters[currentChapterIndex] || chapters[0];

  const handleCacheChapterBlobUrl = (chapterId, blobUrl) => {
    setAudioBlobUrls((prev) => {
      if (prev[chapterId] && prev[chapterId] !== blobUrl) {
        URL.revokeObjectURL(prev[chapterId]);
      }
      const next = { ...prev, [chapterId]: blobUrl };
      audioBlobUrlsRef.current = next;
      return next;
    });
  };

  const scrollToReaderTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectChapterIndex = (nextIdx) => {
    setProfiles((prev) => ({
      ...prev,
      [activeLang]: {
        ...prev[activeLang],
        activeChapterIndex: nextIdx,
      },
    }));
  };

  /**
   * Closes/removes a chapter when clicking the "×" next to a chapter tab.
   */
  const handleDeleteChapter = (idxToRemove) => {
    setProfiles((prev) => {
      const latestProfile = prev[activeLang];
      const existingChapters = latestProfile.chapters || [];
      if (existingChapters.length <= 1) return prev;

      const filtered = existingChapters
        .filter((_, idx) => idx !== idxToRemove)
        .map((ch, idx) => ({
          ...ch,
          chapterNumber: idx + 1,
        }));

      let nextActiveIdx = latestProfile.activeChapterIndex || 0;
      if (idxToRemove < nextActiveIdx) {
        nextActiveIdx = Math.max(0, nextActiveIdx - 1);
      } else if (nextActiveIdx >= filtered.length) {
        nextActiveIdx = Math.max(0, filtered.length - 1);
      }

      return {
        ...prev,
        [activeLang]: {
          ...latestProfile,
          chapters: filtered,
          activeChapterIndex: nextActiveIdx,
        },
      };
    });
  };

  /**
   * Clicking any word token in Interactive Mode (or saving from the Dictionary Box)
   * adds it to activeProfile.vocabBank.
   */
  const handleWordClickAddVocab = (token) => {
    if (!token || !token.surface) return;
    if (isProperNounOrNonLexicalToken(token)) return;

    const cleanSurface = token.surface
      .replace(/[.,!?;:«»"“”'’()[\]{}،、。！？「」『』・]/g, '')
      .trim();
    const cleanBase = (token.baseForm || cleanSurface)
      .replace(/[.,!?;:«»"“”'’()[\]{}،、。！？「」『』・]/g, '')
      .trim();

    if (!cleanSurface && !cleanBase) return;

    const normTarget = normalizeLexeme(cleanBase || cleanSurface);

    setProfiles((prev) => {
      const currentProfile = prev[activeLang];
      const existingBank = currentProfile.vocabBank || [];

      const existingIdx = existingBank.findIndex(
        (entry) =>
          normalizeLexeme(entry.baseForm) === normTarget ||
          normalizeLexeme(entry.word) === normalizeLexeme(cleanSurface)
      );

      if (existingIdx !== -1) {
        return prev;
      }

      const newEntry = {
        word: cleanSurface || token.surface,
        reading: token.reading || null,
        baseForm: cleanBase || cleanSurface,
        contextualMeaning: token.contextualMeaning || '',
        exposures: 1,
        status: 'learning',
        addedAt: Date.now(),
      };

      return {
        ...prev,
        [activeLang]: {
          ...currentProfile,
          vocabBank: [newEntry, ...existingBank],
        },
      };
    });
  };

  const handleToggleWordStatus = (baseForm) => {
    setProfiles((prev) => {
      const currentProfile = prev[activeLang];
      const updatedBank = (currentProfile.vocabBank || []).map((entry) => {
        if (entry.baseForm !== baseForm) return entry;
        const nextStatus = entry.status === 'learning' ? 'acquired' : 'learning';
        return {
          ...entry,
          status: nextStatus,
          exposures:
            nextStatus === 'acquired'
              ? Math.max(entry.exposures, ACQUISITION_EXPOSURE_THRESHOLD)
              : Math.min(entry.exposures, ACQUISITION_EXPOSURE_THRESHOLD - 1),
        };
      });

      return {
        ...prev,
        [activeLang]: {
          ...currentProfile,
          vocabBank: updatedBank,
        },
      };
    });
  };

  const handleRemoveWord = (baseForm) => {
    setProfiles((prev) => {
      const currentProfile = prev[activeLang];
      return {
        ...prev,
        [activeLang]: {
          ...currentProfile,
          vocabBank: (currentProfile.vocabBank || []).filter(
            (entry) => entry.baseForm !== baseForm
          ),
        },
      };
    });
  };

  /**
   * Switches or generates a difficulty version ('simplify' | 'maintain' | 'challenge')
   * FOR THE CURRENT CHAPTER IN-PLACE so the user can flick back and forth between
   * Simpler, Just Right, and More Complex versions of the same chapter, and scrolls to top!
   */
  const handleSelectDifficultyLevel = async (level = 'maintain') => {
    if (!currentChapter) return;
    setGenerationError(null);

    const existingVariants = currentChapter.variants || {};
    const baseMaintainChapter = existingVariants.maintain || {
      ...structuredClone(currentChapter),
      variants: undefined,
      activeDifficulty: 'maintain',
    };

    // If this difficulty version is already cached on the chapter, switch to it immediately (0ms)
    if (existingVariants[level]) {
      const cachedVariant = existingVariants[level];
      setProfiles((prev) => {
        const latestProfile = prev[activeLang];
        const nextChapters = [...(latestProfile.chapters || [])];
        nextChapters[currentChapterIndex] = {
          ...cachedVariant,
          chapterNumber: currentChapterIndex + 1,
          activeDifficulty: level,
          variants: {
            ...existingVariants,
            maintain: baseMaintainChapter,
          },
        };
        return {
          ...prev,
          [activeLang]: {
            ...latestProfile,
            chapters: nextChapters,
          },
        };
      });
      scrollToReaderTop();
      return;
    }

    setIsGeneratingChapter(true);
    try {
      const generatedVariant = await generateChapterDifficultyVariant({
        profile: activeProfile,
        baseChapter: baseMaintainChapter,
        level,
        apiKey: settings.geminiApiKey,
      });

      const nextVariants = {
        ...existingVariants,
        maintain: baseMaintainChapter,
        [level]: {
          ...structuredClone(generatedVariant),
          variants: undefined,
        },
      };

      setProfiles((prev) => {
        const latestProfile = prev[activeLang];
        const nextChapters = [...(latestProfile.chapters || [])];
        nextChapters[currentChapterIndex] = {
          ...generatedVariant,
          chapterNumber: currentChapterIndex + 1,
          activeDifficulty: level,
          variants: nextVariants,
        };
        return {
          ...prev,
          [activeLang]: {
            ...latestProfile,
            chapters: nextChapters,
          },
        };
      });
      scrollToReaderTop();
    } catch (err) {
      setGenerationError(err.message || 'Failed to adapt chapter difficulty.');
    } finally {
      setIsGeneratingChapter(false);
    }
  };

  /**
   * Explicit "+ New Chapter" button in the top chapter bar to add a new sequential chapter.
   */
  const handleGenerateNextChapter = async (adjustment = 'maintain') => {
    setGenerationError(null);
    setIsGeneratingChapter(true);

    try {
      const updatedVocabBank = updateVocabExposuresAfterChapter(
        activeProfile.vocabBank,
        currentChapter
      );

      const profileForPrompt = {
        ...activeProfile,
        vocabBank: updatedVocabBank,
      };

      const newChapter = await generateNextChapter({
        profile: profileForPrompt,
        adjustment,
        apiKey: settings.geminiApiKey,
      });

      const initializedNewChapter = {
        ...newChapter,
        activeDifficulty: 'maintain',
        variants: {
          maintain: structuredClone(newChapter),
        },
      };

      setProfiles((prev) => {
        const latestProfile = prev[activeLang];
        const nextChapters = [...(latestProfile.chapters || []), initializedNewChapter];
        return {
          ...prev,
          [activeLang]: {
            ...latestProfile,
            storyArcSummary: newChapter.updatedArcSummary || latestProfile.storyArcSummary,
            difficultyModifier: adjustment,
            vocabBank: updatedVocabBank,
            chapters: nextChapters,
            activeChapterIndex: nextChapters.length - 1,
          },
        };
      });
      scrollToReaderTop();
    } catch (err) {
      setGenerationError(err.message || 'Failed to generate chapter.');
    } finally {
      setIsGeneratingChapter(false);
    }
  };

  /**
   * Regenerates a brand-new story with fresh vocabulary INSIDE the current chapter
   * (replacing currentChapterIndex in-place instead of advancing to a new chapter number).
   */
  const handleRegenerateCurrentChapter = async () => {
    setGenerationError(null);
    setIsGeneratingChapter(true);

    try {
      const targetChapterNum = currentChapterIndex + 1;
      const regeneratedChapter = await generateNextChapter({
        profile: activeProfile,
        adjustment: 'regenerate',
        apiKey: settings.geminiApiKey,
        targetChapterNumber: targetChapterNum,
        currentChapter,
      });

      const cleanRegenerated = {
        ...regeneratedChapter,
        chapterNumber: targetChapterNum,
        activeDifficulty: 'maintain',
      };

      setProfiles((prev) => {
        const latestProfile = prev[activeLang];
        const nextChapters = [...(latestProfile.chapters || [])];
        nextChapters[currentChapterIndex] = {
          ...cleanRegenerated,
          variants: {
            maintain: structuredClone(cleanRegenerated),
          },
        };
        return {
          ...prev,
          [activeLang]: {
            ...latestProfile,
            storyArcSummary:
              regeneratedChapter.updatedArcSummary || latestProfile.storyArcSummary,
            chapters: nextChapters,
            activeChapterIndex: currentChapterIndex,
          },
        };
      });
      scrollToReaderTop();
    } catch (err) {
      setGenerationError(err.message || 'Failed to regenerate chapter.');
    } finally {
      setIsGeneratingChapter(false);
    }
  };

  const handleSaveSettings = (nextSettings) => {
    setSettings(nextSettings);
    saveSettings(nextSettings);
    if (
      typeof window !== 'undefined' &&
      (window.location.protocol === 'http:' || window.location.protocol === 'https:')
    ) {
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextSettings),
      }).catch(() => {});
    }
  };

  const handleResetActiveProfile = () => {
    const freshDefault = structuredClone(INITIAL_PROFILES[activeLang]);
    setProfiles((prev) => ({
      ...prev,
      [activeLang]: freshDefault,
    }));
  };

  const handleTranslateSentence = (sentenceText) => {
    setTranslatorSeedText(sentenceText);
    setShowTranslator(true);
  };

  const isReaderOnly = Boolean(readerPrefs.readerOnlyMode);
  const showSidebar = showVocabDrawer && !isReaderOnly;

  const handleToggleReaderOnlyMode = () => {
    setReaderPrefs((prev) => ({
      ...prev,
      readerOnlyMode: !prev.readerOnlyMode,
    }));
  };

  return (
    <div className="min-h-screen w-full bg-[#F2F4F3] text-[#181D1B] flex flex-col">
      {/* Unified Frozen Top Heading + Audio Narration Bar (Pinned on both iOS Safari and Desktop) */}
      <div className="sticky top-0 z-40 w-full border-b border-[#DCE2DF] bg-[#FFFFFF]/95 shadow-2xs backdrop-blur-md">
        <TopReaderBar
          activeLang={activeLang}
          onSelectLang={setActiveLang}
          activeProfile={activeProfile}
          readerOnlyMode={isReaderOnly}
          onToggleReaderOnlyMode={handleToggleReaderOnlyMode}
          strictMode={readerPrefs.strictMode}
          onToggleStrictMode={() =>
            setReaderPrefs((prev) => ({ ...prev, strictMode: !prev.strictMode }))
          }
          phoneticAid={readerPrefs.phoneticAid}
          onTogglePhoneticAid={() =>
            setReaderPrefs((prev) => ({ ...prev, phoneticAid: !prev.phoneticAid }))
          }
          showEnglishTranslation={Boolean(readerPrefs.showEnglishTranslation)}
          onToggleEnglishTranslation={() =>
            setReaderPrefs((prev) => ({
              ...prev,
              showEnglishTranslation: !prev.showEnglishTranslation,
            }))
          }
          showTranslator={showTranslator}
          onToggleTranslator={() => setShowTranslator((prev) => !prev)}
          showVocabDrawer={showVocabDrawer}
          onToggleVocabDrawer={() => setShowVocabDrawer((prev) => !prev)}
          onOpenSettings={() => setShowSettingsModal(true)}
          hasGeminiKey={Boolean(settings.geminiApiKey?.trim())}
          settings={settings}
        />

        <div className="mx-auto w-full max-w-7xl px-3 pb-2.5 sm:px-6">
          <AudioPlayerBar
            chapter={currentChapter}
            bcp47={activeProfile.bcp47}
            settings={settings}
            audioBlobUrls={audioBlobUrls}
            onCacheChapterBlobUrl={handleCacheChapterBlobUrl}
            activeSpokenSentenceIdx={activeSpokenSentenceIdx}
            setActiveSpokenSentenceIdx={setActiveSpokenSentenceIdx}
          />
        </div>
      </div>

      {/* Main Content Container */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 sm:px-6">
        {/* Built-in Google Translate Panel (Hidden when Reader View is active) */}
        {showTranslator && !isReaderOnly && (
          <TranslatorPanel
            activeProfile={activeProfile}
            initialText={translatorSeedText}
            onClose={() => setShowTranslator(false)}
          />
        )}

        {/* Responsive Layout: Interactive Story Reader + Independent Sticky Dictionary & Vocab Sidebar */}
        <div
          className={`grid grid-cols-1 items-start gap-6 ${
            showSidebar ? 'lg:grid-cols-12' : 'lg:grid-cols-1'
          }`}
        >
          <div className={showSidebar ? 'lg:col-span-8' : 'mx-auto w-full max-w-3xl'}>
            <InteractiveReader
              profile={activeProfile}
              chapter={currentChapter}
              chapters={chapters}
              chapterIndex={currentChapterIndex}
              totalChapters={chapters.length}
              onSelectChapterIndex={handleSelectChapterIndex}
              onDeleteChapter={handleDeleteChapter}
              onSelectDifficultyLevel={handleSelectDifficultyLevel}
              readerOnlyMode={isReaderOnly}
              onToggleReaderOnlyMode={handleToggleReaderOnlyMode}
              strictMode={readerPrefs.strictMode}
              phoneticAid={readerPrefs.phoneticAid}
              showEnglishTranslation={Boolean(readerPrefs.showEnglishTranslation)}
              onWordClickAddVocab={handleWordClickAddVocab}
              onGenerateNextChapter={handleGenerateNextChapter}
              onRegenerateCurrentChapter={handleRegenerateCurrentChapter}
              isGeneratingChapter={isGeneratingChapter}
              generationError={generationError}
              activeSpokenSentenceIdx={activeSpokenSentenceIdx}
              onTranslateSentence={handleTranslateSentence}
            />
          </div>

          {showSidebar && (
            <div className="lg:col-span-4">
              <VocabSidebar
                profile={activeProfile}
                chapter={currentChapter}
                onToggleWordStatus={handleToggleWordStatus}
                onRemoveWord={handleRemoveWord}
                onAddCustomVocabWord={handleWordClickAddVocab}
              />
            </div>
          )}
        </div>
      </main>

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onSaveSettings={handleSaveSettings}
          onResetActiveProfile={handleResetActiveProfile}
          activeProfileName={activeProfile.name}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
}
