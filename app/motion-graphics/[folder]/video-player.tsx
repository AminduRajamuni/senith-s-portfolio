"use client";

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import type { VideoSummary } from "@/lib/cloudinary";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export default function VideoPlayer({
  video,
  hasMultiple,
  onClose,
  onNext,
  onPrev,
}: {
  video: VideoSummary;
  hasMultiple: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  // Transport state naturally resets per video because the parent renders
  // this component with `key={video.publicId}` — switching videos remounts
  // it fresh rather than needing an effect to reset state on prop change.
  // The `autoPlay` attribute on the <video> below starts playback.
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && hasMultiple) onNext();
      else if (e.key === "ArrowLeft" && hasMultiple) onPrev();
      else if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, onNext, onPrev, hasMultiple]);

  function togglePlay() {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => {});
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const el = videoRef.current;
    if (!el || !duration) return;
    const time = (Number(e.target.value) / 100) * duration;
    el.currentTime = time;
    setCurrentTime(time);
  }

  // Prevent the seek slider from also triggering the play/pause spacebar
  // handler above while it's focused.
  function stopKeyPropagation(e: ReactKeyboardEvent) {
    if (e.key === " ") e.stopPropagation();
  }

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="player-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
    >
      <div className="player-backdrop" onClick={onClose} aria-hidden="true" />

      <button
        type="button"
        className="player-close"
        onClick={onClose}
        aria-label="Close"
      >
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path
            d="M6 6 L18 18 M18 6 L6 18"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {hasMultiple ? (
        <button
          type="button"
          className="player-nav player-nav-prev"
          onClick={onPrev}
          aria-label="Previous video"
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              d="M15 5 L8 12 L15 19"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : null}

      <div className="player-stage">
        <div className="player-video-wrap">
          <video
            ref={videoRef}
            className="player-video"
            src={video.url}
            autoPlay
            playsInline
            onClick={togglePlay}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onEnded={hasMultiple ? onNext : () => setPlaying(false)}
          />

          <div className="player-controls">
            <button
              type="button"
              className="player-play"
              onClick={togglePlay}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? (
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <rect x="5" y="4" width="5" height="16" rx="1.5" fill="currentColor" />
                  <rect x="14" y="4" width="5" height="16" rx="1.5" fill="currentColor" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path d="M7 4 L20 12 L7 20 Z" fill="currentColor" />
                </svg>
              )}
            </button>

            <span className="player-time">{formatTime(currentTime)}</span>
            <input
              type="range"
              className="player-slider"
              min={0}
              max={100}
              step={0.1}
              value={progress}
              onChange={handleSeek}
              onKeyDown={stopKeyPropagation}
              aria-label="Seek"
            />
            <span className="player-time">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="player-details">
          <h2 className="player-title">{video.title}</h2>
          {video.description ? (
            <p className="player-description">{video.description}</p>
          ) : null}
        </div>
      </div>

      {hasMultiple ? (
        <button
          type="button"
          className="player-nav player-nav-next"
          onClick={onNext}
          aria-label="Next video"
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              d="M9 5 L16 12 L9 19"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
