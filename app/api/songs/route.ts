import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Song from "@/models/Song";
import { ISong } from "@/types/song";
import fs from "fs";
import path from "path";

function getLocalUploadedSongs(): ISong[] {
  const songsDir = path.join(process.cwd(), "public", "uploads", "songs");
  const result: ISong[] = [];
  if (fs.existsSync(songsDir)) {
    const files = fs.readdirSync(songsDir);
    for (const file of files) {
      if (file.endsWith(".mp3") || file.endsWith(".wav")) {
        const cleanTitle = file
          .replace(/^\d+-/, "")
          .replace(/\.(mp3|wav)$/, "")
          .replace(/_/g, " ");
        result.push({
          _id: `file-${file}`,
          title: cleanTitle,
          artist: "Studio Upload",
          category: "Electronic",
          audioUrl: `/uploads/songs/${file}`,
          coverUrl: "/Neon Beatora Headphone Logo.png",
          plays: 0,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }
  return result;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const query = searchParams.get("q");

    let songs: ISong[] = [];

    // Try MongoDB query quickly
    try {
      await connectToDatabase();
      const filter: Record<string, unknown> = {};
      if (category && category !== "All") {
        filter.category = new RegExp(category, "i");
      }
      if (query) {
        filter.$or = [
          { title: new RegExp(query, "i") },
          { artist: new RegExp(query, "i") },
        ];
      }

      const docs = await Song.find(filter).sort({ createdAt: -1 }).lean();
      songs = docs as unknown as ISong[];
    } catch {
      // Fallback to local files without waiting
    }

    // If MongoDB returned no songs or is offline, serve local files instantly
    if (songs.length === 0) {
      let localSongs = getLocalUploadedSongs();

      if (category && category !== "All") {
        localSongs = localSongs.filter((s) =>
          s.category?.toLowerCase().includes(category.toLowerCase())
        );
      }
      if (query) {
        localSongs = localSongs.filter(
          (s) =>
            s.title?.toLowerCase().includes(query.toLowerCase()) ||
            s.artist?.toLowerCase().includes(query.toLowerCase())
        );
      }

      songs = localSongs;
    }

    return NextResponse.json({ success: true, count: songs.length, songs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch songs";
    return NextResponse.json({ success: false, error: message, songs: getLocalUploadedSongs() }, { status: 200 });
  }
}
