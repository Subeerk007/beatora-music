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
      {/* PURE CRYSTAL GLASS MEDIA PLAYER (Transparent & Ultra Refractive) */}
      {/* ============================================================== */}
      <div className="w-full max-w-[360px] sm:max-w-[400px] mx-auto px-2 py-4">
        <div className="relative">
          {/* Prismatic Neon Ambient Aura Behind Crystal */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[330px] sm:w-[370px] h-[330px] sm:h-[370px] rounded-full border border-fuchsia-500/30 pointer-events-none shadow-[0_0_80px_rgba(217,70,239,0.35)] blur-[2px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[370px] sm:w-[410px] h-[370px] sm:h-[410px] rounded-full border border-cyan-400/25 pointer-events-none shadow-[0_0_90px_rgba(6,182,212,0.3)] blur-[2px]" />

          {/* Master Crystal Glass Card */}
          <div
            className="relative rounded-[38px] p-5 sm:p-6 backdrop-blur-[26px] backdrop-saturate-[180%] border-[1.5px] border-white/30 border-t-white/60 border-l-pink-400/50 border-r-cyan-400/50 border-b-cyan-400/40 shadow-[0_25px_60px_rgba(0,0,0,0.5),inset_0_1.5px_2px_rgba(255,255,255,0.6),inset_0_-1.5px_2px_rgba(255,255,255,0.2),inset_10px_0_25px_rgba(217,70,239,0.15),inset_-10px_-10px_30px_rgba(6,182,212,0.2)] overflow-hidden transition-all duration-300"
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.05) 35%, rgba(18, 10, 36, 0.28) 75%, rgba(255, 255, 255, 0.1) 100%)",
            }}
          >
            {/* Diagonal Crystal Specular Light Flare */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/5 to-transparent pointer-events-none rounded-[38px]" />
            <div className="absolute -top-10 -left-10 w-36 h-36 bg-white/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-cyan-400/15 rounded-full blur-2xl pointer-events-none" />

            {/* Specular Inner Glass Bevel Highlight */}
            <div className="absolute inset-[1px] rounded-[37px] border border-white/20 pointer-events-none" />

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
                      className="w-1 sm:w-1.5 rounded-full bg-gradient-to-t from-fuchsia-600 via-pink-500 to-pink-300 shadow-[0_0_12px_rgba(244,63,94,0.7)] transition-all duration-75"
                      style={{ height: `${barH}px` }}
                    />
                  );
                })}
              </div>

              {/* Center Music Icon / Logo inside Crystal Frame */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden relative shadow-[0_12px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(217,70,239,0.3)] border border-white/40 flex-shrink-0 backdrop-blur-md bg-white/[0.04]">
                <Image
                  src={currentSong?.coverUrl || "/Neon Beatora Headphone Logo.png"}
                  alt={currentSong?.title || "Beatora Track"}
                  fill
                  className="object-contain p-2 drop-shadow-[0_0_12px_rgba(217,70,239,0.4)]"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/25 pointer-events-none" />
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
                      className="w-1 sm:w-1.5 rounded-full bg-gradient-to-t from-blue-600 via-cyan-400 to-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.7)] transition-all duration-75"
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
                className="p-1.5 text-white/80 hover:text-white transition-colors"
                title="Playlist"
              >
                <ListMusic className="w-5 h-5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />
              </a>

              <div className="min-w-0 flex-1 text-center px-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white tracking-wide truncate drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                  {currentSong?.title || "Midnight Pulse"}
                </h3>
                <p className="text-xs text-white/70 font-medium truncate mt-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
                  {currentSong?.artist || "Beatora Originals"}
                </p>
              </div>

              <button
                onClick={() => setIsLiked(!isLiked)}
                className="p-1.5 text-white/80 hover:text-pink-400 transition-colors"
                title="Favorite"
              >
                <Heart
                  className={`w-5 h-5 transition-transform active:scale-125 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] ${
                    isLiked ? "fill-pink-500 text-pink-500" : ""
                  }`}
                />
              </button>
            </div>

            {/* Row 3: Crystal Glass Timeline Scrub Bar with Glowing Pearl Knob */}
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
              <div className="flex items-center justify-between text-[11px] text-white/75 font-mono mt-1.5 drop-shadow-sm">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Row 4: Playback Transport Controls (Crystal Frosted Buttons) */}
            <div className="flex items-center justify-between px-1 pt-1 mb-2 relative z-10">
              <button
                onClick={toggleAutoplay}
                className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-all ${
                  autoplay
                    ? "bg-fuchsia-500/25 border-fuchsia-400/80 text-white shadow-[0_0_15px_rgba(217,70,239,0.5)]"
                    : "bg-white/[0.08] border-white/25 text-white/80 hover:text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]"
                }`}
                title={autoplay ? "Autoplay ON (Random Shuffle)" : "Autoplay OFF"}
              >
                <Shuffle className="w-4 h-4 drop-shadow-sm" />
              </button>

              <button
                onClick={playPrevious}
                className="text-white/90 hover:text-white transition-colors p-2"
                title="Previous"
                disabled={!currentSong}
              >
                <SkipBack className="w-5 h-5 fill-current drop-shadow-md" />
              </button>

              {/* Glowing Prismatic Hero Play / Pause Button */}
              <button
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 p-[2px] shadow-[0_0_30px_rgba(217,70,239,0.8),0_0_18px_rgba(6,182,212,0.6)] active:scale-95 transition-transform"
                title={isPlaying ? "Pause" : "Play"}
              >
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#8022f7] via-[#5225e6] to-[#2563eb] flex items-center justify-center border border-white/50 shadow-inner">
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-white text-white drop-shadow-md" />
                  ) : (
                    <Play className="w-7 h-7 fill-white text-white ml-0.5 drop-shadow-md" />
                  )}
                </div>
              </button>

              <button
                onClick={playNext}
                className="text-white/90 hover:text-white transition-colors p-2"
                title="Next"
                disabled={!currentSong}
              >
                <SkipForward className="w-5 h-5 fill-current drop-shadow-md" />
              </button>

              <button
                onClick={() => setIsLooping(!isLooping)}
                className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-all ${
                  isLooping
                    ? "bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                    : "bg-white/[0.08] border-white/25 text-white/80 hover:text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]"
                }`}
                title="Repeat Track"
              >
                <Repeat className="w-4 h-4 drop-shadow-sm" />
              </button>
            </div>

            {/* Row 5: Sleek Crystal Volume Slider Row */}
            <div className="flex items-center justify-center gap-3 pt-2 text-white/80 relative z-10">
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
              <span className="text-[10px] font-mono text-white/80">{Math.round(volume * 100)}%</span>
            </div>
          </div>

          {/* Explore Library Pill Button Beneath Card */}
          <a
            href="#tracks-section"
            className="w-full max-w-[260px] mx-auto mt-6 py-3 px-6 rounded-full border-[1.5px] border-white/30 bg-white/[0.08] backdrop-blur-[24px] flex items-center justify-center gap-2 text-sm font-semibold text-white shadow-[0_0_25px_rgba(217,70,239,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all"
          >
            <span>Explore Library</span>
            <span className="text-cyan-400 text-base leading-none">→</span>
          </a>
        </div>
      </div>
    </div>
  );
};
