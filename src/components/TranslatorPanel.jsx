import React, { useState, useEffect } from 'react';
import {
  Globe,
  ArrowRight,
  Copy,
  Check,
  Volume2,
  ExternalLink,
  Loader2,
  X,
} from 'lucide-react';
import {
  translateToEnglish,
  buildGoogleTranslateWebUrl,
} from '../services/translateService';
import { speakSingleWord } from '../services/audioService';
import { LANGUAGE_METADATA } from '../types/schema';

export default function TranslatorPanel({
  activeProfile,
  initialText,
  onClose,
}) {
  const [sourceLang, setSourceLang] = useState(activeProfile?.translateCode || 'fr');
  const [inputText, setInputText] = useState(initialText || '');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Sync language when active profile switches
  useEffect(() => {
    if (activeProfile?.translateCode) {
      setSourceLang(activeProfile.translateCode);
    }
  }, [activeProfile?.translateCode]);

  // Automatically translate when a sentence is sent from the reader
  useEffect(() => {
    if (initialText && initialText.trim()) {
      setInputText(initialText);
      runTranslation(initialText, activeProfile?.translateCode || sourceLang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialText]);

  const runTranslation = async (textToTranslate = inputText, lang = sourceLang) => {
    const trimmed = (textToTranslate || '').trim();
    if (!trimmed) {
      setTranslatedText('');
      return;
    }

    setIsTranslating(true);
    setError(null);
    try {
      const result = await translateToEnglish(trimmed, lang);
      setTranslatedText(result.translatedText);
    } catch (err) {
      setError(
        `${err.message}. You can also open the phrase directly in Google Translate below.`
      );
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard?.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const currentLangMeta =
    LANGUAGE_METADATA.find((l) => l.translateCode === sourceLang) || activeProfile;

  return (
    <div className="mb-6 rounded-2xl border border-stone-900/30 bg-[#FFFFFF] p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EEF2F0] pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-900 text-stone-100">
            <Globe className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#181D1B]">
              Built-in Google Translate to English
            </h3>
            <p className="text-[11px] text-[#5C6661]">
              Instant translation from French, Italian, Korean, Japanese &amp; Spanish to English
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Source Language Selector */}
          <select
            value={sourceLang}
            onChange={(e) => {
              const nextLang = e.target.value;
              setSourceLang(nextLang);
              if (inputText.trim()) {
                runTranslation(inputText, nextLang);
              }
            }}
            className="rounded-lg border border-[#D5DDD9] bg-[#F7F9F8] px-2.5 py-1 text-xs font-semibold text-[#181D1B] focus:border-stone-900 focus:outline-none"
          >
            {LANGUAGE_METADATA.map((lang) => (
              <option key={lang.id} value={lang.translateCode}>
                {lang.flag} {lang.name} ({lang.nativeName}) → English
              </option>
            ))}
            <option value="auto">🌐 Auto-Detect → English</option>
          </select>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#5C6661] hover:bg-[#EEF2F0] hover:text-[#181D1B]"
            title="Close Translator"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Source Language Input Box */}
        <div className="flex flex-col">
          <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-[#5C6661]">
            <span>Source Text ({currentLangMeta?.name || 'Source'})</span>
            <div className="flex items-center gap-2">
              {inputText.trim() && (
                <button
                  type="button"
                  onClick={() =>
                    speakSingleWord(inputText, currentLangMeta?.bcp47 || 'fr-FR', 0.95)
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-900 hover:underline"
                >
                  <Volume2 className="h-3 w-3" />
                  Listen
                </button>
              )}
              {inputText && (
                <button
                  type="button"
                  onClick={() => {
                    setInputText('');
                    setTranslatedText('');
                  }}
                  className="text-[11px] text-[#87928D] hover:text-[#181D1B]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Paste or click "Translate" on any ${
              currentLangMeta?.name || ''
            } sentence in the story...`}
            className="w-full rounded-xl border border-[#D5DDD9] bg-[#F7F9F8] p-3 font-serif text-base text-[#181D1B] placeholder:font-sans placeholder:text-xs placeholder:text-[#87928D] focus:border-stone-900 focus:outline-none"
          />

          <div className="mt-2 flex items-center justify-between">
            <a
              href={buildGoogleTranslateWebUrl(inputText, sourceLang)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#5C6661] hover:text-stone-900 hover:underline"
            >
              <span>Open in Google Translate Web</span>
              <ExternalLink className="h-3 w-3" />
            </a>

            <button
              type="button"
              onClick={() => runTranslation(inputText, sourceLang)}
              disabled={isTranslating || !inputText.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-1.5 text-xs font-semibold text-stone-100 transition hover:bg-stone-700 disabled:opacity-50"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Translating...</span>
                </>
              ) : (
                <>
                  <span>Translate to English</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* English Output Box */}
        <div className="flex flex-col">
          <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-[#5C6661]">
            <span>English Translation (Google Translate)</span>
            {translatedText && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-900 hover:underline"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-700" />
                    <span className="text-emerald-800">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex min-h-[96px] flex-1 items-center rounded-xl border border-[#EEF2F0] bg-[#F7F9F8]/60 p-3.5 text-sm leading-relaxed text-[#181D1B]">
            {isTranslating ? (
              <span className="flex items-center gap-2 text-xs text-[#737F79]">
                <Loader2 className="h-4 w-4 animate-spin text-stone-700" />
                Fetching English translation from Google Translate...
              </span>
            ) : error ? (
              <span className="text-xs text-red-800">{error}</span>
            ) : translatedText ? (
              <p className="font-sans text-base font-medium text-[#181D1B]">
                {translatedText}
              </p>
            ) : (
              <span className="text-xs text-[#87928D]">
                Click the &ldquo;Translate&rdquo; icon at the end of any sentence or type above to
                translate into English.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
