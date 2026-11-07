import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Song from "@/models/Song";
import { getAdminSession } from "@/lib/auth";
import { deleteAsset } from "@/lib/cloudinary";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (id.startsWith("file-")) {
      const fileName = id.slice("file-".length);
      if (!fileName || fileName.includes("\\") || fileName.includes("/") || fileName.includes("..")) {
        return NextResponse.json({ error: "Invalid local song identifier" }, { status: 400 });
      }

      const audioPath = path.join(process.cwd(), "public", "uploads", "songs", fileName);
      if (!fs.existsSync(audioPath)) {
        return NextResponse.json({ error: "Song file not found" }, { status: 404 });
      }

      fs.unlinkSync(audioPath);
      return NextResponse.json({ success: true, message: "Local song deleted successfully" });
    }

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid song identifier" }, { status: 400 });
    }

    await connectToDatabase();

    const song = await Song.findById(id);
    if (!song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    // Try deleting physical audio file if it is in uploads
    if (song.audioUrl && song.audioUrl.startsWith("/uploads/")) {
      const audioPath = path.join(process.cwd(), "public", song.audioUrl.replace(/^\//, ""));
      if (fs.existsSync(audioPath)) {
        try {
          fs.unlinkSync(audioPath);
        } catch {
          // Ignore file cleanup error
        }
      }
    }

    // Try deleting physical cover file if it is in uploads
    if (song.coverUrl && song.coverUrl.startsWith("/uploads/")) {
      const coverPath = path.join(process.cwd(), "public", song.coverUrl.replace(/^\//, ""));
      if (fs.existsSync(coverPath)) {
        try {
          fs.unlinkSync(coverPath);
        } catch {
          // Ignore file cleanup error
        }
      }
    }

    if (song.audioPublicId) {
      await deleteAsset(song.audioPublicId, "video");
    }
    if (song.coverPublicId) {
      await deleteAsset(song.coverPublicId, "image");
    }

    await Song.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Song deleted successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete song";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
