export default function AuthLayout({ children }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{ background: 'linear-gradient(135deg, #0A0A0A, #1F1F1F)' }}
    >
      {/* Decorative radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/[0.04] blur-3xl pointer-events-none" />

      {/* Content wrapper */}
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
