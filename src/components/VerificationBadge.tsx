type VerificationBadgeProps = {
  label: string;
};

export default function VerificationBadge({ label }: VerificationBadgeProps) {
  return (
    <p className="text-xs text-gray-500">{label}</p>
  );
}
