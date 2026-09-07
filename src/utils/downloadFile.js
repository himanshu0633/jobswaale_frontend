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

export const downloadBlobResponse = async (response, fallbackName = 'candidate-resume') => {
  let blob = response.data instanceof Blob
    ? response.data
    : new Blob([response.data], {
        type: String(response.headers?.['content-type'] || '').split(';')[0].trim() || 'application/octet-stream'
      });

  // Check if blob is actually base64-encoded PDF or text/json containing PDF base64
  try {
    const textPreview = await blob.slice(0, 200).text();
    const trimmed = textPreview.trim();
    if (trimmed.startsWith('"JVBERi') || trimmed.startsWith('JVBERi') || (trimmed.startsWith('"') && trimmed.includes('JVBERi'))) {
      const fullText = await blob.text();
      const rawBase64 = fullText.trim().replace(/^"|"$/g, '');
      const binaryString = window.atob(rawBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      blob = new Blob([bytes], { type: 'application/pdf' });
    }
  } catch (e) {
    console.warn('Could not inspect blob content:', e);
  }

  const contentType = blob.type || String(response.headers?.['content-type'] || '').split(';')[0].trim();
  const headerName = filenameFromDisposition(response.headers?.['content-disposition'] || '');
  const fallbackExt = extensionByMimeType[contentType] || '.pdf';
  const fallback = /\.[a-z0-9]+$/i.test(fallbackName)
    ? fallbackName
    : `${safeBaseName(fallbackName)}${fallbackExt}`;
  const filename = headerName || fallback;

  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};
