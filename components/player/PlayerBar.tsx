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
      <div
        className="player-card transition-all duration-150"
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
            {currentSong?.coverUrl ? (
              <Image
                src={currentSong.coverUrl}
                alt={currentSong.title || "Track"}
                fill
                sizes="59px"
                className="object-cover rounded-[14px]"
              />
            ) : (
              <Music className="w-6 h-6 text-fuchsia-400" />
            )}
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
