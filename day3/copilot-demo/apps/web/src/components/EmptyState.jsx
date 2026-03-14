export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
      <svg
        className="w-16 h-16 mb-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
      <h2 className="text-xl font-semibold text-gray-500 mb-1">All clear!</h2>
      <p className="text-sm text-gray-400">Add your first todo to get started.</p>
    </div>
  );
}
