import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Volume2,
  Play,
  Pause,
  Square,
  Loader2,
  AlertCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  synthesizeChapterWithElevenLabs,
  getSilentUnlockBlobUrl,
  ensurePlaybackAudioSession,
} from '../services/audioService';
import { DEFAULT_ELEVENLABS_VOICE_ID } from '../types/schema';

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Computes proportional start/end ratios and time ranges for each sentence in a chapter
 * weighted by each sentence's character length.
 */
function getSentenceSegments(sentences = [], duration = 0) {
  if (!Array.isArray(sentences) || sentences.length === 0) return [];
  const safeDuration = Number.isFinite(duration) && duration > 0.2 ? duration : 0;
  const lengths = sentences.map((s) => Math.max(8, (s?.fullSentence || '').length));
  const totalChars = lengths.reduce((acc, n) => acc + n, 0) || 1;

  let cumulative = 0;
  return sentences.map((s, idx) => {
    const weightRatio = lengths[idx] / totalChars;
    const startRatio = cumulative;
    cumulative += weightRatio;
    const endRatio = idx === sentences.length - 1 ? 1 : cumulative;
    return {
      index: idx,
      text: s?.fullSentence || `Sentence ${idx + 1}`,
      translation: s?.sentenceTranslation || '',
      weightRatio,
      startRatio,
      endRatio,
      startTime: startRatio * safeDuration,
      endTime: endRatio * safeDuration,
    };
  });
}

/**
 * Estimates which sentence index (0..N-1) is currently being narrated at `currentTime`
 * out of `duration`, weighted by each sentence's character length.
 */
function getSentenceIndexAtTime(sentences = [], currentTime = 0, duration = 0) {
  if (!Array.isArray(sentences) || sentences.length === 0) return null;
  if (!Number.isFinite(duration) || duration <= 0.2) return 0;

  const progress = Math.max(0, Math.min(0.999, currentTime / duration));
  const segments = getSentenceSegments(sentences, duration);
  for (let i = 0; i < segments.length; i += 1) {
    if (progress < segments[i].endRatio || i === segments.length - 1) {
      return i;
    }
  }
  return segments.length - 1;
}

