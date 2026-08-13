import nodemailer from "nodemailer";

export type FeedbackEmailPayload = {
  feedbackType: "feature" | "issue" | "general";
  message: string;
  email?: string | null;
  pagePath?: string | null;
};

const TYPE_LABELS = {
  feature: "Feature request",
  issue: "Issue",
  general: "General feedback",
} as const;

export function isFeedbackEmailConfigured(): boolean {
  return Boolean(
    process.env.GMAIL_USER?.trim() && process.env.GMAIL_APP_PASSWORD?.trim(),
  );
}

export async function sendFeedbackEmail(
  payload: FeedbackEmailPayload,
): Promise<void> {
  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.trim();
  const notifyTo =
    process.env.FEEDBACK_NOTIFY_EMAIL?.trim() ||
    gmailUser ||
    "freekidlist@gmail.com";

  if (!gmailUser || !gmailAppPassword) {
    throw new Error(
      "Missing GMAIL_USER or GMAIL_APP_PASSWORD for feedback email alerts.",
    );
  }

  const typeLabel = TYPE_LABELS[payload.feedbackType];
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });

  const lines = [
    `Type: ${typeLabel}`,
    `From: ${payload.email?.trim() || "(not provided)"}`,
    `Page: ${payload.pagePath?.trim() || "(unknown)"}`,
    "",
    payload.message.trim(),
  ];

  await transporter.sendMail({
    from: `"The Free Kid List" <${gmailUser}>`,
    to: notifyTo,
    replyTo: payload.email?.trim() || undefined,
    subject: `[Free Kid List] ${typeLabel}`,
    text: lines.join("\n"),
  });
}
