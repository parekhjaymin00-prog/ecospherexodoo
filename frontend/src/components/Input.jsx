export default function Input({ label, name, type = 'text', placeholder, error, register, ...rest }) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-[#A3A3A3] text-sm mb-1.5 block"
      >
        {label}
      </label>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        className="bg-transparent border border-white/15 text-white placeholder-[#737373] rounded-lg px-4 py-3 w-full focus:border-white focus:ring-2 focus:ring-white/20 focus:outline-none transition-all duration-200"
        {...(register ? register(name) : {})}
        {...rest}
      />
      {error && (
        <p className="text-[#F87171] text-sm mt-1">{error}</p>
      )}
    </div>
  );
}
