export const EmployerFooter = () => (
  <footer className="border-t border-slate-200 bg-white px-4 py-4 text-xs font-semibold text-slate-400 md:px-6 lg:px-8">
    <div className="flex flex-col justify-between gap-2 sm:flex-row">
      <span>© {new Date().getFullYear()} JobsWaale Employer Portal</span>
      <a
        href="https://www.dukeinfosys.com"
        target="_blank"
        rel="noopener noreferrer"
        className="transition-colors hover:text-[#6658dd]"
      >
        Powered by Duke Infosys
      </a>
    </div>
  </footer>
);

export default EmployerFooter;
