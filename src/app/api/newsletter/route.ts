import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  isFeedbackEmailConfigured,
  sendFeedbackEmail,
} from "@/lib/sendFeedbackEmail";

type NewsletterBody = {
  email?: string;
};

export async function POST(request: Request) {
  let body: NewsletterBody;

  try {
    body = (await request.json()) as NewsletterBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = body.email?.trim() || "";
  if (!email || email.length > 320 || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  const supabase = await createClient();
  const userAgent = request.headers.get("user-agent");

  const { error: insertError } = await supabase.from("feedback").insert({
    feedback_type: "general",
    message: `Newsletter signup`,
    email,
    page_path: "/",
    user_agent: userAgent,
  });

  if (insertError) {
    console.error("Newsletter insert failed:", insertError.message);
    return NextResponse.json(
      { error: "Could not save signup." },
      { status: 500 },
    );
  }

  if (isFeedbackEmailConfigured()) {
    try {
      await sendFeedbackEmail({
        feedbackType: "general",
        message: "Newsletter signup",
        email,
        pagePath: "/",
      });
    } catch (error) {
      console.error("Newsletter email failed:", error);
      return NextResponse.json({ ok: true, emailed: false });
    }
  }

  return NextResponse.json({ ok: true });
}
