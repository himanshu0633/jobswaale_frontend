const extensionByMimeType = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx'
};

const safeBaseName = (value) =>
  String(value || 'candidate')
    .replace(/[^a-z0-9_-]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'candidate';

const filenameFromDisposition = (disposition = '') => {
  const encodedMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (encodedMatch?.[1]) {
    try {
      return decodeURIComponent(encodedMatch[1].trim().replace(/^"|"$/g, ''));
    } catch {
      return encodedMatch[1].trim().replace(/^"|"$/g, '');
    }
  }

  const plainMatch = disposition.match(/filename="?([^";]+)"?/i);
  return plainMatch?.[1]?.trim() || '';
};

export const downloadBlobResponse = (response, fallbackName = 'candidate-resume') => {
  const contentType = String(response.headers?.['content-type'] || response.data?.type || '').split(';')[0].trim();
  const headerName = filenameFromDisposition(response.headers?.['content-disposition'] || '');
  const fallbackExt = extensionByMimeType[contentType] || '.pdf';
  const fallback = /\.[a-z0-9]+$/i.test(fallbackName)
    ? fallbackName
    : `${safeBaseName(fallbackName)}${fallbackExt}`;
  const filename = headerName || fallback;

  const blob = response.data instanceof Blob
    ? response.data
    : new Blob([response.data], { type: contentType || 'application/octet-stream' });
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};
