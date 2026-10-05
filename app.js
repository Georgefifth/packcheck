import { MAX_BYTES, MAX_FILES, cleanPath, isJunk, checkPlan } from './core.js';

const $ = id => document.getElementById(id);
const copy = {
  en: {
    skip: 'Skip to files', prototype: 'CORE PROTOTYPE', heading: 'Prepare your submission ZIP.', intro: 'Add files, fix the package, download it. Originals stay untouched.', local: 'Local processing · No account',
    files: 'Files to pack', demo: 'Try a messy example', drop: 'Drop files here, or choose from your device', addFiles: 'Add files', addFolder: 'Add folder', capacity: 'Up to 300 files / 20 MiB. Folder imports omit the outer folder.', empty: 'Your package is empty. Add the files you plan to submit.', clear: 'Clear files', output: 'Submission package', archiveName: 'ZIP filename', archiveHint: 'Use the name specified by your assignment.', required: 'Required files or folders', requiredHint: 'Optional. One exact path per line; end folders with /. Case matters.', limit: 'Maximum ZIP size (MiB)', limitHint: 'Checked against the actual compressed ZIP, not an estimate.', build: 'Build ZIP', ready: 'ZIP built and reopened successfully', download: 'Download ZIP ↓', manifest: 'Download file list', help: 'What this prototype checks',
    scope: 'Exact required paths, duplicate names, unsafe paths, basic PDF/PNG/JPEG signatures, and the final ZIP size. It excludes common OS metadata and .git folders by default; you control inclusion. It does not grade work, convert formats, or submit to your course portal.', privacy: 'Files remain in this tab and are cleared on refresh. Text previews are plain text. No analytics, storage, or file uploads.', research: 'Research & prior art', close: 'Close', open: 'Open original file ↗', pathLabel: 'PATH INSIDE ZIP', preview: 'Preview', remove: 'Remove', include: 'Include in ZIP', source: 'Original', excluded: 'Excluded', emptyFile: 'Empty — check intent', signature: 'Format header mismatch', metadata: 'Metadata — check inclusion', keep: 'Included', optional: 'Optional',
    confirmClear: 'Clear these files and the generated ZIP? Originals on your device will not change.', confirmDemo: 'Replace your current package with fictional demo files?', importFailure: 'These files could not be read. Nothing from this selection was added.', importCapacity: 'This selection exceeds the prototype limit of 300 files / 20 MiB. Nothing from this selection was added.', folderDrop: 'For folders, use Add folder. Drag-and-drop accepts individual files only.',
    demoLoaded: 'Fictional example: rename report-final.pdf to report.pdf and notes.txt to README.md. OS metadata is already excluded.', building: 'Building and reopening the ZIP…', buildFailed: 'ZIP creation or verification failed. Your files are still here; try again.', built: 'Build complete. Download your ZIP and upload it to your course portal yourself.', editInvalidated: 'Package changed. Build a new ZIP to include these changes.', sizeFailure: n => `The actual ZIP is ${n}, over your size limit. Exclude files or adjust the limit from your assignment.`,
    count: (n, total) => `${n} of ${total} files included`, imported: n => `${n} files added.`, good: 'No blocking issues in the specified checks. Review the file contents before packing.', notRequired: 'No required paths specified; completeness is not checked.', errors: { path: 'Invalid path', duplicate: 'Duplicate output path (including case variants)', signature: 'Extension does not match the basic file header', conflict: 'A file is also used as a folder', requirement: 'Invalid required path', missing: 'Missing required path', archive: 'Use a plain filename ending in .zip', none: 'Add or include at least one file', capacity: 'Prototype capacity exceeded', limit: 'Size limit must be a positive number' }, more: n => `${n} more issues`,
    textPreview: 'First 8,000 characters, shown as plain text. Preview is not a correctness check.', binaryPreview: 'No inline preview for this format. Open the original file to inspect it.', imagePreview: 'Image preview from your local file.', fixture: 'Fictional demo file; replace it with your actual work.'
  },
  zh: {
    skip: '跳到文件', prototype: '核心原型', heading: '把作业整理成提交用 ZIP。', intro: '添加文件、修正打包内容、下载。原文件保持不变。', local: '本地处理 · 无需账户',
    files: '待打包文件', demo: '试试待整理的示例', drop: '拖入文件，或从设备选择', addFiles: '添加文件', addFolder: '添加文件夹', capacity: '最多300个文件 / 20 MiB。导入文件夹时省略最外层目录。', empty: '还没有文件，请添加准备提交的内容。', clear: '清空文件', output: '提交压缩包', archiveName: 'ZIP 文件名', archiveHint: '使用作业说明要求的文件名。', required: '必需文件或文件夹', requiredHint: '选填，每行一个完整路径；文件夹以 / 结尾。区分大小写。', limit: 'ZIP 大小上限（MiB）', limitHint: '按照生成的真实压缩包检查，不用估算值。', build: '生成 ZIP', ready: 'ZIP 已生成并重新解压核对', download: '下载 ZIP ↓', manifest: '下载文件清单', help: '这个原型检查什么',
    scope: '检查指定路径是否齐全、重复命名、不合规路径、PDF/PNG/JPEG 的基础文件头，以及最终 ZIP 大小。常见系统杂项和 .git 目录默认排除，可自行调整。不批改内容，不转换格式，不代交到课程平台。', privacy: '文件只留在这个标签页，刷新后清空。文本预览按纯文字显示。没有追踪、持久存储或文件上传。', research: '调研与现成方案', close: '关闭', open: '打开原文件 ↗', pathLabel: 'ZIP 内的路径', preview: '预览', remove: '移除', include: '收入 ZIP', source: '原文件', excluded: '已排除', emptyFile: '空文件 — 请核实', signature: '格式与文件头不符', metadata: '系统杂项 — 请核实', keep: '已收录', optional: '选填',
    confirmClear: '清空这些文件和已生成的 ZIP？设备上的原文件不会改变。', confirmDemo: '用虚构示例文件替换当前打包内容？', importFailure: '无法读取这些文件，本次选择的文件未被添加。', importCapacity: '本次选择超出300个文件 / 20 MiB 的原型上限，没有添加这些文件。', folderDrop: '文件夹请通过“添加文件夹”导入；拖放只接受单个文件。',
    demoLoaded: '虚构示例：把 report-final.pdf 改为 report.pdf，把 notes.txt 改为 README.md。系统杂项已默认排除。', building: '正在生成并重新解压 ZIP……', buildFailed: '生成或核对 ZIP 失败。你的文件仍在，可以重试。', built: '已生成。请下载 ZIP，再自行上传到课程平台。', editInvalidated: '打包内容已修改，请重新生成 ZIP。', sizeFailure: n => `实际 ZIP 大小为 ${n}，超过设定上限。请排除文件，或根据作业说明调整上限。`,
    count: (n, total) => `已收录 ${n} / ${total} 个文件`, imported: n => `已添加 ${n} 个文件。`, good: '指定检查没有发现阻断问题，请先核实文件内容再打包。', notRequired: '未指定必需路径，暂不检查文件是否齐全。', errors: { path: '路径无效', duplicate: '输出路径重复（包括大小写差异）', signature: '扩展名与基础文件头不符', conflict: '同一路径被同时用作文件和目录', requirement: '必需路径无效', missing: '缺少必需路径', archive: '请用不含目录的 .zip 文件名', none: '请至少添加或收录一个文件', capacity: '超过原型容量', limit: '大小上限必须为正数' }, more: n => `另有 ${n} 个问题`,
    textPreview: '以纯文字显示前8,000个字符；预览不能判定内容正确。', binaryPreview: '此格式暂无内嵌预览，请打开原文件检查。', imagePreview: '来自本地文件的图片预览。', fixture: '虚构演示文件，请使用你自己的作业。'
  }
};
Object.assign(copy.en, {
  undo: 'Undo removal', options: 'Package options', rootFolder: 'Outer folder inside ZIP', rootHint: 'Wrap all included files in this folder. Required paths above refer to its contents.', compression: 'Compression', fast: 'Fast', balanced: 'Balanced', compact: 'Smallest', retryCompression: 'Try stronger compression', jumpPackage: 'Package ↓', chooseFile: 'Choose a file…', usePath: 'Use this path', moveFolder: 'Move into folder', mapped: (from, to) => `${from} → ${to}. Original unchanged.`, undone: 'File restored.', mobile: (n, issues) => `${n} files · ${issues} issues`, zipFiles: n => `${n} files`
});
Object.assign(copy.zh, {
  undo: '撤销移除', options: '打包选项', rootFolder: 'ZIP 内的最外层目录', rootHint: '把所有收录文件放进这个目录。上方必需路径指的是此目录里面的内容。', compression: '压缩方式', fast: '快速', balanced: '均衡', compact: '尽量小', retryCompression: '尝试更强压缩', jumpPackage: '压缩包 ↓', chooseFile: '选择对应文件……', usePath: '使用此路径', moveFolder: '移入文件夹', mapped: (from, to) => `${from} → ${to}，原文件未改变。`, undone: '已恢复文件。', mobile: (n, issues) => `${n} 个文件 · ${issues} 个问题`, zipFiles: n => `${n} 个文件`
});
Object.assign(copy.en.errors, { root: 'Invalid outer folder path', compression: 'Choose a supported compression setting' });
Object.assign(copy.zh.errors, { root: '最外层目录路径无效', compression: '请选择支持的压缩方式' });
let language = 'en';
let files = [];
let lastRemoved;
let nextId = 0;
let busy = false;
let worker;
let zipUrl;
let previewUrl;
let builtZip;
const t = () => copy[language];
const bytes = n => n < 1024 ? `${n} B` : n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KiB` : `${(n / 1024 / 1024).toFixed(2)} MiB`;
const options = () => ({ required: $('required').value, archiveName: $('archiveName').value, limitMB: $('limit').value, rootFolder: $('rootFolder').value, compression: $('compression').value });
const node = (tag, cls, text) => { const el = document.createElement(tag); if (cls) el.className = cls; if (text !== undefined) el.textContent = text; return el; };

function invalidate() {
  if (zipUrl) URL.revokeObjectURL(zipUrl);
  zipUrl = undefined; builtZip = undefined;
  if (!$('ready').hidden) $('buildStatus').textContent = t().editInvalidated;
  else $('buildStatus').textContent = '';
  $('ready').hidden = true;
  $('retryCompression').hidden = true;
  $('download').removeAttribute('href');
}

function renderPlan() {
  const plan = checkPlan(files, options());
  $('checks').replaceChildren();
  if (!files.length) {
    $('checks').append(node('p', 'check-message warn', t().errors.none));
  } else {
    plan.errors.slice(0, 7).forEach(error => $('checks').append(node('p', 'check-message', `${t().errors[error.code]}${error.value ? `: ${error.value}` : ''}`)));
    if (plan.errors.length > 7) $('checks').append(node('p', 'check-message', t().more(plan.errors.length - 7)));
    if (!plan.errors.length) $('checks').append(node('p', 'check-message ok', t().good));
    if (plan.warnings.length) $('checks').append(node('p', 'check-message warn', `${plan.warnings.filter(w => w.code === 'empty').length ? t().emptyFile : t().metadata}: ${plan.warnings.map(w => w.value).join(', ')}`));
  }
  $('requirements').replaceChildren();
  if (!plan.requirements.length) $('requirements').append(node('p', '', t().notRequired));
  else plan.requirements.forEach((req, index) => {
    const item = node('div', 'requirement');
    item.append(node('span', '', `${req.found ? '✓' : '○'} ${plan.root ? `${plan.root}/` : ''}${req.value}`));
    if (!req.found && req.valid) {
      const candidates = files.filter(file => !plan.requirements.some(other => other.found && (other.value.endsWith('/') ? file.target.startsWith(other.value) : file.target === other.value)));
      if (candidates.length) {
        const controls = node('div', 'requirement-fix');
        const choose = node('select'); choose.id = `choose-${index}`; choose.setAttribute('aria-label', `${t().chooseFile} ${req.value}`);
        const blank = node('option', '', t().chooseFile); blank.value = ''; choose.append(blank);
        candidates.forEach(file => { const option = node('option', '', `${file.original}${file.include ? '' : ` (${t().excluded})`}`); option.value = String(file.id); choose.append(option); });
        choose.disabled = busy;
        const apply = node('button', 'secondary', req.value.endsWith('/') ? t().moveFolder : t().usePath); apply.type = 'button'; apply.disabled = true;
        apply.setAttribute('aria-label', `${apply.textContent}: ${req.value}`);
        choose.addEventListener('change', () => { apply.disabled = busy || choose.value === ''; });
        apply.addEventListener('click', () => {
          const file = files.find(file => String(file.id) === choose.value);
          if (!file) return;
          file.target = req.value.endsWith('/') ? `${req.value}${file.target.split('/').pop()}` : req.value;
          file.include = true; invalidate(); renderFiles();
          $('importStatus').textContent = t().mapped(file.original, file.target);
          $(`path-${file.id}`).focus();
        });
        controls.append(choose, apply); item.append(controls);
      }
    }
    $('requirements').append(item);
  });
  $('build').disabled = busy || Boolean(plan.errors.length);
  $('fileSummary').textContent = `${t().count(plan.selected.length, files.length)} · ${bytes(plan.total)}`;
  $('mobileSummary').textContent = t().mobile(plan.selected.length, plan.errors.filter(error => error.code !== 'none').length);
  $('drop').classList.toggle('compact', Boolean(files.length));
  document.querySelectorAll('.file-row').forEach(row => {
    const file = files.find(f => f.id === Number(row.dataset.id));
    const error = plan.errors.some(e => e.file === file.id);
    const warning = plan.warnings.some(w => w.file === file.id);
    const badge = row.querySelector('.badge');
    badge.textContent = !file.include ? t().excluded : error ? t().signature : warning ? t().emptyFile : t().keep;
    // Exact issue details are in the package check panel; this badge is only a summary.
    if (error) badge.textContent = t().errors[plan.errors.find(e => e.file === file.id).code];
    if (warning) badge.textContent = plan.warnings.find(w => w.file === file.id).code === 'empty' ? t().emptyFile : t().metadata;
    badge.className = `badge${error ? ' bad' : warning ? ' warn' : ''}`;
    row.classList.toggle('excluded', !file.include);
  });
  return plan;
}

function renderFiles() {
  $('fileList').replaceChildren();
  $('empty').hidden = Boolean(files.length);
  $('fileFooter').hidden = !files.length && !lastRemoved;
  $('undo').hidden = !lastRemoved;
  for (const file of files) {
    const row = node('div', 'file-row'); row.dataset.id = file.id;
    const include = node('input'); include.type = 'checkbox'; include.checked = file.include; include.setAttribute('aria-label', `${t().include}: ${file.original}`);
    include.addEventListener('change', () => { file.include = include.checked; invalidate(); renderPlan(); });
    const content = node('div');
    const label = node('label', 'target-label', t().pathLabel); label.htmlFor = `path-${file.id}`;
    const path = node('input', 'path'); path.id = label.htmlFor; path.value = file.target; path.spellcheck = false; path.maxLength = 250;
    path.setAttribute('aria-describedby', `original-${file.id}`);
    path.addEventListener('input', () => { file.target = path.value; invalidate(); renderPlan(); });
    const original = node('span', 'file-original', `${t().source}: ${file.original}`); original.id = `original-${file.id}`;
    const meta = node('div', 'file-meta'); meta.append(node('span', '', bytes(file.data.length)), node('span', 'badge'));
    content.append(label, path, original, meta);
    const actions = node('div', 'row-actions');
    const preview = node('button', 'quiet', t().preview); preview.type = 'button'; preview.setAttribute('aria-label', `${t().preview}: ${file.original}`); preview.addEventListener('click', () => showPreview(file));
    const remove = node('button', 'quiet danger', t().remove); remove.type = 'button'; remove.setAttribute('aria-label', `${t().remove}: ${file.original}`); remove.addEventListener('click', () => { lastRemoved = { file, index: files.findIndex(f => f.id === file.id) }; files = files.filter(f => f.id !== file.id); invalidate(); renderFiles(); $('undo').focus(); });
    actions.append(preview, remove); row.append(include, content, actions); $('fileList').append(row);
  }
  renderPlan();
}

async function importFiles(list, folder = false) {
  if (busy || !list.length) return;
  const incoming = [...list];
  if (files.length + incoming.length > MAX_FILES || files.reduce((n, f) => n + f.data.length, 0) + incoming.reduce((n, f) => n + f.size, 0) > MAX_BYTES) { $('importStatus').textContent = t().importCapacity; return; }
  setBusy(true);
  try {
    const additions = await Promise.all(incoming.map(async file => {
      const original = file.webkitRelativePath || file.name;
      const target = folder && file.webkitRelativePath ? original.split('/').slice(1).join('/') : file.name;
      return { id: nextId++, original, target, data: new Uint8Array(await file.arrayBuffer()), type: file.type, include: !isJunk(target) };
    }));
    invalidate(); lastRemoved = undefined; files.push(...additions); renderFiles(); $('importStatus').textContent = t().imported(additions.length);
  } catch { $('importStatus').textContent = t().importFailure; }
  finally { setBusy(false); $('fileInput').value = ''; $('folderInput').value = ''; }
}

function setBusy(value) {
  busy = value;
  document.querySelectorAll('button,input,textarea,select').forEach(el => { el.disabled = value; });
  renderPlan();
}

function showPreview(file) {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  const plain = /\.(?:txt|md|csv|json|py|js|ts|java|c|cpp|h|css|html|xml|yml|yaml|sh)$/iu.test(file.original);
  const image = /\.(?:png|jpe?g)$/iu.test(file.original);
  previewUrl = URL.createObjectURL(new Blob([file.data], { type: plain ? 'text/plain' : image ? /\.png$/iu.test(file.original) ? 'image/png' : 'image/jpeg' : /\.pdf$/iu.test(file.original) ? 'application/pdf' : 'application/octet-stream' }));
  $('previewTitle').textContent = file.original;
  $('previewNote').textContent = plain ? t().textPreview : image ? t().imagePreview : t().binaryPreview;
  $('previewText').textContent = plain ? new TextDecoder().decode(file.data.slice(0, 32000)).slice(0, 8000) : '';
  $('previewText').hidden = !plain; $('previewImage').hidden = !image;
  if (image) { $('previewImage').src = previewUrl; $('previewImage').alt = file.original; } else $('previewImage').removeAttribute('src');
  $('openFile').href = previewUrl;
  // Download HTML and unknown binaries so previewing cannot execute user markup.
  if (!image && !/\.pdf$/iu.test(file.original)) $('openFile').download = file.original.split('/').pop(); else $('openFile').removeAttribute('download');
  $('preview').showModal();
}

function demoPdf() {
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
  const stream = 'BT /F1 14 Tf 30 140 Td (Fictional assignment report) Tj ET';
  objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  let pdf = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach((object, i) => { offsets.push(pdf.length); pdf += `${i + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(o => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(pdf);
}

function loadDemo() {
  if (files.length && !confirm(t().confirmDemo)) return;
  invalidate();
  lastRemoved = undefined;
  const encode = str => new TextEncoder().encode(str);
  files = [
    ['report-final.pdf', demoPdf()], ['notes.txt', encode('Fictional A2 submission\nRun: python src/main.py\n')],
    ['src/main.py', encode('print("PackCheck demo")\n')], ['.DS_Store', encode('fictional OS metadata')]
  ].map(([name, data]) => ({ id: nextId++, original: name, target: name, data, include: !isJunk(name) }));
  $('archiveName').value = '123456_A2.zip'; $('required').value = 'report.pdf\nREADME.md\nsrc/'; $('limit').value = '5'; $('rootFolder').value = ''; $('compression').value = '1';
  $('importStatus').textContent = t().demoLoaded; renderFiles();
}

function build() {
  const plan = renderPlan();
  if (plan.errors.length || busy) return;
  invalidate(); setBusy(true); $('buildStatus').textContent = t().building;
  try { worker = new Worker(new URL('./zip-worker.js', import.meta.url), { type: 'module' }); }
  catch { setBusy(false); $('buildStatus').textContent = t().buildFailed; return; }
  const finish = () => { worker.terminate(); worker = undefined; setBusy(false); };
  worker.onerror = () => { finish(); $('buildStatus').textContent = t().buildFailed; };
  worker.onmessage = ({ data }) => {
    finish();
    if (data.error) { $('buildStatus').textContent = data.error === 'size' ? t().sizeFailure(bytes(data.size)) : t().buildFailed; $('retryCompression').hidden = data.error !== 'size' || plan.level === 9; return; }
    builtZip = { name: cleanPath($('archiveName').value), size: data.bytes.length, entries: plan.selected.map((file, index) => ({ path: plan.archivePaths[index], size: file.data.length })) };
    zipUrl = URL.createObjectURL(new Blob([data.bytes], { type: 'application/zip' }));
    $('download').href = zipUrl; $('download').download = builtZip.name;
    $('zipInfo').textContent = `${builtZip.name} · ${bytes(builtZip.size)} · ${t().zipFiles(builtZip.entries.length)}`;
    $('ready').hidden = false; $('buildStatus').textContent = t().built; $('download').focus();
  };
  worker.postMessage({ files: plan.selected.map((file, index) => ({ path: plan.archivePaths[index], data: file.data })), limit: plan.limit, level: plan.level });
}

function setLanguage(next) {
  language = next; document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t()[el.dataset.i18n]; });
  $('lang').textContent = language === 'en' ? '中文' : 'English';
  $('lang').setAttribute('aria-label', language === 'en' ? 'Switch to Chinese' : '切换为英文');
  $('limit').placeholder = t().optional; $('rootFolder').placeholder = t().optional; $('importStatus').textContent = ''; $('buildStatus').textContent = builtZip ? t().built : '';
  if (builtZip) $('zipInfo').textContent = `${builtZip.name} · ${bytes(builtZip.size)} · ${t().zipFiles(builtZip.entries.length)}`;
  document.querySelector('.mobile-package').setAttribute('aria-label', language === 'en' ? 'Package shortcut' : '打包结果快捷入口');
  renderFiles();
}

