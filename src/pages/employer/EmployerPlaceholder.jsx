import { Link } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';

export const EmployerPlaceholder = ({ title = 'Employer Page' }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
      <Construction className="h-6 w-6" />
    </div>
    <h1 className="mt-4 text-xl font-extrabold text-slate-900">{title}</h1>
    <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-slate-500">
      This employer section is ready in the new layout. Detailed tools can be connected here next.
    </p>
    <Link
      to="/employer"
      className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Dashboard
    </Link>
  </div>
);

export default EmployerPlaceholder;
