"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  Music,
  Trash2,
  LogOut,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  FileAudio,
  Image as ImageIcon,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { ISong } from "@/types/song";
import { CircularLoader } from "@/components/ui/CircularLoader";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [songs, setSongs] = useState<ISong[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(true);
  const [activePreview, setActivePreview] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [category, setCategory] = useState("Electronic");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchSongs = async () => {
    try {
      const res = await fetch("/api/songs");
      const data = await res.json();
      if (data.songs) {
        setSongs(data.songs);
      }
    } catch {
      // Ignore
    } finally {
      setLoadingSongs(false);
    }
  };

  useEffect(() => {
    // Check authentication
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) router.push("/admin/login");
      })
      .catch(() => router.push("/admin/login"));

    fetchSongs();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) {
      setStatusMsg({ type: "error", text: "Please select an audio file (MP3/WAV)" });
      return;
    }

    setUploading(true);
    setStatusMsg(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("artist", artist);
    formData.append("category", category);
    formData.append("audio", audioFile);
    if (coverFile) {
      formData.append("cover", coverFile);
    }

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setStatusMsg({ type: "success", text: "Music successfully uploaded and published!" });
      setTitle("");
      setArtist("");
      setAudioFile(null);
      setCoverFile(null);
      fetchSongs();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload song";
      setStatusMsg({ type: "error", text: msg });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id || !confirm("Are you sure you want to delete this track?")) return;

    try {
      const res = await fetch(`/api/songs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSongs((prev) => prev.filter((s) => s._id !== id));
      } else {
        const data = await res.json().catch(() => null);
        alert(data?.error || "Failed to delete track");
      }
    } catch (err) {
      alert("Error deleting track: " + err);
    }
  };

  const togglePreview = (audioUrl: string) => {
    if (activePreview === audioUrl) {
      previewAudioRef.current?.pause();
      setActivePreview(null);
    } else {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      previewAudioRef.current = audio;
      audio.play();
      audio.onended = () => setActivePreview(null);
      setActivePreview(audioUrl);
    }
  };

  return (
    <div className="beatora-page min-h-screen text-zinc-100 p-6 md:p-12 relative">
      <div className="ambient ambient-pink" />
      <div className="ambient ambient-blue" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Top Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 mb-8 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors"
                title="Back to portal"
              >
                <ArrowLeft className="w-5 h-5" />
              </a>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">Music Studio</span>
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1 pl-11">
              Upload and manage your tracks directly to MongoDB & server storage.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> admin@gmail.com
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-xs rounded-xl bg-zinc-900 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Upload Form Box */}
          <div className="lg:col-span-5 bg-zinc-900/60 border border-fuchsia-500/20 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-xl">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-white">
              <UploadCloud className="w-5 h-5 text-fuchsia-400" /> Upload New Track
            </h2>

            {statusMsg && (
              <div
                className={`mb-6 p-4 rounded-xl text-xs flex items-center gap-2.5 ${
                  statusMsg.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                    : "bg-red-500/10 border border-red-500/30 text-red-400"
                }`}
              >
                {statusMsg.type === "success" ? (
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{statusMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Song Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cyberpunk Pulse"
                  className="w-full px-4 py-2.5 bg-zinc-950/70 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-fuchsia-500 transition-all placeholder-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Artist / Producer
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="e.g. Neon Horizon"
                  className="w-full px-4 py-2.5 bg-zinc-950/70 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-fuchsia-500 transition-all placeholder-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Category / Genre
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-950/70 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-fuchsia-500 transition-all"
                >
                  <option value="Electronic">Electronic</option>
                  <option value="Cyberpunk">Cyberpunk</option>
                  <option value="Lo-Fi">Lo-Fi</option>
                  <option value="Synthwave">Synthwave</option>
                  <option value="Bass Boosted">Bass Boosted</option>
                  <option value="Hip-Hop">Hip-Hop</option>
                  <option value="Romantic">Romantic</option>
                  <option value="Emotional">Emotional</option>
                  <option value="Ambient">Ambient</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Audio File (.mp3, .wav) *
                </label>
                <label className="flex flex-col items-center justify-center p-4 border border-dashed border-zinc-700 hover:border-fuchsia-500/60 rounded-xl bg-zinc-950/40 cursor-pointer transition-colors group">
                  <FileAudio className="w-8 h-8 text-zinc-500 group-hover:text-fuchsia-400 transition-colors mb-2" />
                  <span className="text-xs text-zinc-400 group-hover:text-zinc-200">
                    {audioFile ? audioFile.name : "Click to select audio track"}
                  </span>
                  <input
                    type="file"
                    accept="audio/*"
                    required
                    onChange={(e) => e.target.files?.[0] && setAudioFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Cover Artwork (Optional)
                </label>
                <label className="flex flex-col items-center justify-center p-4 border border-dashed border-zinc-700 hover:border-cyan-500/60 rounded-xl bg-zinc-950/40 cursor-pointer transition-colors group">
                  <ImageIcon className="w-8 h-8 text-zinc-500 group-hover:text-cyan-400 transition-colors mb-2" />
                  <span className="text-xs text-zinc-400 group-hover:text-zinc-200">
                    {coverFile ? coverFile.name : "Click to choose cover image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && setCoverFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3 mt-4 rounded-xl font-bold text-sm bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white shadow-lg shadow-fuchsia-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {uploading ? (
                  <div className="flex items-center gap-2">
                    <CircularLoader size="sm" className="!py-0" />
                    <span>Uploading track to server...</span>
                  </div>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Publish Music to Portal
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Uploaded Songs Table */}
          <div className="lg:col-span-7 bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                <Music className="w-5 h-5 text-cyan-400" /> Uploaded Tracks ({songs.length})
              </h2>
              <button
                onClick={fetchSongs}
                className="text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Refresh
              </button>
            </div>

            {loadingSongs ? (
              <div className="py-20 flex justify-center">
                <CircularLoader size="md" text="Loading Songs..." />
              </div>
            ) : songs.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl p-8">
                <Music className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-400 text-sm">No songs uploaded yet.</p>
                <p className="text-zinc-600 text-xs mt-1">
                  Upload your first track using the form on the left!
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {songs.map((song) => (
                  <div
                    key={song._id}
                    className="flex items-center justify-between p-3.5 bg-zinc-950/60 border border-zinc-800/80 hover:border-fuchsia-500/40 rounded-2xl transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl relative overflow-hidden bg-zinc-800 flex-shrink-0">
                        {song.coverUrl ? (
                          <Image
                            src={song.coverUrl}
                            alt={song.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Music className="w-6 h-6 text-zinc-500 m-auto" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm text-white truncate">{song.title}</h3>
                        <p className="text-xs text-zinc-400 truncate">
                          {song.artist} • <span className="text-fuchsia-400">{song.category}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePreview(song.audioUrl)}
                        className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-cyan-400 border border-zinc-800 transition-colors"
                        title={activePreview === song.audioUrl ? "Pause" : "Preview"}
                      >
                        {activePreview === song.audioUrl ? (
                          <Pause className="w-4 h-4 fill-cyan-400" />
                        ) : (
                          <Play className="w-4 h-4 fill-cyan-400" />
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(song._id)}
                        className="p-2.5 rounded-xl bg-zinc-900 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 border border-zinc-800 transition-colors"
                        title="Delete track"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
