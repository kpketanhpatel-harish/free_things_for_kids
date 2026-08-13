import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  isFeedbackEmailConfigured,
  sendFeedbackEmail,
} from "@/lib/sendFeedbackEmail";

const FEEDBACK_TYPES = new Set(["feature", "issue", "general"]);

type FeedbackBody = {
  feedbackType?: string;
  message?: string;
  email?: string;
  pagePath?: string;
};

export async function POST(request: Request) {
  let body: FeedbackBody;

  try {
    body = (await request.json()) as FeedbackBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const feedbackType = body.feedbackType?.trim();
  const message = body.message?.trim();
  const email = body.email?.trim() || null;
  const pagePath = body.pagePath?.trim() || null;

  if (!feedbackType || !FEEDBACK_TYPES.has(feedbackType)) {
    return NextResponse.json(
      { error: "Invalid feedback type." },
      { status: 400 },
    );
  }

  if (!message || message.length > 5000) {
    return NextResponse.json(
      { error: "Message is required (max 5000 characters)." },
      { status: 400 },
    );
  }

  if (email && email.length > 320) {
    return NextResponse.json({ error: "Email is too long." }, { status: 400 });
  }

  const supabase = await createClient();
  const userAgent = request.headers.get("user-agent");

  const { error: insertError } = await supabase.from("feedback").insert({
    feedback_type: feedbackType,
    message,
    email,
    page_path: pagePath,
    user_agent: userAgent,
  });

  if (insertError) {
    console.error("Feedback insert failed:", insertError.message);
    return NextResponse.json(
      { error: "Could not save feedback." },
      { status: 500 },
    );
  }

  if (isFeedbackEmailConfigured()) {
    try {
      await sendFeedbackEmail({
        feedbackType: feedbackType as "feature" | "issue" | "general",
        message,
        email,
        pagePath,
      });
    } catch (error) {
      console.error("Feedback email failed:", error);
      // Submission is already saved; still treat as success for the user.
      return NextResponse.json({
        ok: true,
        emailed: false,
        warning: "Saved, but email alert failed.",
      });
    }
  } else {
    console.warn(
      "Feedback saved without email alert. Set GMAIL_USER and GMAIL_APP_PASSWORD.",
    );
    return NextResponse.json({ ok: true, emailed: false });
  }

  return NextResponse.json({ ok: true, emailed: true });
}
