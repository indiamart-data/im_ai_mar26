export function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-slide-in ${
            toast.variant === 'error'
              ? 'bg-rose-600 text-white'
              : 'bg-teal-600 text-white'
          }`}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            className="text-white/80 hover:text-white cursor-pointer text-lg leading-none"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
