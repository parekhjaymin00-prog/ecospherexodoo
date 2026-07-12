import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const colorClass = type === 'error'
    ? 'bg-[#171717] border border-[#2A2A2A] text-[#F87171]'
    : 'bg-[#171717] border border-[#2A2A2A] text-[#22C55E]';

  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg ${colorClass}`}>
      <div className="flex items-center justify-between gap-3">
        <span>{message}</span>
        <button
          onClick={onClose}
          className="font-bold text-lg leading-none cursor-pointer text-[#737373] hover:text-white"
          aria-label="Close notification"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
