"use client";

import React, { useState } from "react";
import { useAudio } from "@/context/AudioContext";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  Radio,
  Shuffle,
  Repeat,
  ListMusic,
} from "lucide-react";
import Image from "next/image";

function formatTime(seconds: number) {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export const PlayerBar: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    frequencyData,
    beatIntensity,
    autoplay,
    toggleAutoplay,
    togglePlay,
    seek,
    setVolume,
    playNext,
    playPrevious,
  } = useAudio();

  const [isLiked, setIsLiked] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(0.8);
  const [isLooping, setIsLooping] = useState(false);

  const toggleMute = () => {
    if (volume > 0) {
      setPreviousVolume(volume);
      setVolume(0);
    } else {
      setVolume(previousVolume || 0.8);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Soundwave heights curve for left (pink) and right (cyan)
  const leftCurve = [0.3, 0.5, 0.85, 0.65, 0.95, 0.7, 0.4];
  const rightCurve = [0.4, 0.7, 0.95, 0.65, 0.85, 0.5, 0.3];

  return (
    <div className="w-full">
      {/* ============================================================== */}
      {/* MOBILE & TABLET CARD VIEW (< 1024px) - Exact Match to Design   */}
      {/* ============================================================== */}
      <div className="block lg:hidden w-full max-w-[360px] mx-auto px-2 py-4">
        <div className="relative">
          {/* Concentric Neon Glow Halo Rings around card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full border border-fuchsia-500/25 pointer-events-none shadow-[0_0_60px_rgba(210,27,255,0.25)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full border border-cyan-400/20 pointer-events-none shadow-[0_0_70px_rgba(49,201,255,0.18)]" />

          {/* Main Frosted Glass Media Player Card */}
          <div className="relative rounded-[36px] p-5 sm:p-6 border border-white/20 bg-gradient-to-b from-white/[0.12] via-purple-950/20 to-black/80 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.4)] overflow-hidden">
            {/* Specular Inner Glass Bevel Highlight */}
            <div className="absolute inset-0 rounded-[36px] border border-white/10 pointer-events-none" />

            {/* Row 1: Left Pink Waves + Center Album Art + Right Cyan Waves */}
            <div className="flex items-center justify-between gap-2 mb-5 relative z-10">
              {/* Left Waveform (Pink / Fuchsia Bars) */}
              <div className="flex items-center gap-1 sm:gap-1.5 h-20 justify-center flex-1">
                {leftCurve.map((base, idx) => {
                  const dataIdx = idx * 2;
                  const val = isPlaying && frequencyData?.length > 0 ? (frequencyData[dataIdx] || 0) / 255 : 0;
                  const barH = isPlaying
                    ? Math.max(8, Math.min(52, val * 42 + beatIntensity * 12))
                    : Math.max(8, base * 40);
                  return (
                    <div
                      key={idx}
                      className="w-1 sm:w-1.5 rounded-full bg-gradient-to-t from-fuchsia-600 via-pink-500 to-pink-300 shadow-[0_0_10px_rgba(236,72,153,0.6)] transition-all duration-75"
                      style={{ height: `${barH}px` }}
                    />
                  );
                })}
              </div>

              {/* Center Album Art with Soft Bevel */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden relative shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(210,27,255,0.3)] border border-white/20 flex-shrink-0">
                <Image
                  src={currentSong?.coverUrl || "/Neon Beatora Headphone Logo.png"}
                  alt={currentSong?.title || "Beatora Track"}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10 pointer-events-none" />
              </div>

              {/* Right Waveform (Cyan / Blue Bars) */}
              <div className="flex items-center gap-1 sm:gap-1.5 h-20 justify-center flex-1">
                {rightCurve.map((base, idx) => {
                  const dataIdx = 14 + idx * 2;
                  const val = isPlaying && frequencyData?.length > 0 ? (frequencyData[dataIdx] || 0) / 255 : 0;
                  const barH = isPlaying
                    ? Math.max(8, Math.min(52, val * 42 + beatIntensity * 12))
                    : Math.max(8, base * 40);
                  return (
                    <div
                      key={idx}
                      className="w-1 sm:w-1.5 rounded-full bg-gradient-to-t from-blue-600 via-cyan-400 to-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.6)] transition-all duration-75"
                      style={{ height: `${barH}px` }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Row 2: Playlist Icon + Centered Song Title & Artist + Like Heart */}
            <div className="flex items-center justify-between gap-2 mb-4 relative z-10 px-1">
              <a
                href="#tracks-section"
                className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                title="Playlist"
              >
                <ListMusic className="w-5 h-5" />
              </a>

              <div className="min-w-0 flex-1 text-center px-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white tracking-wide truncate">
                  {currentSong?.title || "Midnight Pulse"}
                </h3>
                <p className="text-xs text-zinc-400 font-medium truncate mt-0.5">
                  {currentSong?.artist || "Beatora Originals"}
                </p>
              </div>

              <button
                onClick={() => setIsLiked(!isLiked)}
                className="p-1.5 text-zinc-400 hover:text-pink-400 transition-colors"
                title="Favorite"
              >
                <Heart
                  className={`w-5 h-5 transition-transform active:scale-125 ${
                    isLiked ? "fill-pink-500 text-pink-500" : ""
                  }`}
                />
              </button>
            </div>

            {/* Row 3: Sleek Timeline Scrub Bar with Glowing White Thumb */}
            <div className="mb-2 relative z-10 px-1">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={(e) => seek(parseFloat(e.target.value))}
                className="range-input !h-1.5 w-full cursor-pointer"
                style={{ "--progress": `${progressPercent}%` } as React.CSSProperties}
              />
              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono mt-1.5">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Row 4: Playback Transport Controls (Shuffle, Prev, Play/Pause, Next, Loop) */}
            <div className="flex items-center justify-between px-1 pt-1 mb-2 relative z-10">
              <button
                onClick={toggleAutoplay}
                className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-all ${
                  autoplay
                    ? "bg-fuchsia-500/20 border-fuchsia-500/60 text-fuchsia-300 shadow-[0_0_12px_rgba(210,27,255,0.4)]"
                    : "bg-white/[0.06] border-white/10 text-zinc-400 hover:text-white"
                }`}
                title={autoplay ? "Autoplay ON (Random Shuffle)" : "Autoplay OFF"}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={playPrevious}
                className="text-zinc-300 hover:text-white transition-colors p-2"
                title="Previous"
                disabled={!currentSong}
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              {/* Glowing Hero Play / Pause Circle Button */}
              <button
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 p-[2px] shadow-[0_0_28px_rgba(210,27,255,0.7),0_0_15px_rgba(56,189,248,0.5)] active:scale-95 transition-transform"
                title={isPlaying ? "Pause" : "Play"}
              >
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#771ff5] via-[#482fe0] to-[#1e6df5] flex items-center justify-center border border-white/40 shadow-inner">
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-white text-white" />
                  ) : (
                    <Play className="w-7 h-7 fill-white text-white ml-0.5" />
                  )}
                </div>
              </button>

              <button
                onClick={playNext}
                className="text-zinc-300 hover:text-white transition-colors p-2"
                title="Next"
                disabled={!currentSong}
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={() => setIsLooping(!isLooping)}
                className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-all ${
                  isLooping
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.4)]"
                    : "bg-white/[0.06] border-white/10 text-zinc-400 hover:text-white"
                }`}
                title="Repeat Track"
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            {/* Subtle Volume Slider Row */}
            <div className="flex items-center justify-center gap-3 pt-2 text-zinc-500 relative z-10">
              <button onClick={toggleMute} className="hover:text-white transition-colors">
                {volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="range-input !h-1 max-w-[120px]"
                style={{ "--progress": `${volume * 100}%` } as React.CSSProperties}
              />
              <span className="text-[10px] font-mono text-zinc-400">{Math.round(volume * 100)}%</span>
            </div>
          </div>

          {/* Explore Library Pill Button Beneath Card */}
          <a
            href="#tracks-section"
            className="w-full max-w-[260px] mx-auto mt-6 py-3 px-6 rounded-full border border-white/20 bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-blue-900/40 backdrop-blur-xl flex items-center justify-center gap-2 text-sm font-semibold text-white shadow-[0_0_22px_rgba(180,30,255,0.25)] hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(49,201,255,0.4)] transition-all"
          >
            <span>Explore Library</span>
            <span className="text-cyan-400 text-base leading-none">→</span>
          </a>
        </div>
      </div>

      {/* ============================================================== */}
      {/* DESKTOP BAR VIEW (For screen width >= 1024px)                  */}
      {/* ============================================================== */}
      <div
        className="player-card hidden lg:grid transition-all duration-150"
        style={{
          boxShadow: isPlaying
            ? `0 0 25px rgba(210, 27, 255, 0.25), 0 18px 60px rgba(0,0,0,0.8)`
            : undefined,
        }}
      >
        {/* Track Details */}
        <div className="track-details">
          <div className="album-art relative">
            <Image
              src={currentSong?.coverUrl || "/Neon Beatora Headphone Logo.png"}
              alt={currentSong?.title || "Beatora Logo"}
              fill
              sizes="59px"
              className="object-cover rounded-[14px]"
            />
            <span />
          </div>

          <div className="track-text">
            <strong>{currentSong?.title || "No song selected"}</strong>
            <span>{currentSong?.artist || "Select a track to start"}</span>
            <small>
              <span className={`mini-bars ${isPlaying ? "is-playing" : ""}`} />
              {currentSong?.category ? `${currentSong.category} • ` : ""}
              {isPlaying ? "PLAYING" : "READY"}
            </small>
          </div>

          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`like-track ${isLiked ? "is-liked" : ""}`}
            title="Like"
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-fuchsia-500 text-fuchsia-500" : ""}`} />
          </button>
        </div>

        {/* Transport Controls */}
        <div className="transport flex items-center justify-center gap-3">
          <button
            onClick={playPrevious}
            className="transport-button"
            title="Previous Track"
            disabled={!currentSong}
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            className="main-play"
            title={isPlaying ? "Pause" : "Play"}
            disabled={!currentSong}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-white text-white" />
            ) : (
              <Play className="w-6 h-6 fill-white text-white ml-1" />
            )}
          </button>

          <button
            onClick={playNext}
            className="transport-button"
            title="Next Track"
            disabled={!currentSong}
          >
            <SkipForward className="w-5 h-5" />
          </button>

          {/* Autoplay Random Toggle Button */}
          <div className="flex items-center gap-1.5 pl-3 ml-1 border-l border-white/20">
            <button
              onClick={toggleAutoplay}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all ${
                autoplay
                  ? "bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-white shadow-[0_0_12px_rgba(210,27,255,0.6)] border border-fuchsia-400/50"
                  : "bg-zinc-800/80 text-zinc-400 hover:text-white border border-zinc-700/60"
              }`}
              title={autoplay ? "Autoplay ON: Playing random music automatically" : "Autoplay OFF: Click to enable"}
            >
              <Shuffle className={`w-3 h-3 ${autoplay ? "text-cyan-200 animate-pulse" : "text-zinc-500"}`} />
              <span>AUTOPLAY</span>
              <span
                className={`w-2 h-2 rounded-full transition-all ${
                  autoplay ? "bg-cyan-300 shadow-[0_0_6px_#38bdf8]" : "bg-zinc-600"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Volume & Beat Visuals */}
        <div className="volume-box">
          <div className="flex items-center gap-2 mr-2">
            <Radio
              className={`w-4 h-4 ${
                isPlaying ? "text-cyan-400 animate-pulse" : "text-zinc-600"
              }`}
            />
            <span className="text-[10px] text-zinc-400 font-mono">
              BEAT: {Math.round(beatIntensity * 100)}%
            </span>
          </div>

          <button onClick={toggleMute} className="transport-button !p-1.5">
            {volume === 0 ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4 text-zinc-300" />}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="range-input volume-range"
            style={{ "--progress": `${volume * 100}%` } as React.CSSProperties}
          />
        </div>

        {/* Scrub Timeline */}
        <div className="timeline">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={(e) => seek(parseFloat(e.target.value))}
            className="range-input"
            style={{ "--progress": `${progressPercent}%` } as React.CSSProperties}
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};
