const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
];

export function TodoFilters({ filter, setFilter, completedCount, activeCount, onClearCompleted }) {
  const total = completedCount + activeCount;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 my-3">
      <div className="flex gap-1" role="tablist" aria-label="Filter todos">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={filter === key}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              filter === key
                ? 'bg-teal-700 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span>{completedCount} of {total} completed</span>
        {completedCount > 0 && (
          <button
            type="button"
            className="text-rose-600 hover:text-rose-800 underline cursor-pointer transition-colors"
            onClick={onClearCompleted}
          >
            Clear completed
          </button>
        )}
      </div>
    </div>
  );
}
