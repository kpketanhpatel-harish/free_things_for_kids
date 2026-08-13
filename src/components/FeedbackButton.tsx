"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";

type FeedbackType = "feature" | "issue" | "general";
type SubmitState = "idle" | "submitting" | "success" | "error";

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("general");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function resetForm() {
    setFeedbackType("general");
    setMessage("");
    setEmail("");
    setStatus("idle");
    setErrorMessage(null);
  }

  function closeModal() {
    setOpen(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setStatus("error");
      setErrorMessage("Please enter your feedback before submitting.");
      return;
    }

    setStatus("submitting");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedbackType,
          message: trimmedMessage,
          email: email.trim() || undefined,
          pagePath:
            typeof window !== "undefined" ? window.location.pathname : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Feedback API rejected the submission");
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage(
        "Something went wrong. Please try again or email freekidlist@gmail.com.",
      );
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          resetForm();
          setOpen(true);
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex rounded-lg bg-amber-500 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 sm:px-3 sm:text-sm"
      >
        Feedback
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="w-[min(100%,24rem)] rounded-2xl border border-gray-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40"
        onClose={closeModal}
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            closeModal();
          }
        }}
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id={titleId} className="text-lg font-semibold text-gray-900">
                Send feedback
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Feature ideas, bugs, or general thoughts—helping us improve as
                we roll out.
              </p>
            </div>

            <button
              type="button"
              onClick={closeModal}
              aria-label="Close"
              className="rounded-md px-2 py-1 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              ✕
            </button>
          </div>

          {status === "success" ? (
            <div className="mt-5 space-y-4">
              <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
                Thanks—your feedback was sent. We read every note.
              </p>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          ) : (
            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="feedback-type"
                  className="block text-sm font-medium text-gray-800"
                >
                  Type
                </label>
                <select
                  id="feedback-type"
                  name="type"
                  value={feedbackType}
                  onChange={(event) =>
                    setFeedbackType(event.target.value as FeedbackType)
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="feature">Feature request</option>
                  <option value="issue">Issue</option>
                  <option value="general">General feedback</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="feedback-message"
                  className="block text-sm font-medium text-gray-800"
                >
                  Message
                </label>
                <textarea
                  id="feedback-message"
                  name="message"
                  required
                  rows={4}
                  maxLength={5000}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="What should we know?"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="feedback-email"
                  className="block text-sm font-medium text-gray-800"
                >
                  Your email{" "}
                  <span className="font-normal text-gray-500">(optional)</span>
                </label>
                <input
                  id="feedback-email"
                  name="email"
                  type="email"
                  maxLength={320}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="so we can follow up"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {errorMessage ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {errorMessage}
                </p>
              ) : null}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                >
                  {status === "submitting" ? "Sending…" : "Send feedback"}
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