$('lang').addEventListener('click', () => setLanguage(language === 'en' ? 'zh' : 'en'));
$('addFiles').addEventListener('click', () => $('fileInput').click());
$('addFolder').addEventListener('click', () => $('folderInput').click());
$('fileInput').addEventListener('change', event => importFiles(event.target.files));
$('folderInput').addEventListener('change', event => importFiles(event.target.files, true));
['archiveName', 'required', 'limit', 'rootFolder', 'compression'].forEach(id => $(id).addEventListener('input', () => { invalidate(); renderPlan(); }));
$('clear').addEventListener('click', () => { if (confirm(t().confirmClear)) { files = []; lastRemoved = undefined; invalidate(); $('importStatus').textContent = ''; renderFiles(); } });
$('undo').addEventListener('click', () => { if (lastRemoved) { files.splice(lastRemoved.index, 0, lastRemoved.file); lastRemoved = undefined; invalidate(); renderFiles(); $('importStatus').textContent = t().undone; } });
$('demo').addEventListener('click', loadDemo);
$('build').addEventListener('click', build);
$('retryCompression').addEventListener('click', () => { $('compression').value = '9'; build(); });
$('closePreview').addEventListener('click', () => $('preview').close());
$('preview').addEventListener('close', () => { if (previewUrl) URL.revokeObjectURL(previewUrl); previewUrl = undefined; $('previewImage').removeAttribute('src'); $('openFile').removeAttribute('href'); });
$('manifest').addEventListener('click', () => {
  if (!builtZip) return;
  const text = `PackCheck file list\n${builtZip.name} (${builtZip.size} bytes)\n\n${builtZip.entries.map(file => `${file.path}\t${file.size} bytes`).join('\n')}\n\nPrepared locally. This is not proof of submission.\n`;
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const link = node('a'); link.href = url; link.download = 'packcheck-file-list.txt'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
const drop = $('drop');
drop.addEventListener('dragover', event => { event.preventDefault(); drop.classList.add('over'); });
drop.addEventListener('dragleave', () => drop.classList.remove('over'));
drop.addEventListener('drop', event => {
  event.preventDefault(); drop.classList.remove('over');
  if ([...event.dataTransfer.items].some(item => item.webkitGetAsEntry?.()?.isDirectory)) { $('importStatus').textContent = t().folderDrop; return; }
  importFiles(event.dataTransfer.files);
});
setLanguage('en');
