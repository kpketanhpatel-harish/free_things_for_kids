"use client";

import { useState, type FormEvent } from "react";
import { trackEvent } from "@/lib/analytics";

export default function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter your email to get the weekly list.");
      return;
    }

    setStatus("submitting");
    setError(null);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      if (!response.ok) {
        throw new Error("Signup failed");
      }
      setStatus("success");
      trackEvent("newsletter_signup");
    } catch {
      setStatus("error");
      setError("Could not sign you up. Try again, or email freekidlist@gmail.com.");
    }
  }

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="rounded-2xl border border-sky-100 bg-white px-4 py-5 shadow-sm"
    >
      <h2 id="newsletter-heading" className="text-lg font-semibold text-gray-900">
        Free weekend plans, every Thursday.
      </h2>
      <p className="mt-1 text-sm text-gray-600">
        Get the best free things to do with kids nearby, delivered once a week.
      </p>

      {status === "success" ? (
        <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          You&apos;re on the list. Watch for Thursday&apos;s email.
        </p>
      ) : (
        <form className="mt-4" onSubmit={handleSubmit}>
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="newsletter-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="min-h-11 w-full flex-1 rounded-xl border border-gray-300 px-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <button
              type="submit"
              disabled={status === "submitting"}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-700 px-4 text-sm font-medium text-white disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {status === "submitting" ? "Sending…" : "Send me the list"}
            </button>
          </div>
          {error ? (
            <p className="mt-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      )}
    </section>
  );
}
