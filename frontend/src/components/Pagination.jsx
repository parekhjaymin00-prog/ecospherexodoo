export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total } = pagination;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-xs text-[#737373]">{total} total results</p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 text-xs text-[#A3A3A3] border border-[#2A2A2A] rounded disabled:opacity-30 hover:bg-[#1F1F1F]"
        >
          Prev
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1.5 text-xs rounded ${
              p === page ? 'bg-white text-black font-medium' : 'text-[#A3A3A3] border border-[#2A2A2A] hover:bg-[#1F1F1F]'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 text-xs text-[#A3A3A3] border border-[#2A2A2A] rounded disabled:opacity-30 hover:bg-[#1F1F1F]"
        >
          Next
        </button>
      </div>
    </div>
  );
}
