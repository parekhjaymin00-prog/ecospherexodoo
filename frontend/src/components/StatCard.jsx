export default function StatCard({ title, value, subtitle }) {
  return (
    <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-5">
      <p className="text-xs text-[#737373] font-medium uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      {subtitle && <p className="text-xs text-[#525252] mt-1">{subtitle}</p>}
    </div>
  );
}
