import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Song from "@/models/Song";
import { getAdminSession } from "@/lib/auth";
import { deleteAsset, uploadBuffer } from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Admin login required." }, { status: 401 });
    }

    const formData = await req.formData();
    const title = (formData.get("title") as string)?.trim();
    const artist = (formData.get("artist") as string)?.trim() || "Unknown Artist";
    const category = (formData.get("category") as string)?.trim() || "Electronic";
    const audioFile = formData.get("audio") as File | null;
    const coverFile = formData.get("cover") as File | null;
    const bannerFile = formData.get("banner") as File | null;

    if (!title) {
      return NextResponse.json({ error: "Song title is required" }, { status: 400 });
    }

    if (!audioFile || typeof audioFile === "string") {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
    }

    const audioExtension = audioFile.name.split(".").pop()?.toLowerCase();
    if (!audioExtension || !["mp3", "wav", "ogg", "m4a"].includes(audioExtension)) {
      return NextResponse.json(
        { error: "Only MP3, WAV, OGG, and M4A audio files are supported" },
        { status: 400 }
      );
    }

    console.log(`[UPLOAD] Starting upload: title="${title}", artist="${artist}", category="${category}"`);

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const uploadId = `${Date.now()}-${crypto.randomUUID()}`;
    console.log(`[UPLOAD] Uploading audio to Cloudinary (id=${uploadId})...`);
    const audioUpload = await uploadBuffer(audioBuffer, {
      folder: "beatora/songs",
      public_id: uploadId,
      resource_type: "video",
      format: audioExtension,
    });
    console.log(`[UPLOAD] Audio uploaded to Cloudinary: ${audioUpload.secure_url}`);

    let coverUrl = "/Neon Beatora Headphone Logo.png";
    let coverPublicId: string | undefined = undefined;
    let bannerUrl: string | undefined = undefined;
    let bannerPublicId: string | undefined = undefined;

    try {
      if (coverFile && typeof coverFile !== "string" && coverFile.size > 0) {
        const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
        const coverUpload = await uploadBuffer(coverBuffer, {
          folder: "beatora/covers",
          public_id: `${uploadId}-cover`,
          resource_type: "image",
        });
        coverUrl = coverUpload.secure_url;
        coverPublicId = coverUpload.public_id;
        console.log(`[UPLOAD] Cover uploaded to Cloudinary: ${coverUrl}`);
      }

      if (bannerFile && typeof bannerFile !== "string" && bannerFile.size > 0) {
        const bannerBuffer = Buffer.from(await bannerFile.arrayBuffer());
        const bannerUpload = await uploadBuffer(bannerBuffer, {
          folder: "beatora/banners",
          public_id: `${uploadId}-banner`,
          resource_type: "image",
        });
        bannerUrl = bannerUpload.secure_url;
        bannerPublicId = bannerUpload.public_id;
        console.log(`[UPLOAD] Banner uploaded to Cloudinary: ${bannerUrl}`);
      }
    } catch (error) {
      try {
        await deleteAsset(audioUpload.public_id, "video");
        if (coverPublicId) await deleteAsset(coverPublicId, "image");
        if (bannerPublicId) await deleteAsset(bannerPublicId, "image");
      } catch (cleanupError) {
        console.warn("Cloudinary cleanup failed after image upload error:", cleanupError);
      }
      throw error;
    }

    try {
      await connectToDatabase();
      console.log("[UPLOAD] Saving song to MongoDB...");
      
      const songData: Record<string, unknown> = {
        title,
        artist,
        category,
        audioUrl: audioUpload.secure_url,
        audioPublicId: audioUpload.public_id,
        coverUrl,
        plays: 0,
      };
      if (coverPublicId) songData.coverPublicId = coverPublicId;
      if (bannerUrl) songData.bannerUrl = bannerUrl;
      if (bannerPublicId) songData.bannerPublicId = bannerPublicId;

      const newSong = await Song.create(songData);

      console.log(`[UPLOAD] Song saved to MongoDB: id=${newSong._id}`);

      return NextResponse.json({
        success: true,
        message: "Music uploaded to Cloudinary and registered successfully!",
        song: newSong,
      });
    } catch (error) {
      try {
        await deleteAsset(audioUpload.public_id, "video");
        if (coverPublicId) await deleteAsset(coverPublicId, "image");
        if (bannerPublicId) await deleteAsset(bannerPublicId, "image");
      } catch (cleanupError) {
        console.warn("Cloudinary cleanup failed after database error:", cleanupError);
      }
      throw error;
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to upload song";
    console.error("[UPLOAD] ERROR:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
