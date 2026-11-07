"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { ISong } from "@/types/song";

interface AudioContextType {
  currentSong: ISong | null;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  queue: ISong[];
  frequencyData: Uint8Array;
  beatIntensity: number;
  autoplay: boolean;
  toggleAutoplay: () => void;
  playSong: (song: ISong, newQueue?: ISong[]) => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  setQueue: (songs: ISong[]) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<ISong | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.8);
  const [queue, setQueue] = useState<ISong[]>([]);
  const [beatIntensity, setBeatIntensity] = useState<number>(0);
  const [frequencyData, setFrequencyData] = useState<Uint8Array>(new Uint8Array(32));
  const [autoplay, setAutoplay] = useState<boolean>(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const queueRef = useRef<ISong[]>(queue);
  queueRef.current = queue;

  const currentSongRef = useRef<ISong | null>(currentSong);
  currentSongRef.current = currentSong;

  const autoplayRef = useRef<boolean>(autoplay);
  autoplayRef.current = autoplay;

  // Initialize persistent Audio element on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Reuse or create audio element
    let audio = audioRef.current;
    if (!audio) {
      audio = new Audio();
      audio.crossOrigin = "anonymous";
      audio.volume = volume;
      audioRef.current = audio;
    }

    const onLoadedMetadata = () => {
      setDuration(audio?.duration || 0);
    };

    const onTimeUpdate = () => {
      if (audio) setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      if (autoplayRef.current) {
        playRandomOrNext();
      } else {
        setIsPlaying(false);
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio?.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio?.removeEventListener("timeupdate", onTimeUpdate);
      audio?.removeEventListener("ended", onEnded);
      audio?.removeEventListener("play", onPlay);
      audio?.removeEventListener("pause", onPause);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Safe Web Audio Context setup (Never recreate source node for same element)
  const setupWebAudio = () => {
    if (typeof window === "undefined" || !audioRef.current) return;

    try {
      if (!audioContextRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;

        const ctx = new AudioCtx();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.5;

        // Ensure createMediaElementSource is only called ONCE
        if (!sourceNodeRef.current) {
          const source = ctx.createMediaElementSource(audioRef.current);
          source.connect(analyser);
          analyser.connect(ctx.destination);
          sourceNodeRef.current = source;
        }

        audioContextRef.current = ctx;
        analyserRef.current = analyser;
      }

      if (audioContextRef.current && audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume().catch(() => {});
      }
    } catch (err) {
      console.warn("Web Audio non-critical notice:", err);
    }
  };

  // Beat analyzer animation loop
  useEffect(() => {
    const updateFrequencies = () => {
      if (analyserRef.current && isPlaying) {
        try {
          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyserRef.current.getByteFrequencyData(dataArray);
          setFrequencyData(dataArray);

          let bassSum = 0;
          const bassBins = Math.min(8, bufferLength);
          for (let i = 0; i < bassBins; i++) {
            bassSum += dataArray[i];
          }
          const avgBass = bassSum / (bassBins * 255);
          setBeatIntensity(Math.min(1, Math.max(0, (avgBass - 0.15) * 1.6)));
        } catch {
          // Ignore
        }
      } else if (!isPlaying) {
        setBeatIntensity((prev) => Math.max(0, prev * 0.9));
      }
      animationFrameRef.current = requestAnimationFrame(updateFrequencies);
    };

    animationFrameRef.current = requestAnimationFrame(updateFrequencies);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  const playSong = async (song: ISong, newQueue?: ISong[]) => {
    if (!audioRef.current) return;

    setupWebAudio();

    if (newQueue) {
      setQueue(newQueue);
    }

    setCurrentSong(song);
    audioRef.current.src = song.audioUrl;

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      // User gesture might be needed on mobile
    }
  };

  const togglePlay = async () => {
    if (!audioRef.current || !currentSong) return;

    setupWebAudio();

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      try {
        await audioRef.current.play();
      } catch {
        // Ignore
      }
    }
  };

  const seek = (seconds: number) => {
    if (!audioRef.current) return;
    try {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    } catch {
      // Ignore
    }
  };

  const setVolume = (val: number) => {
    const clamped = Math.min(1, Math.max(0, val));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  };

  const playRandomOrNext = () => {
    const q = queueRef.current;
    const curr = currentSongRef.current;
    if (q.length === 0) return;

    if (q.length === 1) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      return;
    }

    const remaining = q.filter((s) => s._id !== curr?._id && s.audioUrl !== curr?.audioUrl);
    if (remaining.length > 0) {
      const randomIndex = Math.floor(Math.random() * remaining.length);
      playSong(remaining[randomIndex]);
    } else {
      playSong(q[0]);
    }
  };

  const playNext = () => {
    if (autoplayRef.current) {
      playRandomOrNext();
      return;
    }

    const q = queue;
    if (!currentSong || q.length === 0) return;
    const currentIndex = q.findIndex((s) => s._id === currentSong._id || s.audioUrl === currentSong.audioUrl);
    if (currentIndex !== -1 && currentIndex < q.length - 1) {
      playSong(q[currentIndex + 1]);
    } else if (q.length > 0) {
      playSong(q[0]);
    }
  };

  const playPrevious = () => {
    if (!audioRef.current || !currentSong || queue.length === 0) return;

    if (audioRef.current.currentTime > 3) {
      seek(0);
      return;
    }

    const currentIndex = queue.findIndex((s) => s._id === currentSong._id || s.audioUrl === currentSong.audioUrl);
    if (currentIndex > 0) {
      playSong(queue[currentIndex - 1]);
    } else {
      seek(0);
    }
  };

  const toggleAutoplay = () => {
    setAutoplay((prev) => !prev);
  };

  return (
    <AudioContext.Provider
      value={{
        currentSong,
        isPlaying,
        duration,
        currentTime,
        volume,
        queue,
        frequencyData,
        beatIntensity,
        autoplay,
        toggleAutoplay,
        playSong,
        togglePlay,
        seek,
        setVolume,
        playNext,
        playPrevious,
        setQueue,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};