export default function AudioPlayerBar({
  chapter,
  bcp47,
  settings,
  audioBlobUrls,
  onCacheChapterBlobUrl,
  activeSpokenSentenceIdx,
  setActiveSpokenSentenceIdx,
}) {
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [audioError, setAudioError] = useState(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const htmlAudioRef = useRef(null);
  const playbackRateRef = useRef(1.0);
  const activeStreamSourceRef = useRef(''); // tracks current <audio> src
  const isSilentUnlockActiveRef = useRef(false);
  const pendingSeekRatioRef = useRef(null);

  const hasElevenLabsKey = Boolean(settings?.elevenLabsApiKey?.trim());
  const cachedAudioKey = chapter?.id ? audioBlobUrls[chapter.id] : null;

  const sentenceSegments = useMemo(
    () => getSentenceSegments(chapter?.sentences || [], duration),
    [chapter?.sentences, duration]
  );

  const currentSentenceIdx = useMemo(() => {
    if (activeSpokenSentenceIdx !== null && activeSpokenSentenceIdx !== undefined) {
      return activeSpokenSentenceIdx;
    }
    if (duration > 0.2 && currentTime > 0.05) {
      return getSentenceIndexAtTime(chapter?.sentences, currentTime, duration) ?? 0;
    }
    return 0;
  }, [activeSpokenSentenceIdx, chapter?.sentences, currentTime, duration]);

  useEffect(() => {
    stopAllPlayback(true);
    setAudioError(null);
    setCurrentTime(0);
    setDuration(0);
    activeStreamSourceRef.current = '';
    isSilentUnlockActiveRef.current = false;
    pendingSeekRatioRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter?.id, bcp47]);

  useEffect(() => {
    return () => {
      stopAllPlayback(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopAllPlayback = (resetOffset = true) => {
    setIsGeneratingAudio(false);
    isSilentUnlockActiveRef.current = false;
    pendingSeekRatioRef.current = null;

    if (htmlAudioRef.current) {
      try {
        htmlAudioRef.current.pause();
        if (resetOffset) {
          htmlAudioRef.current.currentTime = 0;
        }
      } catch {
        // ignore
      }
    }

    if (resetOffset) {
      setCurrentTime(0);
    }

    setIsPlaying(false);
    setActiveSpokenSentenceIdx(null);
  };

  const playUrlOnHtmlAudio = async (targetUrl, targetSeekRatio = null) => {
    const el = htmlAudioRef.current;
    if (!el || !targetUrl) {
      return false;
    }

    isSilentUnlockActiveRef.current = false;
    el.loop = false;
    el.muted = false;
    el.volume = 1.0;
    el.playbackRate = playbackRateRef.current;

    if (targetSeekRatio !== null && Number.isFinite(targetSeekRatio)) {
      pendingSeekRatioRef.current = targetSeekRatio;
    }

    if (activeStreamSourceRef.current !== targetUrl) {
      activeStreamSourceRef.current = targetUrl;
      el.src = targetUrl;
    } else if (
      pendingSeekRatioRef.current !== null &&
      Number.isFinite(el.duration) &&
      el.duration > 0.5
    ) {
      const seekTime = pendingSeekRatioRef.current * el.duration;
      el.currentTime = seekTime;
      setCurrentTime(seekTime);
      pendingSeekRatioRef.current = null;
    }

    try {
      await el.play();
      setIsGeneratingAudio(false);
      setIsPlaying(true);
      return true;
    } catch (err) {
      console.warn('HTML5 audio play() rejected:', err);
      return false;
    }
  };

  const handlePlayPause = async (overrideSeekRatio = null) => {
    setAudioError(null);
    ensurePlaybackAudioSession();

    const hasExplicitSeek =
      typeof overrideSeekRatio === 'number' && Number.isFinite(overrideSeekRatio);

    // 1. If currently playing and no explicit sentence jump requested, pause immediately
    if (isPlaying && !hasExplicitSeek) {
      if (htmlAudioRef.current) {
        htmlAudioRef.current.pause();
      }
      setIsPlaying(false);
      return;
    }

    const el = htmlAudioRef.current;

    // Check if we have pre-rendered static audio bundled in audio/{chapter.id}.wav
    const preRenderedAudioUrl = chapter?.id ? `audio/${chapter.id}.wav` : null;

    if (!hasElevenLabsKey && !preRenderedAudioUrl) {
      setAudioError(
        'Please add your ElevenLabs API Key in Menu → API Keys & Audio Settings to play neural narration.'
      );
      return;
    }

    // 2. If paused mid-chapter on the same stream, resume (or seek & resume) immediately inside the gesture!
    if (
      el &&
      activeStreamSourceRef.current &&
      !isSilentUnlockActiveRef.current &&
      el.duration > 0.5
    ) {
      el.playbackRate = playbackRateRef.current;
      if (hasExplicitSeek) {
        const targetTime = overrideSeekRatio * el.duration;
        el.currentTime = targetTime;
        setCurrentTime(targetTime);
      } else if (el.currentTime >= el.duration - 0.1) {
        el.currentTime = 0;
        setCurrentTime(0);
      }
      try {
        await el.play();
        setIsPlaying(true);
        return;
      } catch {
        // fall through to regenerate/play
      }
    }

    // 3. If we already cached an ElevenLabs Blob URL for this chapter in this session, play it in 0ms!
    if (cachedAudioKey && cachedAudioKey.startsWith('blob:')) {
      const ok = await playUrlOnHtmlAudio(
        cachedAudioKey,
        hasExplicitSeek ? overrideSeekRatio : null
      );
      if (ok) return;
    }

    // 4. If no ElevenLabs API key is entered, play the bundled pre-rendered audio file!
    if (!hasElevenLabsKey && preRenderedAudioUrl) {
      const ok = await playUrlOnHtmlAudio(
        preRenderedAudioUrl,
        hasExplicitSeek ? overrideSeekRatio : null
      );
      if (ok) return;
    }

    if (hasExplicitSeek) {
      pendingSeekRatioRef.current = overrideSeekRatio;
    }

    // 5. Unlock <audio> synchronously with a 0.25s silent Blob URL
    //    AND fetch the ElevenLabs neural MP3 directly from the browser (`https://api.elevenlabs.io/...`)!
    if (el) {
      try {
        isSilentUnlockActiveRef.current = true;
        el.loop = false;
        el.src = getSilentUnlockBlobUrl();
        const unlockP = el.play();
        if (unlockP && typeof unlockP.catch === 'function') unlockP.catch(() => {});
      } catch {
        // ignore
      }
    }

    setIsGeneratingAudio(true);
    try {
      const blobUrl = await synthesizeChapterWithElevenLabs({
        chapter,
        elevenLabsApiKey: settings.elevenLabsApiKey,
        voiceId: settings.elevenLabsVoiceId || DEFAULT_ELEVENLABS_VOICE_ID,
      });
      onCacheChapterBlobUrl(chapter.id, blobUrl);
      await playUrlOnHtmlAudio(
        blobUrl,
        hasExplicitSeek ? overrideSeekRatio : pendingSeekRatioRef.current
      );
    } catch (err) {
      console.warn('ElevenLabs synthesis error:', err);
      setAudioError(err?.message || 'ElevenLabs narration failed. Please try again.');
    } finally {
      setIsGeneratingAudio(false);
      isSilentUnlockActiveRef.current = false;
    }
  };

  /**
   * Jumps directly to the beginning of sentence `targetIdx` (0..N-1).
   * - If audio is already loaded (playing or paused), seeks `<audio>` to the exact start of that sentence.
   * - If audio hasn't been generated/loaded yet, triggers synthesis and jumps to that sentence once ready.
   */
  const handleJumpToSentence = (targetIdx) => {
    if (!sentenceSegments.length) return;
    const clampedIdx = Math.max(0, Math.min(sentenceSegments.length - 1, targetIdx));
    const seg = sentenceSegments[clampedIdx];
    if (!seg) return;

    setActiveSpokenSentenceIdx(clampedIdx);

    const el = htmlAudioRef.current;
    if (
      el &&
      activeStreamSourceRef.current &&
      !isSilentUnlockActiveRef.current &&
      Number.isFinite(el.duration) &&
      el.duration > 0.5
    ) {
      const newTime = seg.startRatio * el.duration;
      el.currentTime = newTime;
      setCurrentTime(newTime);
      return;
    }

    // Audio not loaded yet: start loading and seek to this sentence's startRatio
    handlePlayPause(seg.startRatio);
  };

  const handleSpeedChange = (newRate) => {
    playbackRateRef.current = newRate;
    setPlaybackRate(newRate);
    if (htmlAudioRef.current) {
      htmlAudioRef.current.playbackRate = newRate;
    }
  };

  return (
    <div className="rounded-xl border border-[#D5E1E8] bg-[#F8FBFD] px-3 py-2.5 shadow-2xs">
      {/* Persistent HTML5 Audio Element playing ElevenLabs Neural Blob URLs */}
      <audio
        ref={htmlAudioRef}
        preload="auto"
        playsInline
        className="hidden"
        onLoadedMetadata={(e) => {
          if (isSilentUnlockActiveRef.current) return;
          const d = e.currentTarget.duration;
          if (Number.isFinite(d) && d > 0.5) {
            setDuration(d);
            if (pendingSeekRatioRef.current !== null) {
              const seekTime = pendingSeekRatioRef.current * d;
              e.currentTarget.currentTime = seekTime;
              setCurrentTime(seekTime);
              const sIdx = getSentenceIndexAtTime(chapter?.sentences, seekTime, d);
              if (sIdx !== null) {
                setActiveSpokenSentenceIdx(sIdx);
              }
              pendingSeekRatioRef.current = null;
            }
          }
        }}
        onPlaying={() => {
          if (isSilentUnlockActiveRef.current) return;
          setIsGeneratingAudio(false);
          setIsPlaying(true);
          if (activeSpokenSentenceIdx === null) {
            setActiveSpokenSentenceIdx(0);
          }
        }}
        onTimeUpdate={(e) => {
          if (isSilentUnlockActiveRef.current) return;
          const t = e.currentTarget.currentTime;
          const d = e.currentTarget.duration;
          setCurrentTime(t);
          if (Number.isFinite(d) && d > 0.5) {
            setDuration(d);
            const sIdx = getSentenceIndexAtTime(chapter?.sentences, t, d);
            if (sIdx !== null) {
              setActiveSpokenSentenceIdx(sIdx);
            }
          }
        }}
        onEnded={() => {
          if (isSilentUnlockActiveRef.current) return;
          setIsGeneratingAudio(false);
          setIsPlaying(false);
          setCurrentTime(0);
          setActiveSpokenSentenceIdx(null);
        }}
        onError={() => {
          if (isSilentUnlockActiveRef.current) return;
          setIsGeneratingAudio(false);
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Play Full Chapter, Sentence Step Controls & Stop Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => handlePlayPause()}
            disabled={isGeneratingAudio}
            className="flex items-center gap-2 rounded-lg bg-[#234E68] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#1B3E54] disabled:opacity-60"
          >
            {isGeneratingAudio ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Loading Audio...</span>
              </>
            ) : isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span>Pause Narration</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>
                  {currentTime > 0.1 ? 'Resume Narration' : 'Play Full Chapter'}
                </span>
              </>
            )}
          </button>

          {/* Quick Sentence Navigation: Previous / Replay Start of Current Sentence / Next */}
          {sentenceSegments.length > 0 && (
            <div className="flex items-center rounded-lg border border-[#D5E1E8] bg-white p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => handleJumpToSentence(Math.max(0, currentSentenceIdx - 1))}
                disabled={isGeneratingAudio || currentSentenceIdx <= 0}
                className="flex items-center gap-0.5 rounded-md px-2 py-1 text-[11px] font-medium text-[#355263] transition hover:bg-[#EDF4F8] disabled:opacity-40"
                title="Previous sentence"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              <button
                type="button"
                onClick={() => handleJumpToSentence(currentSentenceIdx)}
                disabled={isGeneratingAudio}
                className="flex items-center gap-1 border-x border-[#E6ECEA] px-2.5 py-1 text-[11px] font-semibold text-[#234E68] transition hover:bg-[#EDF4F8] disabled:opacity-40"
                title="Restart current sentence from the beginning"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Replay S{currentSentenceIdx + 1}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleJumpToSentence(
                    Math.min(sentenceSegments.length - 1, currentSentenceIdx + 1)
                  )
                }
                disabled={
                  isGeneratingAudio || currentSentenceIdx >= sentenceSegments.length - 1
                }
                className="flex items-center gap-0.5 rounded-md px-2 py-1 text-[11px] font-medium text-[#355263] transition hover:bg-[#EDF4F8] disabled:opacity-40"
                title="Next sentence"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {(isPlaying || currentTime > 0.1) && (
            <button
              type="button"
              onClick={() => stopAllPlayback(true)}
              className="flex items-center gap-1 rounded-lg border border-[#DCE2DF] bg-[#F7F9F8] px-2.5 py-1.5 text-xs font-medium text-[#5C6661] hover:bg-[#EEF2F0] hover:text-[#181D1B]"
              title="Stop and reset to 00:00"
            >
              <Square className="h-3 w-3 fill-current" />
              <span>Stop</span>
            </button>
          )}
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1.5">
          <Volume2 className="h-4 w-4 text-[#87928D]" />
          <span className="text-[11px] font-medium text-[#5C6661]">Speed:</span>
          <div className="flex rounded-lg border border-[#D5E1E8] bg-[#F4F8FA] p-0.5">
            {[0.8, 0.95, 1.0, 1.15].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => handleSpeedChange(rate)}
                className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition ${
                  playbackRate === rate
                    ? 'bg-[#234E68] text-white'
                    : 'text-[#5C6661] hover:text-[#181D1B]'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* YouTube-Style Progress Line with Sentence Tick Markings */}
      {sentenceSegments.length > 0 && (
        <div className="mt-2.5 border-t border-[#E6ECEA] pt-2.5">
          <div className="flex items-center gap-3">
            <span className="w-10 shrink-0 font-mono text-[11px] font-semibold text-[#1E3F54]">
              {formatTime(currentTime)}
            </span>

            {/* Thin YouTube-Style Segmented Line (2px gap markings between sentences) */}
            <div
              className="relative flex flex-1 items-center gap-[3px] py-2 cursor-pointer"
              role="group"
              aria-label="Narration progress bar with sentence markings"
            >
              {sentenceSegments.map((seg) => {
                const overallProgress =
                  duration > 0.2 ? Math.max(0, Math.min(1, currentTime / duration)) : 0;

                let segmentFillPct = 0;
                if (duration > 0.2) {
                  if (overallProgress >= seg.endRatio) {
                    segmentFillPct = 100;
                  } else if (overallProgress > seg.startRatio) {
                    segmentFillPct =
                      ((overallProgress - seg.startRatio) /
                        Math.max(0.001, seg.endRatio - seg.startRatio)) *
                      100;
                  }
                }

                const isCurrentSentence =
                  (isPlaying || currentTime > 0.05 || activeSpokenSentenceIdx !== null) &&
                  currentSentenceIdx === seg.index;

                return (
                  <button
                    key={seg.index}
                    type="button"
                    onClick={() => handleJumpToSentence(seg.index)}
                    style={{ flexGrow: Math.max(1, Math.round(seg.weightRatio * 100)) }}
                    title={`Sentence ${seg.index + 1}: "${seg.text}"`}
                    className={`group relative h-1.5 hover:h-2.5 transition-all rounded-[2px] bg-[#D5E1E8] overflow-visible focus:outline-none ${
                      isCurrentSentence ? 'h-2 bg-[#C8D8E2]' : ''
                    }`}
                  >
                    {/* Filled Progress Line Inside This Sentence Segment */}
                    <div
                      className={`pointer-events-none absolute inset-y-0 left-0 rounded-[2px] transition-all duration-75 ${
                        isCurrentSentence ? 'bg-[#EA580C]' : 'bg-[#234E68]'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, segmentFillPct))}%` }}
                    />

                    {/* Playhead Scrubber Dot on the Currently Playing Sentence */}
                    {isCurrentSentence && duration > 0.2 && (
                      <span
                        className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-[#EA580C] shadow-xs ring-2 ring-white transition-all duration-75"
                        style={{ left: `${Math.min(100, Math.max(0, segmentFillPct))}%` }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <span className="w-10 shrink-0 text-right font-mono text-[11px] text-[#5C6661]">
              {duration > 0.2 ? formatTime(duration) : '00:00'}
            </span>
          </div>

          {activeSpokenSentenceIdx !== null && isPlaying && (
            <div className="mt-1 flex items-center justify-between text-[11px] text-[#234E68]">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#EA580C] animate-ping" />
                <span className="truncate">
                  Sentence {activeSpokenSentenceIdx + 1} of {sentenceSegments.length}
                </span>
              </div>
              <span className="text-[10px] text-[#6C7A74] shrink-0">
                Click any marked segment on the line to restart that sentence
              </span>
            </div>
          )}
        </div>
      )}

      {!hasElevenLabsKey && (
        <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-[#C6D8E4] bg-[#F1F6FA] px-3 py-1.5 text-xs text-[#1E3F54]">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[#234E68]" />
            <span>
              <strong>Pre-recorded audio ready</strong> — click <em>Play Full Chapter</em> to listen. (To use live AI voices, add your ElevenLabs API Key in <em>Menu → Settings</em>).
            </span>
          </div>
        </div>
      )}

      {audioError && (
        <div className="mt-2 flex items-start gap-2 rounded-lg border border-[#E5CFCB] bg-[#FAF4F2] px-3 py-1.5 text-xs text-[#7A3E33]">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8C4A3E]" />
          <span>{audioError}</span>
        </div>
      )}
    </div>
  );
}
