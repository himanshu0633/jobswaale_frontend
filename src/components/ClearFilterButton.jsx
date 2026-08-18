import { RefreshCw } from 'lucide-react';

const ClearFilterButton = ({ active, onClick, className = '', label = 'Clear Filter' }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={!active}
    className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-extrabold transition xl:w-auto ${
      active
        ? 'animate-pulse border border-rose-200 bg-rose-500 text-white shadow-md shadow-rose-500/20 hover:bg-rose-600'
        : 'border border-slate-200 bg-slate-100 text-slate-400'
    } disabled:cursor-not-allowed ${className}`}
  >
    <RefreshCw className={`h-4 w-4 ${active ? 'animate-spin' : ''}`} />
    {label}
  </button>
);

export default ClearFilterButton;
