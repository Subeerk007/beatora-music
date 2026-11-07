import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Song from "@/models/Song";
import { ISong } from "@/types/song";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const query = searchParams.get("q");

    let songs: ISong[] = [];

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
    } catch (dbError) {
      console.warn("MongoDB not reachable, using fallback file-based song catalog:", dbError);
    }

    // If database returned 0 songs or is temporarily offline, check public uploads directory
    if (songs.length === 0) {
      let candidateSeeds: ISong[] = [];

      // Also dynamically pick up any mp3 directly in public/uploads/songs
      const songsDir = path.join(process.cwd(), "public", "uploads", "songs");
      if (fs.existsSync(songsDir)) {
        const files = fs.readdirSync(songsDir);
        for (const file of files) {
          if (file.endsWith(".mp3") || file.endsWith(".wav")) {
            const audioUrl = `/uploads/songs/${file}`;
            if (!candidateSeeds.some((s) => s.audioUrl === audioUrl)) {
              const cleanTitle = file.replace(/^\d+-/, "").replace(/\.(mp3|wav)$/, "").replace(/_/g, " ");
              candidateSeeds.push({
                _id: `file-${file}`,
                title: cleanTitle,
                artist: "Studio Upload",
                category: "Electronic",
                audioUrl,
                coverUrl: "/Neon Beatora Headphone Logo.png",
                plays: 0,
                createdAt: new Date().toISOString(),
              });
            }
          }
        }
      }

      // Apply category and query filters to fallback/file list
      if (category && category !== "All") {
        candidateSeeds = candidateSeeds.filter((s) =>
          s.category?.toLowerCase().includes(category.toLowerCase())
        );
      }
      if (query) {
        candidateSeeds = candidateSeeds.filter(
          (s) =>
            s.title?.toLowerCase().includes(query.toLowerCase()) ||
            s.artist?.toLowerCase().includes(query.toLowerCase())
        );
      }

      songs = candidateSeeds;
    }

    return NextResponse.json({ success: true, count: songs.length, songs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch songs";
    return NextResponse.json({ success: false, error: message, songs: [] }, { status: 200 });
  }
}
