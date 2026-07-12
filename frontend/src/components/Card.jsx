export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-[#171717] border border-[#2A2A2A] rounded-lg p-8 ${className}`}>
      {children}
    </div>
  );
}
