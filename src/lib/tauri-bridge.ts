/** Browser file helpers shared by PDF tools. */

export interface FileFilter {
  name: string;
  extensions: string[];
}

const browserFileStore = new Map<string, File>();

export async function openFiles(filters: FileFilter[] = []): Promise<string[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    if (filters.length > 0) {
      const exts = filters.flatMap(f => f.extensions.map(ext => `.${ext}`));
      input.accept = exts.join(',');
    }

    input.onchange = () => {
      if (input.files) {
        const files = Array.from(input.files).map((file) => {
          const browserPath = `__browser__/${crypto.randomUUID()}/${file.name}`;
          browserFileStore.set(browserPath, file);
          return browserPath;
        });
        resolve(files);
      } else {
        resolve([]);
      }
    };

    input.click();
  });
}

export function getFiltersForFilename(filename: string): FileFilter[] {
  const parts = filename.split('.');
  const ext = parts.length > 1 ? parts.pop()?.toLowerCase() : undefined;
  if (!ext) {
    return [{ name: 'All Files', extensions: ['*'] }];
  }

  const extMap: Record<string, string> = {
    pdf: 'PDF Document',
    xlsx: 'Excel Spreadsheet',
    xls: 'Excel Spreadsheet',
    docx: 'Word Document',
    doc: 'Word Document',
    pptx: 'PowerPoint Presentation',
    ppt: 'PowerPoint Presentation',
    png: 'PNG Image',
    jpg: 'JPEG Image',
    jpeg: 'JPEG Image',
    webp: 'WebP Image',
    svg: 'SVG Image',
    zip: 'ZIP Archive',
    txt: 'Text Document',
    json: 'JSON Document',
    csv: 'CSV Document',
  };

  const label = extMap[ext] || `${ext.toUpperCase()} File`;
  return [
    { name: label, extensions: [ext] },
    { name: 'All Files', extensions: ['*'] },
  ];
}

export async function saveFile(suggestedName: string, filters: FileFilter[] = []): Promise<string | null> {
  return suggestedName.replace(/^[/\\]+/, '');
}

export async function readFileBytes(path: string): Promise<Uint8Array> {
  const file = browserFileStore.get(path);
  if (!file) {
    throw new Error(`File not found in browser session: ${path}`);
  }

  const buffer = await file.arrayBuffer();
  return new Uint8Array(buffer);
}

export async function writeFileBytes(path: string, data: Uint8Array): Promise<void> {
  const blobData = new Uint8Array(data.byteLength);
  blobData.set(data);
  const blob = new Blob([blobData.buffer]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const filename = path.split('/').pop() || path.split('\\').pop() || 'download.bin';
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Saves a Blob or byte array to disk.
 * Triggers a standard browser download via a temporary anchor element.
 *
 * @param fileData Blob or Uint8Array containing file content
 * @param suggestedName Suggested filename (e.g., 'converted.pdf')
 * @param filters Optional file dialog filters
 * @returns Promise<boolean> Returns true if file was saved / downloaded, false if cancelled by user.
 */
export async function saveBlobFile(
  fileData: Blob | Uint8Array,
  suggestedName: string,
  filters?: FileFilter[]
): Promise<boolean> {
  let blob: Blob;
  if (fileData instanceof Blob) {
    blob = fileData;
  } else {
    const copy = new Uint8Array(fileData.byteLength);
    copy.set(fileData);
    blob = new Blob([copy.buffer]);
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = suggestedName;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
  return true;
}

/**
 * Opens a URL in a new browser tab.
 */
export async function openExternalUrl(url: string): Promise<boolean> {
  if (!url) return false;

  if (typeof window !== 'undefined') {
    try {
      const win = window.open(url, '_blank', 'noopener,noreferrer');
      if (win) return true;
    } catch {
      // ignore
    }

    try {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
      }, 100);
      return true;
    } catch (e) {
      console.error('Failed to open link via fallback anchor:', e);
    }
  }

  return false;
}

