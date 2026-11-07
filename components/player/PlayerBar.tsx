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
  Music,
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
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export const PlayerBar: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
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

  return (
    <div className="w-full">
      {/* ============================================================== */}
      {/* MOBILE CARD VIEW (Matches User Uploaded Reference Screenshot)  */}
      {/* ============================================================== */}
      <div className="block md:hidden w-full max-w-sm mx-auto">
        <div
          className="relative overflow-hidden rounded-[32px] p-5 border border-fuchsia-500/40 bg-gradient-to-b from-[#180a30]/95 via-[#0c0924]/95 to-[#08081a]/95 backdrop-blur-2xl shadow-[0_0_35px_rgba(180,30,255,0.25)] transition-all duration-150"
          style={{
            boxShadow: isPlaying
              ? `0 0 ${25 + beatIntensity * 30}px rgba(210, 27, 255, ${0.25 + beatIntensity * 0.3}), 0 15px 45px rgba(0,0,0,0.85)`
              : undefined,
            transform: isPlaying ? `scale(${1 + beatIntensity * 0.015})` : "none",
          }}
        >
          {/* Subtle outer neon stroke glow */}
          <div className="absolute inset-0 rounded-[32px] pointer-events-none border border-cyan-400/20" />

          {/* Row 1: Track Info + Cover + Like & Playlist Buttons */}
          <div className="flex items-center justify-between gap-3 relative z-10 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-14 h-14 rounded-2xl relative overflow-hidden bg-zinc-900 border border-fuchsia-500/40 shadow-[0_0_15px_rgba(210,27,255,0.35)] flex-shrink-0">
                <Image
                  src={currentSong?.coverUrl || "/Neon Beatora Headphone Logo.png"}
                  alt={currentSong?.title || "Beatora Logo"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-base text-white tracking-tight truncate">
                    {currentSong?.title || "gemini"}
                  </h3>
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className="text-zinc-400 hover:text-pink-400 transition-colors"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isLiked ? "fill-pink-500 text-pink-500" : ""
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-zinc-400 truncate mt-0.5">
                  {currentSong?.category || "Hip-Hop"} •{" "}
                  <span className="text-zinc-300 font-medium">
                    {isPlaying ? "PLAYING" : "READY"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-zinc-400 flex-shrink-0">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="p-1 hover:text-white transition-colors"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isLiked ? "fill-pink-500 text-pink-500" : ""
                  }`}
                />
              </button>
              <a
                href="#tracks-section"
                className="p-1 hover:text-white transition-colors"
                title="View Playlist"
              >
                <ListMusic className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Row 2: Controls (Shuffle, Prev, Play/Pause, Next, Loop) */}
          <div className="flex items-center justify-between px-2 mb-4 relative z-10">
            <button
              onClick={playNext}
              className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-fuchsia-500/50 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={playPrevious}
              className="text-zinc-300 hover:text-white transition-colors"
              title="Previous"
              disabled={!currentSong}
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            {/* Glowing Main Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-gradient-to-tr from-fuchsia-600 via-purple-500 to-cyan-400 p-[2px] shadow-[0_0_24px_rgba(210,27,255,0.7)] hover:shadow-[0_0_35px_rgba(210,27,255,0.9)] active:scale-95 transition-all"
              style={{
                transform: isPlaying
                  ? `scale(${1 + beatIntensity * 0.12})`
                  : "scale(1)",
              }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-fuchsia-600 to-indigo-600 flex items-center justify-center border border-white/40">
                {isPlaying ? (
                  <Pause className="w-7 h-7 fill-white text-white" />
                ) : (
                  <Play className="w-7 h-7 fill-white text-white ml-1" />
                )}
              </div>
            </button>

            <button
              onClick={playNext}
              className="text-zinc-300 hover:text-white transition-colors"
              title="Next"
              disabled={!currentSong}
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition-all ${
                isLooping
                  ? "bg-fuchsia-600/30 border-fuchsia-500 text-fuchsia-300"
                  : "bg-white/[0.04] border-white/10 text-zinc-400 hover:text-white"
              }`}
              title="Repeat"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Row 3: Autoplay Capsule Pill with Toggle Switch */}
          <div className="flex justify-center mb-4 relative z-10">
            <button
              onClick={toggleAutoplay}
              className="w-full max-w-[240px] flex items-center justify-between px-4 py-2 rounded-full border border-fuchsia-500/50 bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-cyan-900/50 shadow-[0_0_18px_rgba(210,27,255,0.35)] transition-all"
            >
              <div className="flex items-center gap-2">
                <Play className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-white">
                  AUTOPLAY
                </span>
              </div>

              {/* iOS-Style Toggle Switch */}
              <div
                className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                  autoplay ? "bg-cyan-500 shadow-[0_0_10px_#06b6d4]" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                    autoplay ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Row 4: Beat Intensity Indicator & Volume Slider */}
          <div className="flex items-center justify-between gap-3 text-xs text-zinc-400 mb-3 px-1 relative z-10">
            <div className="flex items-center gap-1.5 text-fuchsia-400 flex-shrink-0">
              <Radio className="w-4 h-4 text-fuchsia-400 animate-pulse" />
              <span className="text-[11px] font-bold tracking-wider text-white">
                BEAT: {Math.round(beatIntensity * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-2 flex-1 max-w-[190px]">
              <button onClick={toggleMute} className="text-zinc-400 hover:text-white">
                {volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="range-input !h-1.5 flex-1"
                style={{ "--progress": `${volume * 100}%` } as React.CSSProperties}
              />
              <Volume2 className="w-4 h-4 text-zinc-500" />
            </div>
          </div>

          {/* Row 5: Timeline Scrub Bar with Times */}
          <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono px-1 relative z-10">
            <span className="w-8 text-left">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="range-input !h-2 flex-1"
              style={{ "--progress": `${progressPercent}%` } as React.CSSProperties}
            />
            <span className="w-8 text-right">{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* DESKTOP BAR VIEW (Unchanged for Larger Screens)                 */}
      {/* ============================================================== */}
      <div
        className="player-card hidden md:grid transition-all duration-150"
        style={{
          boxShadow: isPlaying
            ? `0 0 ${20 + beatIntensity * 25}px rgba(210, 27, 255, ${0.2 + beatIntensity * 0.3}), 0 18px 60px rgba(0,0,0,0.8)`
            : undefined,
          transform: isPlaying ? `scale(${1 + beatIntensity * 0.012})` : "none",
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
            <span
              style={{
                animationDuration: isPlaying ? `${Math.max(2, 6 - beatIntensity * 3)}s` : "9s",
              }}
            />
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
        <div className="transport flex items-center justify-center gap-3 md:gap-4">
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
            style={{
              transform: isPlaying ? `scale(${1 + beatIntensity * 0.1})` : "scale(1)",
            }}
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
          <div className="flex items-center gap-1.5 pl-2 ml-1 border-l border-white/20">
            <button
              onClick={toggleAutoplay}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all ${
                autoplay
                  ? "bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-white shadow-[0_0_12px_rgba(210,27,255,0.6)] border border-fuchsia-400/50"
                  : "bg-zinc-800/80 text-zinc-400 hover:text-white border border-zinc-700/60"
              }`}
              title={autoplay ? "Autoplay ON: Playing random music automatically" : "Autoplay OFF: Click to enable"}
            >
              <Shuffle className={`w-3 h-3 ${autoplay ? "text-cyan-200 animate-pulse" : "text-zinc-500"}`} />
              <span>AUTOPLAY</span>
              {/* Neon Toggle indicator pill */}
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

          <button onClick={toggleMute} className="transport-button !p-1 text-zinc-300">
            {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
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

        {/* Timeline Scrub Bar */}
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
