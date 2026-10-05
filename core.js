export const MAX_BYTES = 20 * 1024 * 1024;
export const MAX_FILES = 300;

export function cleanPath(path) {
  const value = String(path).trim().normalize('NFC');
  if (!value || value === '__proto__' || value.startsWith('/') || value.includes('\\') || /[\x00-\x1f<>:"|?*]/u.test(value)) return null;
  const parts = value.split('/');
  if (parts.some(part => !part || part === '.' || part === '..' || /[. ]$/u.test(part) || /^(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/iu.test(part))) return null;
  return value;
}

export function isJunk(path) {
  return path.split('/').some(part => part === '__MACOSX' || part === '.git' || /^\._/u.test(part) || ['.DS_Store', 'Thumbs.db', 'desktop.ini'].includes(part));
}

export function fileProblem(path, data) {
  if (/\.pdf$/iu.test(path) && new TextDecoder().decode(data.slice(0, 5)) !== '%PDF-') return 'pdf';
  if (/\.png$/iu.test(path) && ![137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => data[i] === v)) return 'png';
  if (/\.jpe?g$/iu.test(path) && !(data[0] === 255 && data[1] === 216 && data[2] === 255)) return 'jpeg';
  return null;
}

export function checkPlan(files, { required = '', archiveName = '', limitMB = '', rootFolder = '', compression = 1 } = {}) {
  const selected = files.filter(file => file.include);
  const errors = [];
  const warnings = [];
  const names = new Map();
  const paths = [];
  for (const file of selected) {
    const path = cleanPath(file.target);
    if (!path) { errors.push({ code: 'path', file: file.id, value: file.target }); continue; }
    const key = path.toLocaleLowerCase('en-US');
    if (names.has(key)) errors.push({ code: 'duplicate', file: file.id, value: path });
    names.set(key, file.id);
    paths.push(path);
    const problem = fileProblem(path, file.data);
    if (problem) errors.push({ code: 'signature', file: file.id, value: path, type: problem });
    if (!file.data.length) warnings.push({ code: 'empty', file: file.id, value: path });
    if (isJunk(path)) warnings.push({ code: 'junk', file: file.id, value: path });
  }
  // A file cannot also be the parent directory of another entry.
  for (const path of paths) if (paths.some(other => other !== path && other.toLowerCase().startsWith(`${path.toLowerCase()}/`))) errors.push({ code: 'conflict', value: path });
  const requested = required.split('\n').map(v => v.trim()).filter(Boolean);
  const requirements = requested.map(value => {
    const folder = value.endsWith('/');
    const valid = cleanPath(folder ? value.slice(0, -1) : value);
    const found = Boolean(valid) && paths.some(path => folder ? path.startsWith(`${valid}/`) : path === valid);
    if (!valid) errors.push({ code: 'requirement', value });
    else if (!found) errors.push({ code: 'missing', value });
    return { value, found, valid: Boolean(valid) };
  });
  const archive = cleanPath(archiveName);
  if (!archive || archive.includes('/') || !/\.zip$/iu.test(archive)) errors.push({ code: 'archive', value: archiveName });
  if (!selected.length) errors.push({ code: 'none' });
  const total = selected.reduce((sum, file) => sum + file.data.length, 0);
  if (total > MAX_BYTES || selected.length > MAX_FILES) errors.push({ code: 'capacity' });
  const limit = String(limitMB).trim() ? Number(limitMB) * 1024 * 1024 : null;
  if (limit !== null && (!Number.isFinite(limit) || limit <= 0)) errors.push({ code: 'limit' });
  const root = rootFolder ? cleanPath(rootFolder) : '';
  if (rootFolder && !root) errors.push({ code: 'root', value: rootFolder });
  const level = Number(compression);
  if (![1, 6, 9].includes(level)) errors.push({ code: 'compression' });
  const archivePaths = paths.map(path => root ? `${root}/${path}` : path);
  return { selected, paths, archivePaths, root, level, errors, warnings, requirements, total, limit };
}
