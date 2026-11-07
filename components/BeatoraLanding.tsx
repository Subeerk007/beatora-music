"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Play,
  Pause,
  Headphones,
  Sparkles,
  Flame,
  Radio,
  Search,
  SlidersHorizontal,
  Compass,
  Disc3,
} from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import { VisualizerCanvas } from "@/components/player/VisualizerCanvas";
import { PlayerBar } from "@/components/player/PlayerBar";
import { CircularLoader } from "@/components/ui/CircularLoader";
import { ISong } from "@/types/song";

const CATEGORIES = ["All", "Electronic", "Cyberpunk", "Lo-Fi", "Synthwave", "Bass Boosted", "Hip-Hop"];

export default function BeatoraLanding() {
  const { currentSong, isPlaying, playSong, togglePlay, beatIntensity } = useAudio();
  const [songs, setSongs] = useState<ISong[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch songs
  useEffect(() => {
    const fetchPortalSongs = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (selectedCategory !== "All") queryParams.set("category", selectedCategory);
        if (searchQuery) queryParams.set("q", searchQuery);

        const res = await fetch(`/api/songs?${queryParams.toString()}`);
        const data = await res.json();
        if (data.songs) {
          setSongs(data.songs);
        }
      } catch (err) {
        console.error("Failed to load tracks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortalSongs();
  }, [selectedCategory, searchQuery]);

  return (
    <div className="beatora-page min-h-screen pb-32">
      {/* Dynamic Ambient Glows that react to audio beat */}
      <div
        className="ambient ambient-pink transition-transform duration-100"
        style={{
          transform: isPlaying ? `scale(${1 + beatIntensity * 0.4}) translate(${beatIntensity * 10}px)` : "none",
        }}
      />
      <div
        className="ambient ambient-blue transition-transform duration-100"
        style={{
          transform: isPlaying ? `scale(${1 + beatIntensity * 0.5}) translate(-${beatIntensity * 15}px)` : "none",
        }}
      />

      {/* Top Navigation */}
      <header className="topbar justify-center !h-32">
        <Link href="/" className="flex items-center justify-center py-2" aria-label="Beatora home">
          <Image
            src="/Neon Beatora Headphone Logo.png"
            alt="Beatora Logo"
            width={170}
            height={170}
            className="w-36 md:w-44 h-auto object-contain transition-transform duration-150 drop-shadow-[0_0_25px_rgba(210,27,255,0.7)]"
            style={{
              transform: isPlaying ? `scale(${1 + beatIntensity * 0.15})` : "none",
            }}
            priority
          />
        </Link>
      </header>

      {/* Hero Section */}
      <main className="hero">
        <div className="hero-content max-w-2xl">
          <div className="eyebrow">
            <span />
            NEXT-GEN SOUND EXPERIENCE
          </div>
          <h1>
            FEEL THE BEAT. <br />
            <span>HEAR THE FUTURE.</span>
          </h1>
          <p>
            Immerse yourself into dynamic AI-composed beats with our reactive,
            frequency-synchronized beat-jumping music engine.
          </p>

          <div className="hero-actions">
            {songs.length > 0 ? (
              <button
                onClick={() => {
                  if (currentSong) {
                    togglePlay();
                  } else {
                    playSong(songs[0], songs);
                  }
                }}
                className="listen-button"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                {isPlaying ? "PAUSE BEAT" : "START LISTENING"}
              </button>
            ) : (
              <Link href="/admin/dashboard" className="listen-button">
                UPLOAD FIRST TRACK
              </Link>
            )}

            <a href="#tracks-section" className="explore-button">
              Explore Library <span>→</span>
            </a>
          </div>

          <div className="hero-caption">
            <Radio className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>REAL-TIME FREQUENCY VISUALIZATION & BASS DETECTOR</span>
          </div>
        </div>

        {/* Hero Interactive Beat Graphic */}
        <div className="hero-graphic">
          <div
            className="graphic-ring ring-a"
            style={{
              transform: isPlaying ? `scale(${1 + beatIntensity * 0.2})` : "none",
              borderColor: isPlaying ? `rgba(210, 27, 255, ${0.4 + beatIntensity * 0.6})` : undefined,
            }}
          />
          <div
            className="graphic-ring ring-b"
            style={{
              transform: isPlaying ? `scale(${1 + beatIntensity * 0.3})` : "none",
              borderColor: isPlaying ? `rgba(46, 216, 255, ${0.4 + beatIntensity * 0.6})` : undefined,
            }}
          />
          <div
            className="graphic-core relative"
            style={{
              transform: isPlaying ? `scale(${1 + beatIntensity * 0.25})` : "none",
              boxShadow: isPlaying ? `0 0 ${40 + beatIntensity * 50}px #a52aff` : undefined,
            }}
          >
            <Disc3 className={`w-14 h-14 ${isPlaying ? "animate-spin" : ""}`} />
          </div>
          <div className="orbit-dot dot-a" />
          <div className="orbit-dot dot-b" />
          <div className="orbit-dot dot-c" />
          <div className="graphic-label">
            {isPlaying ? `BEAT INTENSITY: ${Math.round(beatIntensity * 100)}%` : "READY TO PULSE"}
          </div>
        </div>
      </main>

      {/* Visualizer & Audio Player Section */}
      <section id="visualizer-section" className="music-area mt-4">
        <div className="visualizer-wrap">
          <div className="visualizer-meta">
            <span className={`live-indicator ${isPlaying ? "live" : ""}`} />
            <span>FREQUENCY ANALYZER</span>
            <span className="meta-right">
              {isPlaying ? `${Math.round(beatIntensity * 100)}% BEAT JUMP` : "IDLE"}
            </span>
          </div>

          <VisualizerCanvas />
          <div className="visualizer-baseline" />
        </div>

        {/* Dedicated Main Player Bar */}
        <PlayerBar />
      </section>

      {/* Tracks Browser & Explorer */}
      <section id="tracks-section" className="max-w-[1320px] mx-auto px-6 md:px-12 mt-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="section-label flex items-center gap-2 text-xs tracking-widest text-zinc-400 font-bold uppercase">
              <Compass className="w-4 h-4 text-cyan-400" /> Track Selection
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
              Curated <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">Audio Wave</span>
            </h2>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search artist or title..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-900/80 border border-zinc-800 rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500 transition-colors"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto py-4 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-fuchsia-600 to-cyan-600 text-white shadow-lg shadow-fuchsia-600/30"
                  : "bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Songs Grid */}
        {loading ? (
          <div className="py-24 flex items-center justify-center">
            <CircularLoader size="lg" text="Syncing Audio Library..." />
          </div>
        ) : songs.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl p-8">
            <Disc3 className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-1">No songs in library</h3>
            <p className="text-zinc-500 text-xs mb-4">
              Sign in as admin to upload your favorite tracks!
            </p>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-fuchsia-600 to-purple-600 shadow-lg shadow-fuchsia-600/30 hover:opacity-95"
            >
              Admin Upload Portal
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
            {songs.map((song) => {
              const isThisPlaying = currentSong?._id === song._id && isPlaying;
              return (
                <div
                  key={song._id}
                  onClick={() => playSong(song, songs)}
                  className={`group relative p-4 rounded-2xl border transition-all cursor-pointer backdrop-blur-md ${
                    isThisPlaying
                      ? "bg-fuchsia-950/30 border-fuchsia-500/80 shadow-lg shadow-fuchsia-950/60"
                      : "bg-zinc-900/40 border-zinc-800/80 hover:border-fuchsia-500/40 hover:bg-zinc-900/70"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0 group-hover:scale-105 transition-transform">
                      {song.coverUrl ? (
                        <Image
                          src={song.coverUrl}
                          alt={song.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Headphones className="w-6 h-6 text-zinc-500 m-auto" />
                      )}
                      <div
                        className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                          isThisPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        {isThisPlaying ? (
                          <Pause className="w-6 h-6 fill-fuchsia-400 text-fuchsia-400" />
                        ) : (
                          <Play className="w-6 h-6 fill-white text-white ml-0.5" />
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 block mb-0.5">
                        {song.category || "Track"}
                      </span>
                      <h4 className="font-bold text-sm text-white truncate group-hover:text-fuchsia-300 transition-colors">
                        {song.title}
                      </h4>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">{song.artist}</p>
                    </div>

                    {isThisPlaying && (
                      <div className="flex items-end gap-0.5 h-4 flex-shrink-0">
                        <span className="w-1 bg-cyan-400 h-full animate-pulse" />
                        <span className="w-1 bg-fuchsia-400 h-3 animate-pulse delay-75" />
                        <span className="w-1 bg-pink-400 h-2 animate-pulse delay-150" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="footer mt-16">
        <div>BEATORA MUSIC SOUND SYSTEM © 2026</div>
        <span>BUILT WITH NEXT.JS, WEB AUDIO & MONGO DB</span>
      </footer>
    </div>
  );
}
