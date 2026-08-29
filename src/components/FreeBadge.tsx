type FreeBadgeProps = {
  className?: string;
};

export default function FreeBadge({ className = "" }: FreeBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-emerald-800 ${className}`}
    >
      Free
    </span>
  );
}
