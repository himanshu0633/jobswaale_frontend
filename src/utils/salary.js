const normalized = (value = '') => String(value || '').trim().toLowerCase();

export const isMonthlySalaryUnit = (value = '') => {
  const text = normalized(value);
  return text.includes('month') || text.includes('monthly') || text.includes('/mo') || text.includes('p.m') || text.includes('pm');
};

export const isAnnualSalaryUnit = (value = '') => {
  const text = normalized(value);
  return text.includes('lpa') || text.includes('year') || text.includes('annual') || text.includes('p.a') || text.includes('pa');
};

export const amountToAnnualLacs = (amount, unitText = '') => {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) return null;
  if (isMonthlySalaryUnit(unitText)) {
    return value >= 100000 ? (value / 100000) * 12 : (value * 12) / 100000;
  }
  if (isAnnualSalaryUnit(unitText)) {
    return value >= 100000 ? value / 100000 : value;
  }
  return value >= 100000 ? value / 100000 : value;
};

export const getAnnualSalaryRangeLacs = (job = {}) => {
  const unitText = `${job.salaryUnit || ''} ${job.salary || ''}`;
  const min = Number(job.minSalary);
  const max = Number(job.maxSalary);
  if (Number.isFinite(min) || Number.isFinite(max)) {
    const minAnnual = Number.isFinite(min) ? amountToAnnualLacs(min, unitText) : null;
    const maxAnnual = Number.isFinite(max) ? amountToAnnualLacs(max, unitText) : minAnnual;
    return {
      min: minAnnual ?? maxAnnual,
      max: maxAnnual ?? minAnnual,
    };
  }

  const text = String(job.salary || '');
  const numbers = text.match(/\d+(?:\.\d+)?/g)?.map(Number).filter(Number.isFinite) || [];
  const converted = numbers
    .map(amount => amountToAnnualLacs(amount, text))
    .filter(amount => amount !== null);
  if (!converted.length) return null;
  return {
    min: Math.min(...converted),
    max: Math.max(...converted),
  };
};

const formatMonthlyAmount = (amount) => {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${Math.round(amount / 1000)}k`;
};

const formatAnnualAmount = (amount) => {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(0)} LPA`;
  return `₹${amount}`;
};

export const formatJobSalary = (job = {}) => {
  if (job.salary) return job.salary;
  const min = Number(job.minSalary);
  const max = Number(job.maxSalary);
  const hasMin = Number.isFinite(min) && min > 0;
  const hasMax = Number.isFinite(max) && max > 0;
  if (!hasMin && !hasMax) return 'Not Specified';

  const unit = job.salaryUnit || 'P.A.';
  const formatter = isMonthlySalaryUnit(unit) ? formatMonthlyAmount : formatAnnualAmount;
  const range = hasMin && hasMax
    ? `${formatter(min)} - ${formatter(max)}`
    : formatter(hasMin ? min : max);
  return `${range} ${unit}`.trim();
};

export const annualLacsToMonthlyText = (lacs) => {
  const monthly = Math.round((Number(lacs) * 100000) / 12);
  if (!Number.isFinite(monthly) || monthly <= 0) return '';
  return `${formatMonthlyAmount(monthly)}/mo`;
};
