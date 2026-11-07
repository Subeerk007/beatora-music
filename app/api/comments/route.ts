import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Feedback from "@/models/Feedback";

let memoryComments: { _id: string; name: string; description: string; createdAt: string }[] = [
  {
    _id: "seed-comm-1",
    name: "Aman Sharma",
    description: "Bass Boosted tracks are absolutely insane! The beat jumping visualizer on mobile is so smooth.",
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    try {
      await connectToDatabase();
      const comments = await Feedback.find().sort({ createdAt: -1 }).limit(50).lean();
      if (comments && comments.length > 0) {
        return NextResponse.json({ success: true, comments });
      }
    } catch {
      // Return instant memory fallback
    }

    return NextResponse.json({ success: true, comments: memoryComments });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch comments";
    return NextResponse.json({ success: false, error: msg, comments: memoryComments }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, description } = await req.json();

    if (!name?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: "Name and description are required" },
        { status: 400 }
      );
    }

    const newComment = {
      _id: `comm-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      await connectToDatabase();
      const created = await Feedback.create({
        name: name.trim(),
        description: description.trim(),
      });
      return NextResponse.json({ success: true, comment: created });
    } catch {
      memoryComments.unshift(newComment);
      return NextResponse.json({ success: true, comment: newComment });
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to post comment";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
