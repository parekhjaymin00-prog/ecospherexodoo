import LoadingSpinner from './LoadingSpinner';

export default function Button({
  children,
  type = 'button',
  loading = false,
  disabled = false,
  onClick,
  className = '',
}) {
  const isDisabled = loading || disabled;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`w-full py-3 px-6 rounded-lg font-bold bg-gradient-to-r from-white to-[#D4D4D4] text-black hover:from-[#2A2A2A] hover:to-black hover:text-white transition-all duration-200 ease-in-out ${isDisabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <LoadingSpinner size={20} />
        </span>
      ) : (
        children
      )}
    </button>
  );
}
