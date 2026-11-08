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
  Image as ImageIcon,
  ArrowLeft,
  Sparkles,
  Pencil,
  X,
  Layers,
} from "lucide-react";
import Image from "next/image";
import { ISong } from "@/types/song";
import { CircularLoader } from "@/components/ui/CircularLoader";

const CATEGORIES = [
  "Electronic",
  "Cyberpunk",
  "Lo-Fi",
  "Synthwave",
  "Bass Boosted",
  "Hip-Hop",
  "Romantic",
  "Emotional",
  "Ambient",
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [songs, setSongs] = useState<ISong[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(true);
  const [activePreview, setActivePreview] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Upload Form State
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [category, setCategory] = useState("Electronic");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit Modal State
  const [editingSong, setEditingSong] = useState<ISong | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editArtist, setEditArtist] = useState("");
  const [editCategory, setEditCategory] = useState("Electronic");
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editBannerFile, setEditBannerFile] = useState<File | null>(null);
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState("");

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
    if (bannerFile) {
      formData.append("banner", bannerFile);
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
      setBannerFile(null);
      fetchSongs();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload song";
      setStatusMsg({ type: "error", text: msg });
    } finally {
      setUploading(false);
    }
  };

  const handleStartEdit = (song: ISong) => {
    setEditingSong(song);
    setEditTitle(song.title);
    setEditArtist(song.artist);
    setEditCategory(song.category || "Electronic");
    setEditCoverFile(null);
    setEditBannerFile(null);
    setEditError("");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSong || !editingSong._id) return;
    if (!editTitle.trim()) {
      setEditError("Title is required");
      return;
    }

    setUpdating(true);
    setEditError("");

    try {
      const formData = new FormData();
      formData.append("title", editTitle.trim());
      formData.append("artist", editArtist.trim() || "Unknown Artist");
      formData.append("category", editCategory);
      if (editCoverFile) {
        formData.append("cover", editCoverFile);
      }
      if (editBannerFile) {
        formData.append("banner", editBannerFile);
      }

      const res = await fetch(`/api/songs/${editingSong._id}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update track");
      }

      setSongs((prev) =>
        prev.map((s) => (s._id === data.song._id ? data.song : s))
      );
      setEditingSong(null);
      setStatusMsg({ type: "success", text: `"${data.song.title}" updated successfully!` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Update failed";
      setEditError(msg);
    } finally {
      setUpdating(false);
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
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-8 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="p-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
              title="Back to portal"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                  Admin System Active
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white mt-0.5">
                Music Manager & Studio
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-500/40 transition-colors"
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
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Audio File (.mp3, .wav) *
                </label>
                <label className="flex flex-col items-center justify-center p-4 border border-dashed border-zinc-700 hover:border-fuchsia-500/60 rounded-xl bg-zinc-950/40 cursor-pointer transition-colors group">
                  <UploadCloud className="w-8 h-8 text-zinc-500 group-hover:text-fuchsia-400 transition-colors mb-2" />
                  <span className="text-xs text-zinc-400 group-hover:text-zinc-200">
                    {audioFile ? audioFile.name : "Click to select MP3 or WAV audio"}
                  </span>
                  <input
                    type="file"
                    required
                    accept="audio/*,.mp3,.wav,.ogg,.m4a"
                    onChange={(e) => e.target.files?.[0] && setAudioFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Center Music Icon / Logo */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Track Icon Image (Center Music Logo / Icon)
                </label>
                <label className="flex flex-col items-center justify-center p-3.5 border border-dashed border-zinc-700 hover:border-cyan-500/60 rounded-xl bg-zinc-950/40 cursor-pointer transition-colors group">
                  <ImageIcon className="w-6 h-6 text-zinc-500 group-hover:text-cyan-400 transition-colors mb-1.5" />
                  <span className="text-xs text-zinc-400 group-hover:text-zinc-200">
                    {coverFile ? coverFile.name : "Click to choose Center Music Icon / Logo"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && setCoverFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Player ke beech me jahan logo dikh raha hai, wahan ye custom music icon show hoga!
                </p>
              </div>

              {/* Wide Background Banner */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Wide Background Backdrop (Optional - 16:9 Banner)
                </label>
                <label className="flex flex-col items-center justify-center p-3.5 border border-dashed border-fuchsia-500/40 hover:border-fuchsia-400 rounded-xl bg-fuchsia-950/10 cursor-pointer transition-colors group">
                  <Layers className="w-6 h-6 text-fuchsia-400/70 group-hover:text-fuchsia-300 transition-colors mb-1.5" />
                  <span className="text-xs text-fuchsia-300/80 group-hover:text-fuchsia-200">
                    {bannerFile ? bannerFile.name : "Upload Wide Background Backdrop Image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && setBannerFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Ye image player card ke peeche desktop par wide aur mobile par centered backdrop ki tarah dikhegi!
                </p>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3 mt-4 rounded-xl font-bold text-sm bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white shadow-lg shadow-fuchsia-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {uploading ? (
                  <div className="flex items-center gap-2">
                    <CircularLoader size="sm" className="!py-0" />
                    <span>Uploading track & graphics...</span>
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
                          {song.bannerUrl && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                              Wide Backdrop
                            </span>
                          )}
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

                      {/* Edit Button */}
                      <button
                        onClick={() => handleStartEdit(song)}
                        className="p-2.5 rounded-xl bg-zinc-900 hover:bg-fuchsia-500/20 text-zinc-400 hover:text-fuchsia-300 border border-zinc-800 transition-colors"
                        title="Edit track details & backdrop"
                      >
                        <Pencil className="w-4 h-4" />
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

      {/* ============================================================== */}
      {/* EDIT TRACK MODAL                                               */}
      {/* ============================================================== */}
      {editingSong && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-fuchsia-500/40 bg-gradient-to-b from-[#1c0c32] via-[#0f0a24] to-[#070614] shadow-[0_20px_70px_rgba(210,27,255,0.4)] max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-fuchsia-600/20 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Edit Track</h3>
                  <p className="text-xs text-zinc-400">Update track details, genre or background backdrop</p>
                </div>
              </div>

              <button
                onClick={() => setEditingSong(null)}
                className="p-2 rounded-xl bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="mb-4 p-3 rounded-xl text-xs bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Song Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-fuchsia-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Artist / Producer
                </label>
                <input
                  type="text"
                  value={editArtist}
                  onChange={(e) => setEditArtist(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-fuchsia-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Category / Genre
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-fuchsia-500 transition-colors"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Center Music Icon / Logo */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Update Track Icon Image (Center Music Logo)
                </label>
                <label className="flex items-center gap-3 p-3 border border-dashed border-zinc-700 hover:border-cyan-500 rounded-xl bg-zinc-950/40 cursor-pointer transition-colors">
                  <ImageIcon className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                  <span className="text-xs text-zinc-400 truncate flex-1">
                    {editCoverFile ? editCoverFile.name : "Choose new Icon / Logo to replace center image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && setEditCoverFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Ye icon player me dono wave bars ke beech me center frame me dikhega!
                </p>
              </div>

              {/* Wide Background Banner */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Update Wide Background Backdrop (16:9 Banner)
                </label>
                <label className="flex items-center gap-3 p-3 border border-dashed border-fuchsia-500/40 hover:border-fuchsia-400 rounded-xl bg-fuchsia-950/20 cursor-pointer transition-colors">
                  <Layers className="w-5 h-5 text-fuchsia-400 flex-shrink-0" />
                  <span className="text-xs text-fuchsia-300 truncate flex-1">
                    {editBannerFile ? editBannerFile.name : (editingSong.bannerUrl ? "Replace wide backdrop image" : "Upload new wide backdrop image")}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && setEditBannerFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingSong(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white shadow-lg shadow-fuchsia-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {updating ? (
                    <>
                      <CircularLoader size="sm" className="!py-0" />
                      <span>Saving changes...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
