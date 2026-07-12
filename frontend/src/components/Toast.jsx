import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const colorClass = type === 'error' ? 'bg-white text-red-600' : 'bg-white text-green-600';

  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${colorClass}`}>
      <div className="flex items-center justify-between gap-3">
        <span>{message}</span>
        <button
          onClick={onClose}
          className="font-bold text-lg leading-none cursor-pointer"
          aria-label="Close notification"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
