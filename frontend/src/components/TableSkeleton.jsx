export default function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b border-[#2A2A2A]">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 bg-[#2A2A2A] rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
