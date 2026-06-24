import React from 'react';

const GoogleLogo = () => (
  <svg className="h-7 text-slate-400 fill-current hover:text-slate-600 transition" viewBox="0 0 24 24">
    <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.113-6.887 4.113-4.816 0-8.73-3.914-8.73-8.73s3.914-8.73 8.73-8.73c2.295 0 4.113.824 5.513 2.187l3.057-3.057C18.232 1.341 15.534 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c6.887 0 12.24-5.48 12.24-12.24 0-.824-.075-1.62-.225-2.39H12.24z"/>
  </svg>
);

const AirbnbLogo = () => (
  <svg className="h-7 text-slate-400 fill-current hover:text-slate-600 transition" viewBox="0 0 24 24">
    <path d="M12 24a2.973 2.973 0 0 1-2.122-.878l-8.694-8.694a5.973 5.973 0 1 1 8.448-8.448L12 8.324l2.368-2.344a5.973 5.973 0 1 1 8.448 8.448l-8.694 8.694A2.973 2.973 0 0 1 12 24zm-6.273-13.727a3.973 3.973 0 0 0 0 5.618l8.273 8.273 8.273-8.273a3.973 3.973 0 1 0-5.618-5.618L12 15.018l-4.654-4.745a3.973 3.973 0 0 0-5.619 0z"/>
  </svg>
);

const DropboxLogo = () => (
  <svg className="h-7 text-slate-400 fill-current hover:text-slate-600 transition" viewBox="0 0 24 24">
    <path d="M6 2.052L0 5.867l6 3.815 6-3.815-6-3.815zm12 0l-6 3.815 6 3.815 6-3.815-6-3.815zM0 13.498l6 3.815 6-3.815-6-3.815-6 3.815zm18-3.815l-6 3.815 6 3.815 6-3.815-6-3.815zm-12 8.8l6 3.975 6-3.975-6-3.815-6 3.815z"/>
  </svg>
);

const FedexLogo = () => (
  <span className="text-xl font-black text-slate-450 select-none tracking-tight hover:text-slate-600 transition">
    Fed<span className="text-slate-400">Ex</span>
  </span>
);

const WalmartLogo = () => (
  <span className="text-xl font-bold text-slate-450 select-none tracking-tighter hover:text-slate-600 transition">
    Wal<span className="text-slate-400 font-medium">mart</span>
  </span>
);

const HubspotLogo = () => (
  <span className="text-xl font-extrabold text-slate-450 select-none tracking-tight hover:text-slate-600 transition">
    Hub<span className="text-slate-400">Spot</span>
  </span>
);

export const TrustedCompanies = () => {
  return (
    <section className="py-16 bg-slate-50 border-t border-slate-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h5 className="font-bold text-sm text-slate-500 text-center uppercase tracking-wider mb-8">
          Trusted by 500+ Leading Companies
        </h5>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          <GoogleLogo />
          <AirbnbLogo />
          <DropboxLogo />
          <FedexLogo />
          <WalmartLogo />
          <HubspotLogo />
        </div>
      </div>
    </section>
  );
};

export default TrustedCompanies;
