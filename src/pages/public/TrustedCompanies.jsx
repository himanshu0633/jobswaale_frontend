import React from "react";

const companies = [
  {
    name: "Google",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
  },
  {
    name: "Airbnb",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_Bélo.svg",
  },
  {
    name: "Dropbox",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/78/Dropbox_Icon.svg",
  },
  {
    name: "FedEx",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b0/FedEx_Express.svg",
  },
  {
    name: "Walmart",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Walmart_logo.svg",
  },
  {
    name: "HubSpot",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/HubSpot_Logo.svg",
  },
];

const TrustedCompanies = () => {
  return (
    <section className="mt-[70px] bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h5 className="text-center font-semibold text-lg mb-4 text-slate-900">
          Trusted by 500+ Leading Companies
        </h5>

        <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-8 pt-5 pb-[70px]">
          {companies.map((company) => (
            <div
              key={company.name}
              className="transition-all duration-300 hover:-translate-y-1"
            >
              <img
                src={company.logo}
                alt={company.name}
                className="h-[38px] w-auto grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedCompanies;