import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const getVisiblePages = (currentPage, totalPages) => {
  const maxVisible = 5;
  const start = Math.max(1, Math.min(currentPage - Math.floor(maxVisible / 2), totalPages - maxVisible + 1));
  const end = Math.min(totalPages, start + maxVisible - 1);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

const PagerButton = ({ disabled, onClick, children, label }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    aria-label={label}
    className="flex h-8 min-w-8 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-xs font-bold text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
  >
    {children}
  </button>
);

const AdminPagination = ({
  currentPage,
  entriesPerPage,
  total,
  onPageChange,
  onEntriesPerPageChange,
  label = 'entries',
}) => {
  const totalPages = Math.max(1, Math.ceil(total / entriesPerPage));
  const startIndex = total === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1;
  const endIndex = Math.min(currentPage * entriesPerPage, total);
  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold">
          Showing {startIndex} to {endIndex} of {total} {label}
        </span>
        <select
          value={entriesPerPage}
          onChange={(event) => onEntriesPerPageChange(Number(event.target.value))}
          className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-bold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          {[10, 25, 50, 100].map((value) => (
            <option key={value} value={value}>{value} / page</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <PagerButton disabled={currentPage === 1} onClick={() => onPageChange(1)} label="First page">
          <ChevronsLeft className="h-3.5 w-3.5" />
        </PagerButton>
        <PagerButton disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} label="Previous page">
          <ChevronLeft className="h-3.5 w-3.5" />
        </PagerButton>
        {visiblePages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-xs font-black transition ${
              currentPage === page
                ? 'bg-indigo-600 text-white'
                : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            {page}
          </button>
        ))}
        <PagerButton disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} label="Next page">
          <ChevronRight className="h-3.5 w-3.5" />
        </PagerButton>
        <PagerButton disabled={currentPage === totalPages} onClick={() => onPageChange(totalPages)} label="Last page">
          <ChevronsRight className="h-3.5 w-3.5" />
        </PagerButton>
      </div>
    </div>
  );
};

export default AdminPagination;
