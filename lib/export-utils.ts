export const DOWNLOAD_CLEANUP_DELAY_MS = 1000;

type DownloadAnchor = {
  href: string;
  download: string;
  rel: string;
  click: () => void;
  remove: () => void;
};

export type DownloadEnvironment = {
  createAnchor: () => DownloadAnchor;
  appendAnchor: (anchor: DownloadAnchor) => void;
  createObjectURL: (blob: Blob) => string;
  revokeObjectURL: (url: string) => void;
  scheduleCleanup: (callback: () => void, delayMs: number) => void;
};

function browserDownloadEnvironment(): DownloadEnvironment {
  if (typeof document === 'undefined' || typeof URL === 'undefined' || typeof window === 'undefined') {
    throw new Error('Downloads are unavailable in this environment.');
  }
  return {
    createAnchor: () => document.createElement('a'),
    appendAnchor: (anchor) => document.body.appendChild(anchor as unknown as Node),
    createObjectURL: (blob) => URL.createObjectURL(blob),
    revokeObjectURL: (url) => URL.revokeObjectURL(url),
    scheduleCleanup: (callback, delayMs) => { window.setTimeout(callback, delayMs); },
  };
}

export function downloadBlob(blob: Blob, filename: string, environment = browserDownloadEnvironment()) {
  const url = environment.createObjectURL(blob);
  const anchor = environment.createAnchor();
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  environment.appendAnchor(anchor);
  try {
    anchor.click();
  } catch (error) {
    anchor.remove();
    environment.revokeObjectURL(url);
    throw error;
  }
  environment.scheduleCleanup(() => {
    anchor.remove();
    environment.revokeObjectURL(url);
  }, DOWNLOAD_CLEANUP_DELAY_MS);
  return { filename, url };
}

export function downloadText(content: string, filename: string, type = 'text/plain', environment?: DownloadEnvironment) {
  return downloadBlob(new Blob([content], { type }), filename, environment);
}

export type PngCaptureResult =
  | { ok: true; blob: Blob }
  | { ok: false; message: string };

const PNG_FAILURE_MESSAGE = 'PNG export failed: no valid image was generated. Try again.';

export function requestPngBlob(canvas: Pick<HTMLCanvasElement, 'toBlob'>): Promise<PngCaptureResult> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (result: PngCaptureResult) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
    try {
      canvas.toBlob((blob) => {
        try {
          if (!blob || blob.size === 0 || blob.type !== 'image/png') {
            finish({ ok: false, message: PNG_FAILURE_MESSAGE });
            return;
          }
          finish({ ok: true, blob });
        } catch {
          finish({ ok: false, message: PNG_FAILURE_MESSAGE });
        }
      }, 'image/png');
    } catch {
      finish({ ok: false, message: PNG_FAILURE_MESSAGE });
    }
  });
}
