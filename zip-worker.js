import { zipSync, unzipSync } from './vendor/fflate.js';

self.onmessage = ({ data: { files, limit, level = 1 } }) => {
  try {
    const entries = Object.create(null);
    for (const file of files) entries[file.path] = file.data;
    const bytes = zipSync(entries, { level, mtime: new Date('1980-01-01T00:00:00Z') });
    if (limit !== null && bytes.length > limit) { self.postMessage({ error: 'size', size: bytes.length }); return; }
    const reopened = unzipSync(bytes);
    if (Object.keys(reopened).length !== files.length) throw new Error('Entry count mismatch');
    for (const file of files) {
      const result = reopened[file.path];
      if (!result || result.length !== file.data.length || result.some((byte, i) => byte !== file.data[i])) throw new Error('Archive verification failed');
    }
    self.postMessage({ bytes }, [bytes.buffer]);
  } catch { self.postMessage({ error: 'build' }); }
};
