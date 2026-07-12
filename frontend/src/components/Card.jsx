export default function Card({ children, className = '' }) {
  return (
    <div
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(255,255,255,0.05)] p-8 ${className}`}
    >
      {children}
    </div>
  );
}
