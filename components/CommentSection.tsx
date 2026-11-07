"use client";

import React, { useState, useEffect } from "react";
import { MessageSquarePlus, Send, Sparkles, User, Clock } from "lucide-react";
import { CircularLoader } from "@/components/ui/CircularLoader";

interface CommentItem {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
}

export const CommentSection: React.FC = () => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");

  const loadComments = async () => {
    try {
      const res = await fetch("/api/comments");
      const data = await res.json();
      if (data.comments) {
        setComments(data.comments);
      }
    } catch {
      // Ignore
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    setLoading(true);
    setSuccessMsg("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      const data = await res.json();
      if (data.success && data.comment) {
        setComments((prev) => [data.comment, ...prev]);
        setName("");
        setDescription("");
        setSuccessMsg("Thanks for sharing your experience! 🎉");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-[1320px] mx-auto px-6 md:px-12 mt-20 pt-10 border-t border-white/10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 text-xs tracking-widest text-fuchsia-400 font-bold uppercase mb-2">
            <MessageSquarePlus className="w-4 h-4 text-cyan-400" /> COMMUNITY REVIEWS & FEEDBACK
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            Listener <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">Experiences</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Batao aapko konsa gaana ya beat sabse acchi lagi!
          </p>
        </div>
        <div className="text-xs text-zinc-500 font-mono">
          {comments.length} Shared Experiences
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-5 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-fuchsia-500/30 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-xl shadow-fuchsia-950/20">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-cyan-400" /> Share Your Thoughts
          </h3>

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Your Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-fuchsia-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Feedback & Song Review
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="share your expriences"
                className="w-full p-4 bg-zinc-950/80 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-fuchsia-500 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim() || !description.trim()}
              className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-500 text-white shadow-lg shadow-fuchsia-600/30 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <CircularLoader size="sm" className="!py-0" />
                  <span>Posting...</span>
                </div>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Submit Experience
                </>
              )}
            </button>
          </form>
        </div>

        {/* List Column */}
        <div className="lg:col-span-7 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-md">
          <h3 className="text-base font-bold text-white mb-4">
            Recent Feedback
          </h3>

          {fetching ? (
            <div className="py-12 flex justify-center">
              <CircularLoader size="md" text="Loading reviews..." />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-2xl p-6">
              Abhi tak koi review nahi aaya. Be the first to share your experience!
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
              {comments.map((comm) => (
                <div
                  key={comm._id}
                  className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/70 hover:border-fuchsia-500/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-fuchsia-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                        {comm.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-sm text-white">{comm.name}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {comm.createdAt ? new Date(comm.createdAt).toISOString().split("T")[0] : "Just now"}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed pl-9">
                    {comm.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

