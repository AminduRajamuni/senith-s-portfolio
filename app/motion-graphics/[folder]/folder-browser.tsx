"use client";

import { useCallback, useEffect, useState } from "react";
import type { VideoSummary } from "@/lib/cloudinary";
import VideoPlayer from "./video-player";

export default function FolderBrowser({
  folder,
  videos,
}: {
  folder: string;
  videos: VideoSummary[];
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);
  const next = useCallback(() => {
    setActiveIndex((i) => (i === null ? null : (i + 1) % videos.length));
  }, [videos.length]);
  const prev = useCallback(() => {
    setActiveIndex((i) =>
      i === null ? null : (i - 1 + videos.length) % videos.length
    );
  }, [videos.length]);

  // Lock page scroll while the reel player is open.
  useEffect(() => {
    if (activeIndex === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [activeIndex]);

  return (
    <>
      <div className="motion-inner mac-content">
        {videos.length === 0 ? (
          <p className="motion-empty">No videos in this folder yet.</p>
        ) : (
          <div className="motion-grid" aria-label={`${folder} videos`}>
            {videos.map((video, i) => (
              <button
                type="button"
                className="motion-folder video-tile"
                key={video.publicId}
                onClick={() => setActiveIndex(i)}
              >
                <span className="video-tile-thumb">
                  <img
                    className="motion-folder-icon video-tile-icon"
                    src={video.thumbnailUrl}
                    alt=""
                    draggable={false}
                  />
                  <span className="video-tile-play" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path d="M8 5 L19 12 L8 19 Z" fill="currentColor" />
                    </svg>
                  </span>
                </span>
                <span className="motion-folder-title">{video.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {activeIndex !== null ? (
        <VideoPlayer
          // Remounts the player fresh per video — its transport state
          // (playing/currentTime/duration) resets for free rather than
          // needing an effect to reset state on a prop change.
          key={videos[activeIndex].publicId}
          video={videos[activeIndex]}
          hasMultiple={videos.length > 1}
          onClose={close}
          onNext={next}
          onPrev={prev}
        />
      ) : null}
    </>
  );
}
