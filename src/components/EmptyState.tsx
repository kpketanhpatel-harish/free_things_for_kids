"use client";

import Link from "next/link";

type EmptyAction =
  | { label: string; onClick: () => void; href?: never }
  | { label: string; href: string; onClick?: never };

type EmptyStateProps = {
  title: string;
  description?: string;
  actions?: EmptyAction[];
};

export default function EmptyState({
  title,
  description,
  actions = [],
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-sky-200 bg-white px-4 py-5">
      <p className="font-medium text-gray-900">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      ) : null}
      {actions.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {actions.map((action) =>
            action.href ? (
              <Link
                key={action.label}
                href={action.href}
                className="inline-flex min-h-11 items-center rounded-full border border-gray-300 bg-white px-3.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {action.label}
              </Link>
            ) : (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className="inline-flex min-h-11 items-center rounded-full border border-gray-300 bg-white px-3.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {action.label}
              </button>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}
