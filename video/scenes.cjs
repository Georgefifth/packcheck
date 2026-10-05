const path = require('node:path');
const slide = name => ({ image: path.join(__dirname, 'slides', `${name}.png`), preset: 'swiss', accent: '#1659cd' });
const wait = ms => ({type:'wait',ms});
const ready = sel => ({type:'waitFor',sel});
const click = sel => ({type:'click',sel});
const hover = sel => ({type:'hover',sel});
const fill = (sel,text) => ({type:'fill',sel,text});
const report = '.file-row[data-id="0"] .path';
const notes = '.file-row[data-id="1"] .path';
const choose = (sel,value) => ({type:'exec',js:`{const el=document.querySelector('${sel}');el.value='${value}';el.dispatchEvent(new Event('change',{bubbles:true}));}`});
const live = (name,duration,actions,vo) => ({name,session:'submission',duration,actions,vo});
module.exports = [
  {name:'cover',card:slide('cover'),duration:9,vo:'Your assignment is finished. PackCheck helps you prepare the submission ZIP with the required filenames and folder structure.'},
  {name:'problem',card:slide('problem'),duration:10,vo:'This fictional assignment requires a report, README, and source folder. The laptop has different filenames and an extra system file.'},
  {...live('load-example',8,[ready('#demo'),click('#demo'),wait(6200)],'I load the fictional example in the working prototype. You can import your own files through pickers or drag and drop.'),url:'https://georgefifth.github.io/packcheck/'},
  live('exact-requirements',8,[ready('#required'),hover('#required'),wait(6500)],'Requirements use exact paths, one per line. Missing paths appear immediately. Blocking issues keep the Build button disabled.'),
  live('fix-report',9,[choose('#choose-0','0'),ready('button[aria-label="Use this path: report.pdf"]'),click('button[aria-label="Use this path: report.pdf"]'),wait(6500)],'I select the report and apply its required path. The original stays unchanged, with its filename visible underneath.'),
  live('fix-readme',9,[choose('#choose-1','1'),ready('button[aria-label="Use this path: README.md"]'),click('button[aria-label="Use this path: README.md"]'),wait(6500)],'Next, I apply the README path. This changes its place in the ZIP. The contents still need your review.'),
  live('preview-contents',10,[ready('.file-row[data-id="1"] button[aria-label^="Preview:"]'),click('.file-row[data-id="1"] button[aria-label^="Preview:"]'),ready('#previewText'),wait(7500)],'The preview lets me read the README before packing. Text stays plain text, including HTML. Images also have a preview.'),
  live('show-conflict',8,[click('#closePreview'),ready(notes),fill(notes,'report.pdf'),wait(5300)],'I deliberately create a duplicate path. PackCheck blocks building, preventing one file from silently replacing another in the ZIP.'),
  live('repair-conflict',7,[ready(notes),fill(notes,'README.md'),hover('#checks'),wait(4500)],'Restoring the README path clears the conflict. You can edit paths directly and undo a removal.'),
  live('exclude-metadata',7,[ready('.file-row[data-id="3"]'),{type:'scrollIntoView',sel:'.file-row[data-id="3"]'},hover('.file-row[data-id="3"]'),wait(4500)],'System metadata stays excluded by default and visible for review. Your selected files keep their folder paths.'),
  live('package-options',9,[ready('.package-options summary'),click('.package-options summary'),fill('#rootFolder','123456_A2'),wait(6600)],'I add an outer folder here. All selected files go inside it. Requirements still describe the contents within.'),
  {name:'verification-method',session:'submission',card:slide('process'),duration:9,vo:'A local worker builds the ZIP. PackCheck reopens it, compares every file byte, and checks the actual compressed size.'},
  live('build-verified-zip',9,[ready('#build:not([disabled])'),click('#build'),ready('#download'),wait(6500)],'I build the ZIP. The result shows its actual size and file count, confirming its contents match the inputs.'),
  live('download-zip',9,[ready('#download'),click('#download'),hover('#zipInfo'),wait(6200)],'This downloads the ZIP with our chosen outer folder. Review the package, then upload it to your course portal.'),
  live('download-file-list',7,[ready('#manifest'),click('#manifest'),hover('#ready'),wait(4900)],'The file list downloads separately for review. It stays outside the assignment ZIP, which only contains your selected files.'),
  live('switch-language',8,[{type:'scrollIntoView',sel:'#lang'},ready('#lang'),click('#lang'),wait(5900)],'Switching to Chinese preserves the settings and generated ZIP. Smaller screens get an adapted layout and a packaging shortcut.'),
  live('scope-and-privacy',8,[ready('.help summary'),click('.help summary'),{type:'scrollIntoView',sel:'.help'},wait(6000)],'Files stay in this tab and clear on refresh. You remain responsible for assignment contents and final submission.'),
  {name:'closing',card:slide('closing'),duration:10,vo:'PackCheck is available now, with source on GitHub. Try your files. Next, we will test it against real student assignments.'},
];
