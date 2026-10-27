import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  ShieldAlert,
  Languages,
  BookmarkCheck,
  Settings,
  Globe,
  Subtitles,
  Menu,
  X,
} from 'lucide-react';
import { LANGUAGE_METADATA } from '../types/schema';

export default function TopReaderBar({
  activeLang,
  onSelectLang,
  activeProfile,
  readerOnlyMode,
  onToggleReaderOnlyMode,
  strictMode,
  onToggleStrictMode,
  phoneticAid,
  onTogglePhoneticAid,
  showEnglishTranslation,
  onToggleEnglishTranslation,
  showTranslator,
  onToggleTranslator,
  showVocabDrawer,
  onToggleVocabDrawer,
  onOpenSettings,
  hasGeminiKey,
  settings,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const menuRef = useRef(null);

  const mobileBaseUrl = 'https://tcandeu-afk.github.io/thialogue/';
  let mobileSyncUrl = mobileBaseUrl;
  try {
    if (
      settings &&
      (settings.elevenLabsApiKey?.trim() || settings.geminiApiKey?.trim())
    ) {
      const token = btoa(
        JSON.stringify({
          elevenLabsApiKey: settings.elevenLabsApiKey || '',
          elevenLabsVoiceId: settings.elevenLabsVoiceId || '',
          geminiApiKey: settings.geminiApiKey || '',
        })
      );
      mobileSyncUrl = `${mobileBaseUrl}?sync=${encodeURIComponent(token)}`;
    }
  } catch {
    mobileSyncUrl = mobileBaseUrl;
  }
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(
    mobileSyncUrl
  )}`;

  const isCJK = activeProfile?.id === 'ja';

  const learningCount = (activeProfile?.vocabBank || []).filter(
    (w) => w.status === 'learning'
  ).length;
  const acquiredCount = (activeProfile?.vocabBank || []).filter(
    (w) => w.status === 'acquired'
  ).length;

  // Close burger menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <header className="w-full">
      <div className="mx-auto max-w-7xl px-3 py-2 sm:px-6 sm:py-2.5">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: Thialogue Brand + Language Profile Dropdown (constrained on mobile so it never overflows) */}
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
            <div className="flex shrink-0 items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#234E68] text-white shadow-2xs sm:h-8 sm:w-8">
                <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <h1 className="font-serif text-base font-semibold tracking-tight text-[#181D1B] sm:text-xl">
                <span className="text-[#EA580C]">Thi</span>alogue
              </h1>
            </div>

            {/* Quiet Fjord-Blue Language Profile Dropdown Menu */}
            <select
              value={activeLang}
              onChange={(e) => onSelectLang(e.target.value)}
              aria-label="Select Language Profile"
              className="min-w-0 max-w-[118px] sm:max-w-none truncate cursor-pointer rounded-xl border border-[#C6D8E4] bg-[#F1F6FA] px-2 py-1.5 text-xs font-semibold text-[#1E3F54] shadow-2xs transition hover:bg-[#E5EFF6] focus:border-[#234E68] focus:outline-none sm:px-3"
            >
              {LANGUAGE_METADATA.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.flag} {lang.name} ({lang.cefrLevel.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          {/* Right: English Translation Toggle + Safari-Style Reader View Toggle + Burger Menu Button */}
          <div className="relative flex shrink-0 items-center gap-1.5 sm:gap-2" ref={menuRef}>
            {strictMode && (
              <span className="hidden rounded-md bg-[#8C4A3E] px-2 py-0.5 text-[11px] font-semibold text-white lg:inline-block">
                Strict ON
              </span>
            )}

            {/* Direct Top-Bar English Translation Toggle Button (EN ON / EN OFF) */}
            <button
              type="button"
              onClick={onToggleEnglishTranslation}
              disabled={strictMode}
              title={
                strictMode
                  ? 'Disable Strict Mode in Menu to show English translations'
                  : showEnglishTranslation
                  ? 'Hide English sentence translations (EN OFF)'
                  : 'Show English sentence translations (EN ON)'
              }
              aria-label="Toggle English Translation"
              className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition ${
                strictMode
                  ? 'cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400'
                  : showEnglishTranslation
                  ? 'border-[#2D5A46] bg-[#2D5A46] text-white shadow-2xs'
                  : 'border-[#DCE2DF] bg-[#F7F9F8] text-[#181D1B] hover:bg-[#EEF2F0]'
              }`}
            >
              <Subtitles className="h-3.5 w-3.5" />
              <span>{showEnglishTranslation && !strictMode ? 'EN ON' : 'EN OFF'}</span>
            </button>

            {/* Safari Reader-Inspired "Text & Sound Only" Quick Toggle (AA Reader) */}
            <button
              type="button"
              onClick={onToggleReaderOnlyMode}
              title={
                readerOnlyMode
                  ? 'Exit Reader View (Show all tools & sidebars)'
                  : 'Reader View: Simplified Text & Sound Only (Safari Reader style)'
              }
              aria-label="Toggle Simplified Text and Sound Only Reader View"
              className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition ${
                readerOnlyMode
                  ? 'border-[#2D5A46] bg-[#2D5A46] text-white shadow-2xs'
                  : 'border-[#DCE2DF] bg-[#F7F9F8] text-[#181D1B] hover:bg-[#EEF2F0]'
              }`}
            >
              <span className="font-serif text-[13px] font-bold leading-none tracking-tight">
                AA
              </span>
              <span className="hidden xs:inline sm:inline">
                {readerOnlyMode ? 'Reader ON' : 'Reader'}
              </span>
            </button>

            {/* Burger Menu Button */}
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Open Reader Controls Menu"
              className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition sm:gap-2 sm:px-3 ${
                menuOpen
                  ? 'border-[#181D1B] bg-[#181D1B] text-white'
                  : 'border-[#DCE2DF] bg-[#F7F9F8] text-[#181D1B] hover:bg-[#EEF2F0]'
              }`}
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              <span>Menu</span>
              <span
                className={`h-2 w-2 rounded-full ${
                  hasGeminiKey ? 'bg-[#3B7A57]' : 'bg-[#C88A32]'
                }`}
              />
            </button>

            {/* Burger Dropdown Menu Popover */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-[#DCE2DF] bg-[#FFFFFF] p-2.5 shadow-xl z-50 space-y-1.5">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#737F79]">
                  Reading Modes &amp; Aids
                </div>

                {/* 0. Safari-Inspired Reader View (Text & Sound Only) Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    onToggleReaderOnlyMode();
                    setMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                    readerOnlyMode
                      ? 'border-[#2D5A46] bg-[#2D5A46] text-white'
                      : 'border-[#CDE0D6] bg-[#F2F7F4] text-[#284E3D] hover:bg-[#E5F0EA]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="inline-flex h-4 w-5 items-center justify-center rounded bg-black/10 font-serif text-[11px] font-bold">
                      AA
                    </span>
                    <span>Text &amp; Sound Only (Reader)</span>
                  </span>
                  <span className="rounded px-1.5 py-0.5 text-[10px] font-bold bg-black/10">
                    {readerOnlyMode ? 'ON' : 'OFF'}
                  </span>
                </button>

                {/* 1. Strict Mode Toggle */}
                <button
                  type="button"
                  onClick={onToggleStrictMode}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                    strictMode
                      ? 'border-[#8C4A3E] bg-[#8C4A3E] text-white'
                      : 'border-[#E6D2CE] bg-[#FAF4F2] text-[#6E3B31] hover:bg-[#F3E7E4]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" />
                    <span>Strict Mode</span>
                  </span>
                  <span className="rounded px-1.5 py-0.5 text-[10px] font-bold bg-black/10">
                    {strictMode ? 'ON' : 'OFF'}
                  </span>
                </button>

                {/* 2. Conditional Phonetic Aid Toggle (JA, KO, TH) */}
                {isCJK && (
                  <button
                    type="button"
                    onClick={onTogglePhoneticAid}
                    disabled={strictMode}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      strictMode
                        ? 'cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400'
                        : phoneticAid
                        ? 'border-[#464E70] bg-[#464E70] text-white'
                        : 'border-[#D6D9E8] bg-[#F4F5FA] text-[#3E4563] hover:bg-[#E8EBF4]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Languages className="h-4 w-4" />
                      <span>Phonetic Aid</span>
                    </span>
                    <span className="rounded px-1.5 py-0.5 text-[10px] font-bold bg-black/10">
                      {strictMode ? 'Hidden' : phoneticAid ? 'ON' : 'OFF'}
                    </span>
                  </button>
                )}

                <div className="my-1 border-t border-[#E8ECEA] pt-1.5 px-2.5 text-[10px] font-bold uppercase tracking-wider text-[#737F79]">
                  Tools &amp; Configuration
                </div>

                {/* 4. Built-in Translator Panel */}
                <button
                  type="button"
                  onClick={() => {
                    onToggleTranslator();
                    setMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-xs font-medium transition ${
                    showTranslator
                      ? 'border-[#234E68] bg-[#234E68] text-white'
                      : 'border-[#C9DCE8] bg-[#F2F7FA] text-[#234E68] hover:bg-[#E4EFF6]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>Google Translator Panel</span>
                  </span>
                  <span className="text-[10px] font-semibold">
                    {showTranslator ? 'Shown' : 'Open'}
                  </span>
                </button>

                {/* 5. Dictionary & Vocab Bank Sidebar Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    onToggleVocabDrawer();
                    setMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-xs font-medium transition ${
                    showVocabDrawer
                      ? 'border-[#2C3531] bg-[#2C3531] text-white'
                      : 'border-[#DCE2DF] bg-[#F7F9F8] text-[#181D1B] hover:bg-[#EEF2F0]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <BookmarkCheck className="h-4 w-4 text-[#D9A756]" />
                    <span>Dictionary &amp; Vocab Sidebar</span>
                  </span>
                  <span className="rounded-full bg-[#F6EBD8] px-2 py-0.5 text-[10px] font-bold text-[#6E4E19]">
                    {learningCount}L/{acquiredCount}A
                  </span>
                </button>

                {/* 6. API Keys & Audio Settings Modal */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenSettings();
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-[#DCE2DF] bg-[#F7F9F8] px-3 py-2 text-xs font-medium text-[#181D1B] transition hover:bg-[#EEF2F0]"
                >
                  <span className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-[#5C6661]" />
                    <span>API Keys &amp; Audio Settings</span>
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                      hasGeminiKey
                        ? 'bg-[#EFF6F2] text-[#285943]'
                        : 'bg-[#FDF8EE] text-[#785420]'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        hasGeminiKey ? 'bg-[#3B7A57]' : 'bg-[#C88A32]'
                      }`}
                    />
                    {hasGeminiKey ? 'Ready' : 'Setup'}
                  </span>
                </button>

                {/* 7. Open on Phone (Wi-Fi QR Code + Auto-Sync API Keys) */}
                <div className="pt-1 border-t border-[#E8ECEA]">
                  <button
                    type="button"
                    onClick={() => setShowQrCode((prev) => !prev)}
                    className="flex w-full items-center justify-between rounded-xl border border-[#C9DCE8] bg-[#F1F6FA] px-3 py-2 text-xs font-semibold text-[#1E3F54] transition hover:bg-[#E4EFF6]"
                  >
                    <span>📱 Open on Your Phone (QR Code)</span>
                    <span className="text-[10px] font-bold text-[#234E68]">
                      {showQrCode ? 'Hide' : 'Scan'}
                    </span>
                  </button>

                  {showQrCode && (
                    <div className="mt-2 rounded-xl border border-[#D5E1E8] bg-[#FFFFFF] p-3 text-center">
                      <p className="text-[11px] font-medium text-[#2A332F]">
                        Scan with your phone camera (on the same Wi-Fi):
                      </p>
                      <div className="my-2 flex justify-center">
                        <img
                          src={qrImageUrl}
                          alt="Scan to open Thialogue on your phone"
                          className="h-36 w-36 rounded-lg border border-[#E2E7E4]"
                        />
                      </div>
                      <p className="font-mono text-[11px] font-semibold text-[#234E68] select-all">
                        http://192.168.1.62:8080
                      </p>
                      <p className="mt-1 text-[10px] text-[#6E7A74]">
                        Your saved ElevenLabs &amp; Gemini keys will sync automatically!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
