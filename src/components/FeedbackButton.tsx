"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, mounted]);

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
        className="inline-flex rounded-lg border border-gray-300 bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-200 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:px-3 sm:text-sm"
      >
        Feedback
      </button>

      {mounted
        ? createPortal(
            <dialog
              ref={dialogRef}
              aria-labelledby={titleId}
              className="box-border m-auto w-[min(20rem,calc(100vw-1.5rem))] max-h-[calc(100dvh-1.5rem)] overflow-x-hidden overflow-y-auto whitespace-normal rounded-2xl border border-gray-200 bg-white p-0 text-left shadow-xl backdrop:bg-slate-900/40"
              onClose={closeModal}
              onClick={(event) => {
                if (event.target === dialogRef.current) {
                  closeModal();
                }
              }}
            >
              <div className="min-w-0 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2
                      id={titleId}
                      className="text-base font-semibold text-gray-900"
                    >
                      Send feedback
                    </h2>
                    <p className="mt-1 text-sm leading-snug text-gray-600">
                      Ideas, bugs, or anything else we should know.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    aria-label="Close"
                    className="shrink-0 rounded-md px-2 py-1 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    ✕
                  </button>
                </div>

                {status === "success" ? (
                  <div className="mt-4 space-y-3">
                    <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-800">
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
                  <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
                    <div className="min-w-0">
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
                        className="mt-1 w-full max-w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="feature">Feature request</option>
                        <option value="issue">Issue</option>
                        <option value="general">General feedback</option>
                      </select>
                    </div>

                    <div className="min-w-0">
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
                        rows={3}
                        maxLength={5000}
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        placeholder="What should we know?"
                        className="mt-1 w-full max-w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="min-w-0">
                      <label
                        htmlFor="feedback-email"
                        className="block text-sm font-medium text-gray-800"
                      >
                        Your email{" "}
                        <span className="font-normal text-gray-500">
                          (optional)
                        </span>
                      </label>
                      <input
                        id="feedback-email"
                        name="email"
                        type="email"
                        maxLength={320}
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="so we can follow up"
                        className="mt-1 w-full max-w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {errorMessage ? (
                      <p className="break-words rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                        {errorMessage}
                      </p>
                    ) : null}

                    <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
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
                        className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        {status === "submitting" ? "Sending…" : "Send"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </dialog>,
            document.body,
          )
        : null}
    </>
  );
}
