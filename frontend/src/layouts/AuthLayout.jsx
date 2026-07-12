export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A0A0A]">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
