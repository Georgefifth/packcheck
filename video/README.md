# PackCheck competition demo

The [LovHack Season 3 submission requirements](https://lovhack-season-3.devpost.com/) specify a **2–3 minute** video, mostly showing the actual prototype. The final cut is **2 minutes 49 seconds**, with about 129 seconds showing the working product. It uses the deployed product and clearly labels its built-in files as fictional examples.

## Deliverables

- `packcheck-demo.mp4`: 1920 × 1080 video with English synthesized narration and burned-in English captions.
- `packcheck-demo.srt`: matching captions for video platforms.
- `script.md`: narration and chapter timing.
- `slides.html` and `slides/*.png`: four explanatory frames in the product's blue and white palette.

## Reproduce

Uses the existing local tool at `~/tools/demo-recorder`, Playwright Chromium, edge-tts, and FFmpeg. Capture is headless, with no microphone or system audio. The previous feature test uses headless Firefox separately.

From the PackCheck repository:

```sh
node ~/tools/demo-recorder/tools/frames.js video/slides.html '#cover:video/slides/cover.png' '#problem:video/slides/problem.png' '#process:video/slides/process.png' '#closing:video/slides/closing.png'
node ~/tools/demo-recorder/record-demo.js video/scenes.cjs --check
node ~/tools/demo-recorder/record-demo.js video/scenes.cjs --dry --out=video/render
node video/assemble.cjs
```

`assemble.cjs` reuses captured clips through a project-local copy of demo-recorder's `lib/post.js`. `post.cjs` fixes animated zoom: FFmpeg's crop width and height evaluate only during configuration, so a time expression there does not animate the zoom. This version uses per-frame zoompan, holds focus for four seconds, normalizes overlapping focus points, caches narration by text and voice, and rejects durations outside 120–180 seconds. `assemble.cjs` also directs key close-ups toward resulting paths and preview content. See [FFmpeg crop documentation](https://ffmpeg.org/ffmpeg-filters.html#crop) and [zoompan documentation](https://ffmpeg.org/ffmpeg-filters.html#zoompan). The shared recorder installation remains unchanged.

The cursor and click ripple come from demo-recorder. The two requirement selects use DOM change events because its action schema has no select action. All subsequent changes, checks, previews, builds, and downloads use the actual product. Narration and cards do not claim grading, format conversion, or automatic LMS submission.

Large recordings and temporary rendering files stay outside Git. The MP4 is a local deliverable; it still needs hosting at a publicly accessible video URL for judges.
