import { useState } from 'react';

export function TodoForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmed = title.trim();

    if (!trimmed) {
      setError('Please enter a todo title.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await onAdd(trimmed);
      setTitle('');
    } catch (err) {
      setError(err.message || 'Failed to create todo.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mb-4" onSubmit={handleSubmit}>
      <label htmlFor="new-todo" className="block mb-1 font-semibold">
        New todo
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          id="new-todo"
          className="flex-1 border border-blue-200 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
          type="text"
          value={title}
          maxLength={200}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs to be done?"
        />
        <button
          className="rounded-lg bg-teal-700 text-white font-semibold px-4 py-2.5 cursor-pointer disabled:opacity-70 disabled:cursor-default hover:bg-teal-800 transition-colors sm:w-auto w-full"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add'}
        </button>
      </div>
      {title.length > 0 && (
        <p className={`mt-1 text-xs ${
          title.length >= 200 ? 'text-red-600 font-semibold' :
          title.length >= 180 ? 'text-amber-600' : 'text-gray-400'
        }`}>
          {title.length}/200
        </p>
      )}
      {error ? <p className="mt-1 text-red-700">{error}</p> : null}
    </form>
  );
}
