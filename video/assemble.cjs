// Reuse verified captures through demo-recorder's own post-production pipeline.
const fs = require('node:fs');
const path = require('node:path');
const { post } = require('./post.cjs');
const scenes = require('./scenes.cjs');
const outDir = path.join(__dirname, 'render');
const manifest = JSON.parse(fs.readFileSync(path.join(outDir, 'timestamps.json'), 'utf8'));
if (manifest.length !== scenes.length || manifest.some(scene => scene.error)) {
  throw new Error('Capture is incomplete. Repair the scenes and run --dry again.');
}
// Direct the camera to results rather than the button that caused them.
// Coordinates come from inspected 1920 × 1080 capture frames.
for (const scene of manifest) {
  if (scene.name === 'fix-report') scene.focus = [{t: 0.9, x: 750, y: 500}];
  if (scene.name === 'fix-readme') scene.focus = [{t: 0.9, x: 750, y: 650}];
  if (scene.name === 'preview-contents') scene.focus = [{t: 0.9, x: 960, y: 540}];
  if (scene.name === 'show-conflict') scene.focus = scene.focus.slice(-1);
  if (scene.name === 'switch-language') scene.focus = [{t: 1.4, x: 700, y: 150}];
}
post(scenes, manifest, {
  outDir, width: 1920, height: 1080, voice: 'en-US-ChristopherNeural',
  outFile: path.join(__dirname, 'packcheck-demo.mp4'), log: console.log,
}).catch(error => { console.error(error); process.exitCode = 1; });
