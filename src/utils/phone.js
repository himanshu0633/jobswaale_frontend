export const cleanPhoneInput = (value = '') => (
  value.replace(/[^\d+\-()\s]/g, '').slice(0, 18)
);
