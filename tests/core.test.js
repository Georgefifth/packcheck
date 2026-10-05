import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanPath, isJunk, checkPlan, MAX_BYTES } from '../core.js';
import { zipSync, unzipSync } from '../vendor/fflate.js';
const make = (target, text = 'test', include = true) => ({ id: target, target, data: new TextEncoder().encode(text), include });
const config = { archiveName: '123_A2.zip' };

test('rejects traversal, ambiguous paths and Windows reserved names', () => {
  for (const path of ['../secret.txt', '/root.txt', 'src\\main.py', 'src//main.py', 'src/../main.py', 'CON.txt', 'src/NUL', 'file. ', 'a:b.txt', '__proto__']) assert.equal(cleanPath(path), null, path);
  assert.equal(cleanPath('src/你好.py'), 'src/你好.py');
});
test('exact requirements distinguish case and folders', () => {
  const plan = checkPlan([make('report.pdf', '%PDF-1.4'), make('src/main.py')], { ...config, required: 'report.pdf\nsrc/\nREADME.md\nReport.pdf' });
  assert.deepEqual(plan.requirements.map(r => r.found), [true, true, false, false]);
  assert.equal(plan.errors.filter(e => e.code === 'missing').length, 2);
});
test('excluded entries cannot satisfy requirements', () => {
  assert.equal(checkPlan([make('README.md', 'test', false)], { ...config, required: 'README.md' }).requirements[0].found, false);
});
test('case variants cannot silently overwrite entries on common filesystems', () => {
  assert.ok(checkPlan([make('Report.txt'), make('report.txt')], config).errors.some(e => e.code === 'duplicate'));
});
test('file-directory conflicts are blocked', () => {
  assert.ok(checkPlan([make('src'), make('src/main.py')], config).errors.some(e => e.code === 'conflict'));
});
test('mislabelled PDF cannot be fixed by renaming plain text', () => {
  assert.ok(checkPlan([make('report.pdf', 'not a PDF')], config).errors.some(e => e.code === 'signature'));
  assert.equal(checkPlan([make('report.pdf', '%PDF-1.4\n')], config).errors.length, 0);
});
test('empty source files are warnings rather than automatic errors', () => {
  const plan = checkPlan([make('src/__init__.py', '')], config);
  assert.equal(plan.errors.length, 0);
  assert.equal(plan.warnings[0].code, 'empty');
});
test('metadata exclusion is specific, legitimate dotfiles remain available', () => {
  for (const name of ['.DS_Store', '__MACOSX/._report.pdf', '.git/config', 'src/._main.py']) assert.equal(isJunk(name), true);
  for (const name of ['.gitignore', '.env.example', 'src/main.py']) assert.equal(isJunk(name), false);
});
test('filename and size settings are validated', () => {
  for (const archiveName of ['result.txt', '../result.zip', 'src/result.zip', '']) assert.ok(checkPlan([make('file.txt')], { archiveName }).errors.some(e => e.code === 'archive'));
  for (const limitMB of ['0', '-1', 'nope', 'Infinity']) assert.ok(checkPlan([make('file.txt')], { ...config, limitMB }).errors.some(e => e.code === 'limit'));
  assert.equal(checkPlan([make('file.txt')], { ...config, limitMB: '0.5' }).limit, 524288);
});
test('capacity is bounded', () => {
  assert.ok(checkPlan([{ ...make('large.bin'), data: new Uint8Array(MAX_BYTES + 1) }], config).errors.some(e => e.code === 'capacity'));
});
test('archive round-trip preserves Unicode paths, binary data and an empty file', () => {
  const files = Object.create(null);
  files['src/你好.py'] = new Uint8Array([0, 1, 2, 255]); files['src/__init__.py'] = new Uint8Array();
  const zip = zipSync(files, { level: 1 });
  const reopened = unzipSync(zip);
  assert.deepEqual(Object.keys(reopened), Object.keys(files));
  for (const name in files) assert.deepEqual(reopened[name], files[name]);
});
test('outer folder preserves relative requirement checks and adds actual archive paths', () => {
  const plan = checkPlan([make('report.pdf', '%PDF-1.4'), make('src/main.py')], { ...config, rootFolder: '123_A2', required: 'report.pdf\nsrc/' });
  assert.equal(plan.errors.length, 0);
  assert.deepEqual(plan.archivePaths, ['123_A2/report.pdf', '123_A2/src/main.py']);
  assert.ok(plan.requirements.every(r => r.found));
});
test('invalid folder wrapper and compression cannot reach the archive worker', () => {
  assert.ok(checkPlan([make('a.txt')], { ...config, rootFolder: '../folder' }).errors.some(e => e.code === 'root'));
  for (const compression of [0, 2, 10, 'nope']) assert.ok(checkPlan([make('a.txt')], { ...config, compression }).errors.some(e => e.code === 'compression'));
  for (const compression of [1, 6, 9]) assert.equal(checkPlan([make('a.txt')], { ...config, compression }).level, compression);
});
