const SkeletonBlock = ({ className = '' }) => (
  <div className={`animate-pulse rounded bg-slate-200/80 ${className}`} />
);

export const PageSkeleton = ({ variant = 'dashboard', rows = 6 }) => {
  if (variant === 'chat') {
    return (
      <div className="grid min-h-[520px] gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-md border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4">
            <SkeletonBlock className="h-10 w-full rounded-md" />
          </div>
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="flex gap-3 p-4">
                <SkeletonBlock className="h-11 w-11 rounded-full" />
                <div className="flex-1 space-y-2">
                  <SkeletonBlock className="h-4 w-3/5" />
                  <SkeletonBlock className="h-3 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </aside>
        <section className="flex flex-col rounded-md border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 p-4">
            <SkeletonBlock className="h-11 w-11 rounded-full" />
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-36" />
              <SkeletonBlock className="h-3 w-24" />
            </div>
          </div>
          <div className="flex-1 space-y-4 p-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBlock
                key={index}
                className={`h-12 rounded-2xl ${index % 2 ? 'ml-auto w-2/5' : 'w-3/5'}`}
              />
            ))}
          </div>
          <div className="border-t border-slate-100 p-4">
            <SkeletonBlock className="h-12 w-full rounded-md" />
          </div>
        </section>
      </div>
    );
  }

  if (variant === 'form') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <SkeletonBlock className="h-7 w-52" />
            <SkeletonBlock className="h-4 w-72" />
          </div>
          <SkeletonBlock className="h-10 w-28 rounded-md" />
        </div>
        <div className="rounded-md border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex gap-3 overflow-hidden">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-10 w-32 rounded-md" />
            ))}
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <SkeletonBlock className="h-4 w-28" />
                <SkeletonBlock className="h-11 w-full rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'subscription') {
    return (
      <div className="space-y-6">
        <div className="rounded-md border border-slate-100 bg-white p-6 shadow-sm">
          <SkeletonBlock className="mb-3 h-7 w-56" />
          <SkeletonBlock className="h-4 w-80 max-w-full" />
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-md border border-slate-100 bg-white p-6 shadow-sm">
              <SkeletonBlock className="mb-5 h-6 w-36" />
              <SkeletonBlock className="mb-6 h-10 w-28" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, rowIndex) => (
                  <SkeletonBlock key={rowIndex} className="h-4 w-full" />
                ))}
              </div>
              <SkeletonBlock className="mt-6 h-11 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SkeletonBlock className="h-7 w-52" />
          <SkeletonBlock className="h-10 w-40 rounded-md" />
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="rounded-md border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <SkeletonBlock className="h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <SkeletonBlock className="h-5 w-4/5" />
                  <SkeletonBlock className="h-4 w-3/5" />
                </div>
              </div>
              <div className="space-y-3">
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="h-4 w-5/6" />
                <SkeletonBlock className="h-9 w-28 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'detail') {
    return (
      <div className="space-y-6">
        <div className="rounded-md border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-start">
            <SkeletonBlock className="h-20 w-20 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-3">
              <SkeletonBlock className="h-7 w-2/3 max-w-xl" />
              <SkeletonBlock className="h-4 w-1/2 max-w-md" />
              <div className="flex flex-wrap gap-2 pt-2">
                <SkeletonBlock className="h-8 w-24 rounded-full" />
                <SkeletonBlock className="h-8 w-28 rounded-full" />
                <SkeletonBlock className="h-8 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-md border border-slate-100 bg-white p-6 shadow-sm">
            <SkeletonBlock className="mb-5 h-5 w-40" />
            <div className="space-y-3">
              {Array.from({ length: 7 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-4 w-full" />
              ))}
            </div>
          </div>
          <div className="rounded-md border border-slate-100 bg-white p-6 shadow-sm">
            <SkeletonBlock className="mb-5 h-5 w-32" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <SkeletonBlock className="h-6 w-44" />
            <SkeletonBlock className="h-4 w-64" />
          </div>
          <SkeletonBlock className="h-10 w-36 rounded-md" />
        </div>
        <div className="rounded-md border border-slate-100 bg-white shadow-sm">
          <div className="grid gap-4 border-b border-slate-100 p-5 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-10 w-full rounded-md" />
            ))}
          </div>
          <div className="divide-y divide-slate-100">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div key={rowIndex} className="grid gap-4 p-5 sm:grid-cols-[1.5fr_1fr_1fr_120px]">
                <SkeletonBlock className="h-5 w-full" />
                <SkeletonBlock className="h-5 w-4/5" />
                <SkeletonBlock className="h-5 w-3/5" />
                <SkeletonBlock className="h-8 w-full rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <SkeletonBlock className="h-7 w-48" />
          <SkeletonBlock className="h-4 w-72" />
        </div>
        <SkeletonBlock className="h-10 w-32 rounded-md" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-md border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <SkeletonBlock className="h-12 w-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="h-7 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, cardIndex) => (
          <div key={cardIndex} className="rounded-md border border-slate-100 bg-white p-6 shadow-sm">
            <SkeletonBlock className="mb-5 h-5 w-40" />
            <div className="space-y-3">
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <SkeletonBlock key={rowIndex} className="h-4 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PageSkeleton;
