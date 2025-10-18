export default function LoadingSpinner({
  label = "Đang tải...",
}: {
  label?: string;
}) {
  return (
    <div
      className="flex items-center justify-center gap-3 py-10"
      role="status"
      aria-live="polite"
    >
      <span className="inline-block size-5 rounded-full border-2 border-primary-500 border-t-transparent animate-spin-slow" />
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );
}
