import { NextResponse } from "next/server";
import { createAdminToken, setAdminCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const expectedEmail = process.env.ADMIN_ID || "admin@gmail.com";
    const expectedPassword = process.env.ADMIN_PASSWORD || "1234";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (email.trim().toLowerCase() !== expectedEmail.trim().toLowerCase() || password !== expectedPassword) {
      return NextResponse.json(
        { error: "Invalid admin credentials" },
        { status: 401 }
      );
    }

    const token = await createAdminToken(email);
    await setAdminCookie(token);

    return NextResponse.json({
      success: true,
      message: "Admin authenticated successfully",
      user: { email, role: "admin" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

