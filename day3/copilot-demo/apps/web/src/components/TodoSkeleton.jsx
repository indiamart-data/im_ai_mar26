export function TodoSkeleton() {
  return (
    <ul className="list-none m-0 p-0 flex flex-col gap-2" aria-label="Loading todos">
      {[1, 2, 3].map((i) => (
        <li
          key={i}
          className="flex justify-between items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 bg-blue-50/30 animate-pulse"
        >
          <div className="inline-flex items-center gap-2 flex-1">
            <div className="w-4 h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded" style={{ width: `${50 + i * 15}%` }} />
          </div>
          <div className="w-16 h-8 bg-gray-200 rounded-lg" />
        </li>
      ))}
    </ul>
  );
}
