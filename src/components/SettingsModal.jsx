import React, { useState } from 'react';
import {
  X,
  KeyRound,
  Volume2,
  ShieldCheck,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Play,
} from 'lucide-react';
import {
  DEFAULT_ELEVENLABS_VOICE_ID,
  DEFAULT_ELEVENLABS_MODEL,
} from '../types/schema';
import {
  ELEVENLABS_VOICE_PRESETS,
  testElevenLabsConnection,
  sanitizeApiKey,
  resolveVoiceId,
} from '../services/audioService';

export default function SettingsModal({
  settings,
  onSaveSettings,
  onResetActiveProfile,
  activeProfileName,
  onClose,
}) {
  const [geminiApiKey, setGeminiApiKey] = useState(settings?.geminiApiKey || '');
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState(
    settings?.elevenLabsApiKey || ''
  );
  const [elevenLabsVoiceId, setElevenLabsVoiceId] = useState(
    settings?.elevenLabsVoiceId || DEFAULT_ELEVENLABS_VOICE_ID
  );

  const [testState, setTestState] = useState({
    loading: false,
    success: null,
    error: null,
  });

  const handleTestElevenLabs = async () => {
    setTestState({ loading: true, success: null, error: null });
    try {
      const sampleBlobUrl = await testElevenLabsConnection({
        elevenLabsApiKey,
        voiceId: elevenLabsVoiceId,
      });
      try {
        const audio = new Audio(sampleBlobUrl);
        audio.onended = () => URL.revokeObjectURL(sampleBlobUrl);
        audio.play().catch(() => {});
      } catch {
        // ignore sample playback error once connection is verified
      }
      setTestState({
        loading: false,
        success: `Connected! ElevenLabs synthesized audio with Voice ID "${resolveVoiceId(
          elevenLabsVoiceId
        )}". Don't forget to click "Save Settings".`,
        error: null,
      });
    } catch (err) {
      setTestState({
        loading: false,
        success: null,
        error: err.message || 'ElevenLabs connection test failed.',
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings({
      geminiApiKey: sanitizeApiKey(geminiApiKey),
      elevenLabsApiKey: sanitizeApiKey(elevenLabsApiKey),
      elevenLabsVoiceId: resolveVoiceId(elevenLabsVoiceId),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#E4E8E6] bg-[#FFFFFF] p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#EEF2F0] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-900 text-stone-100">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#181D1B]">
                API Keys &amp; Audio Configuration
              </h2>
              <p className="text-xs text-[#5C6661]">
                Saved locally in browser localStorage • Zero external database
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#5C6661] hover:bg-[#EEF2F0] hover:text-[#181D1B]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Gemini API Key */}
          <div>
            <label className="block text-xs font-semibold text-[#181D1B]">
              Google Gemini API Key (<code className="text-stone-900">gemini-2.5-flash</code>)
            </label>
            <p className="mt-0.5 text-[11px] text-[#5C6661]">
              Used to generate pre-tokenised graded-reader chapters with structured JSON output and
              contextual vocabulary recycling.
            </p>
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="mt-1.5 w-full rounded-xl border border-[#D5DDD9] bg-[#F7F9F8] px-3.5 py-2 text-xs text-[#181D1B] focus:border-stone-900 focus:outline-none"
            />
          </div>

          {/* ElevenLabs API Key */}
          <div className="rounded-xl border border-[#EEF2F0] bg-[#F7F9F8]/60 p-3.5 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#181D1B]">
                ElevenLabs API Key (Optional — Web Speech Fallback Active)
              </label>
              <p className="mt-0.5 text-[11px] text-[#5C6661]">
                Powers the &ldquo;Play Full Chapter&rdquo; neural narrator. Make sure your key has{' '}
                <strong>Text to Speech</strong> permission enabled in ElevenLabs.
              </p>
              <input
                type="password"
                value={elevenLabsApiKey}
                onChange={(e) => setElevenLabsApiKey(e.target.value)}
                placeholder="sk_..."
                className="mt-1.5 w-full rounded-xl border border-[#D5DDD9] bg-[#FFFFFF] px-3.5 py-2 text-xs text-[#181D1B] focus:border-stone-900 focus:outline-none"
              />
            </div>

            {/* ElevenLabs Voice ID + Presets */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#181D1B]">
                  ElevenLabs Voice ID (Model:{' '}
                  <code className="text-stone-900">{DEFAULT_ELEVENLABS_MODEL}</code>)
                </label>
                <button
                  type="button"
                  onClick={() => setElevenLabsVoiceId(DEFAULT_ELEVENLABS_VOICE_ID)}
                  className="text-[11px] font-medium text-stone-900 hover:underline"
                >
                  Reset to Default ({DEFAULT_ELEVENLABS_VOICE_ID})
                </button>
              </div>

              {/* Quick Preset Picker */}
              <select
                value={
                  ELEVENLABS_VOICE_PRESETS.some((p) => p.id === elevenLabsVoiceId)
                    ? elevenLabsVoiceId
                    : 'custom'
                }
                onChange={(e) => {
                  if (e.target.value !== 'custom') {
                    setElevenLabsVoiceId(e.target.value);
                  }
                }}
                className="mt-1.5 w-full rounded-xl border border-[#D5DDD9] bg-[#FFFFFF] px-3 py-1.5 text-xs text-[#181D1B] focus:border-stone-900 focus:outline-none"
              >
                {ELEVENLABS_VOICE_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name} ({preset.id})
                  </option>
                ))}
                <option value="custom">Custom Voice ID (enter below)</option>
              </select>

              <div className="mt-1.5 flex items-center gap-2">
                <Volume2 className="h-4 w-4 shrink-0 text-[#5C6661]" />
                <input
                  type="text"
                  value={elevenLabsVoiceId}
                  onChange={(e) => setElevenLabsVoiceId(e.target.value)}
                  placeholder={DEFAULT_ELEVENLABS_VOICE_ID}
                  className="w-full rounded-xl border border-[#D5DDD9] bg-[#FFFFFF] px-3.5 py-1.5 text-xs font-mono text-[#181D1B] focus:border-stone-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Test ElevenLabs Button & Diagnostic Feedback */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleTestElevenLabs}
                disabled={testState.loading || !elevenLabsApiKey.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-stone-900/40 bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-800 transition hover:bg-stone-200/80 disabled:opacity-50"
              >
                {testState.loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Testing ElevenLabs Key...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Test ElevenLabs Voice &amp; API Key</span>
                  </>
                )}
              </button>

              {testState.success && (
                <div className="mt-2 flex items-start gap-2 rounded-lg border border-emerald-300 bg-emerald-50 p-2.5 text-xs text-emerald-900">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                  <span>{testState.success}</span>
                </div>
              )}

              {testState.error && (
                <div className="mt-2 flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-2.5 text-xs text-red-900">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" />
                  <span>{testState.error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Storage Safety Note */}
          <div className="flex items-start gap-2.5 rounded-xl border border-[#EEF2F0] bg-[#F7F9F8]/80 p-3 text-[11px] text-[#5C6661]">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
            <span>
              <strong>5MB Quota Protection:</strong> Generated chapter audio is stored strictly as an
              in-memory Blob URL in React state and is never written to{' '}
              <code>localStorage</code>.
            </span>
          </div>

          {/* Reset Active Profile Option */}
          <div className="flex items-center justify-between border-t border-[#EEF2F0] pt-4">
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    `Reset ${activeProfileName} profile back to starter Chapter 1 and default vocabulary?`
                  )
                ) {
                  onResetActiveProfile();
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-50/80 px-3 py-1.5 text-xs font-medium text-red-900 hover:bg-red-100"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset {activeProfileName} Profile</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#D5DDD9] bg-[#F7F9F8] px-4 py-2 text-xs font-semibold text-[#5C6661] hover:bg-[#EEF2F0]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-stone-100 shadow-xs hover:bg-stone-700"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Settings</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
