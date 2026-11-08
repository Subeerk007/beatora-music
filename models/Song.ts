import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISongDocument extends Document {
  title: string;
  artist: string;
  category: string;
  duration?: number;
  audioUrl: string;
  audioPublicId?: string;
  coverUrl?: string;
  coverPublicId?: string;
  bannerUrl?: string;
  bannerPublicId?: string;
  plays: number;
  createdAt: Date;
  updatedAt: Date;
}

const SongSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    artist: {
      type: String,
      required: [true, "Artist is required"],
      trim: true,
      default: "Unknown Artist",
    },
    category: {
      type: String,
      default: "Electronic",
      trim: true,
    },
    duration: {
      type: Number,
      default: 0,
    },
    audioUrl: {
      type: String,
      required: [true, "Audio URL is required"],
    },
    audioPublicId: {
      type: String,
    },
    coverUrl: {
      type: String,
      default: "/Neon Beatora Headphone Logo.png",
    },
    coverPublicId: {
      type: String,
    },
    bannerUrl: {
      type: String,
    },
    bannerPublicId: {
      type: String,
    },
    plays: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

SongSchema.index({ category: 1 });
SongSchema.index({ createdAt: -1 });

const Song: Model<ISongDocument> =
  mongoose.models.Song || mongoose.model<ISongDocument>("Song", SongSchema);

export default Song;
