export const getNextMasterId = async (axiosInstance, url, idField) => {
  const separator = url.includes('?') ? '&' : '?';
  const response = await axiosInstance.get(`${url}${separator}includeDeleted=true`);
  const rows = Array.isArray(response.data) ? response.data : response.data.docs || [];
  const maxId = rows.reduce((max, item) => {
    const num = parseInt(item[idField], 10);
    return !Number.isNaN(num) && num > max ? num : max;
  }, 0);
  return String(maxId + 1);
};

export const getNextSortNo = async (axiosInstance, url, sortField = 'sortingNo') => {
  const response = await axiosInstance.get(url);
  const rows = Array.isArray(response.data) ? response.data : response.data.docs || [];
  const maxSort = rows.reduce((max, item) => {
    const num = Number(item[sortField]);
    return Number.isFinite(num) && num > max ? num : max;
  }, 0);
  return String(maxSort + 1);
};

export const onlyDigits = (value) => value.replace(/\D/g, '');

export const toWholeNumber = (value) => Number(onlyDigits(String(value))) || 0;

export const sortByText = (rows, field) => (
  [...rows].sort((a, b) => String(a[field] || '').localeCompare(String(b[field] || ''), undefined, { sensitivity: 'base' }))
);
