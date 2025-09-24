import { useState, useCallback } from 'react';
import type { TFile } from 'librechat-data-provider';
import { useToastContext } from '~/Providers/ToastContext';

export type UseDownloadOptions = {
  onDone?: () => void;
  sequential?: boolean;
  resolveUrl?: (file: TFile) => string;
  // fetcher returns a blob + headers; if not supplied we fall back to window.fetch
  fetcher?: (url: string) => Promise<{ blob: Blob; headers: Headers | Record<string, string> }>;
};

async function defaultFetcher(url: string) {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to download');
  return { blob: await res.blob(), headers: res.headers };
}

function defaultResolveUrl(file: TFile) {
  const userId = (file as any).user || '';
  return `/api/files/download/${encodeURIComponent(userId)}/${encodeURIComponent(file.file_id)}`;
}

function getFilenameFromHeader(disposition?: string | null) {
  if (!disposition) return null;
  const star = /filename\*=(?:UTF-8''|)([^;]+)/i.exec(disposition);
  if (star?.[1]) {
    try { return decodeURIComponent(star[1].trim().replace(/^"|"$/g, '')); }
    catch { return star[1].trim().replace(/^"|"$/g, ''); }
  }
  const plain = /filename="?([^";]+)"?/i.exec(disposition);
  return plain?.[1] ? plain[1].trim() : null;
}

export default function useDownloadFilesFromTable(options?: UseDownloadOptions) {
  const { onDone, sequential = false, resolveUrl = defaultResolveUrl, fetcher } = options || {};
  const { showToast } = useToastContext();
  const [isDownloading, setIsDownloading] = useState(false);

  const saveBlob = (file: TFile, blob: Blob, headers: Headers | Record<string, string>) => {
    const get = (k: string) =>
      headers instanceof Headers
        ? headers.get(k)
        : (headers as Record<string, string>)[k.toLowerCase()] || (headers as any)[k];

    const headerName = getFilenameFromHeader(get('content-disposition'));
    const filename = headerName || file.filename || `file-${file.file_id}`;

    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  };

  const downloadFiles = useCallback(async (files: TFile[]) => {
    if (!files?.length) return;

    setIsDownloading(true);
    const errs: string[] = [];
    const doFetch = fetcher ?? defaultFetcher;

    try {
      if (sequential) {
        for (const f of files) {
          const url = resolveUrl(f);
          // eslint-disable-next-line no-await-in-loop
          await doFetch(url)
            .then(({ blob, headers }) => saveBlob(f, blob, headers))
            .catch((e) =>
              errs.push(e?.message || `Failed to download: ${f.filename || f.file_id}`),
            );
        }
      } else {
        await Promise.all(
          files.map(async (f) => {
            const url = resolveUrl(f);
            return doFetch(url)
              .then(({ blob, headers }) => saveBlob(f, blob, headers))
              .catch((e) => errs.push(e?.message || `Failed to download: ${f.filename || f.file_id}`));
          }),
        );
      }
    } finally {
      setIsDownloading(false);
      if (errs.length) {
        showToast({
          status: 'error',
          message: errs.length === 1 ? errs[0] : `Some files failed to download (${errs.length}).`,
          duration: 5000,
        });
      }
      onDone?.();
    }
  }, [fetcher, onDone, resolveUrl, sequential, showToast]);

  return { isDownloading, downloadFiles };
}
