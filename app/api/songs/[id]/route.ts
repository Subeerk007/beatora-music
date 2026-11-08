import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Song from "@/models/Song";
import { getAdminSession } from "@/lib/auth";
import { deleteAsset, uploadBuffer } from "@/lib/cloudinary";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

export const maxDuration = 60;

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid song identifier" }, { status: 400 });
    }

    await connectToDatabase();
    const song = await Song.findById(id);
    if (!song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    const contentType = req.headers.get("content-type") || "";
    let title = song.title;
    let artist = song.artist;
    let category = song.category;
    let coverFile: File | null = null;
    let bannerFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const formTitle = formData.get("title") as string | null;
      const formArtist = formData.get("artist") as string | null;
      const formCategory = formData.get("category") as string | null;
      if (formTitle) title = formTitle.trim();
      if (formArtist) artist = formArtist.trim();
      if (formCategory) category = formCategory.trim();
      coverFile = formData.get("cover") as File | null;
      bannerFile = formData.get("banner") as File | null;
    } else {
      const body = await req.json();
      if (body.title) title = body.title.trim();
      if (body.artist) artist = body.artist.trim();
      if (body.category) category = body.category.trim();
    }

    // If new cover image is uploaded
    if (coverFile && typeof coverFile !== "string" && coverFile.size > 0) {
      const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
      const uploadId = `${Date.now()}-${crypto.randomUUID()}-cover`;
      const coverUpload = await uploadBuffer(coverBuffer, {
        folder: "beatora/covers",
        public_id: uploadId,
        resource_type: "image",
      });

      if (song.coverPublicId) {
        try {
          await deleteAsset(song.coverPublicId, "image");
        } catch (e) {
          console.warn("Could not delete old cover:", e);
        }
      }

      song.coverUrl = coverUpload.secure_url;
      song.coverPublicId = coverUpload.public_id;
    }

    // If new banner image is uploaded
    if (bannerFile && typeof bannerFile !== "string" && bannerFile.size > 0) {
      const bannerBuffer = Buffer.from(await bannerFile.arrayBuffer());
      const uploadId = `${Date.now()}-${crypto.randomUUID()}-banner`;
      const bannerUpload = await uploadBuffer(bannerBuffer, {
        folder: "beatora/banners",
        public_id: uploadId,
        resource_type: "image",
      });

      if (song.bannerPublicId) {
        try {
          await deleteAsset(song.bannerPublicId, "image");
        } catch (e) {
          console.warn("Could not delete old banner:", e);
        }
      }

      song.bannerUrl = bannerUpload.secure_url;
      song.bannerPublicId = bannerUpload.public_id;
    }

    song.title = title;
    song.artist = artist;
    song.category = category;
    await song.save();

    return NextResponse.json({
      success: true,
      message: "Song updated successfully",
      song,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update song";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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
    if (song.bannerPublicId) {
      await deleteAsset(song.bannerPublicId, "image");
    }

    await Song.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Song deleted successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete song";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
