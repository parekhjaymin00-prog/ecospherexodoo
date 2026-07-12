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
        className="bg-[#171717] border border-[#2A2A2A] text-white placeholder-[#737373] rounded-lg px-4 py-3 w-full focus:border-white focus:outline-none"
        {...(register ? register(name) : {})}
        {...rest}
      />
      {error && (
        <p className="text-[#F87171] text-sm mt-1">{error}</p>
      )}
    </div>
  );
}
