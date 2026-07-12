export default function EmptyState({ title, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <svg className="w-12 h-12 text-[#2A2A2A] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
      <p className="text-sm text-[#737373] font-medium">{title || 'No data found'}</p>
      {message && <p className="text-xs text-[#525252] mt-1">{message}</p>}
    </div>
  );
}
