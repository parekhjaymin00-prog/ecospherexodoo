import LoadingSpinner from './LoadingSpinner';

export default function Button({
  children,
  type = 'button',
  loading = false,
  disabled = false,
  onClick,
  className = '',
  variant = 'primary',
}) {
  const isDisabled = loading || disabled;

  const baseClasses = 'w-full py-3 px-6 rounded-lg font-bold';

  const variantClasses = variant === 'secondary'
    ? 'bg-transparent border border-white text-white hover:bg-[#1F1F1F]'
    : 'bg-white text-black hover:bg-[#D4D4D4]';

  const disabledClasses = isDisabled ? 'bg-[#2A2A2A] text-[#737373] pointer-events-none' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseClasses} ${isDisabled ? disabledClasses : variantClasses} ${className}`}
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
