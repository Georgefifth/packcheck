# Project name

PackCheck

# Elevator pitch

Prepare your submission ZIP with the required filenames and folders, while keeping your original files unchanged.

# About the project

## Inspiration

Finishing an assignment and preparing its submission package are separate tasks. A report may still have a draft filename, a required README may be missing from the ZIP, or system metadata may slip into the archive.

PackCheck grew from the idea of making that final packaging step visible and editable. Research into existing submission checkers and browser ZIP tools helped narrow the scope: a small browser workspace where students can arrange their files against explicit requirements before downloading a ZIP.

## What it does

PackCheck prepares a real ZIP from local files or a folder. Users enter the archive name and optional required paths and size limit, then review exactly what will go into the package.

- Missing requirements offer a file selector and an apply button for fixing the output path.
- Duplicate names, unsafe paths, and file/folder conflicts block building.
- Common system metadata stays excluded by default, with inclusion under the user's control.
- Text and image previews support a content review. Removing a file has one-step undo.
- Optional settings add an outer folder or change compression.
- The finished ZIP is reopened and every included file is compared byte for byte with its source before download.

Files stay in the browser tab. There are no accounts, content uploads, analytics, or persistent file storage. The interface supports English and Chinese and adapts to smaller screens.

The current prototype accepts up to 300 files and 20 MiB of imported data. It checks explicit package requirements and basic PDF/PNG/JPEG signatures. Students still review their assignment contents and submit the downloaded ZIP themselves.

## How we built it

The interface uses HTML, CSS, and JavaScript. Validation rules live separately from the UI so the same rules can be tested directly. ZIP compression runs in a Web Worker using the existing MIT-licensed **fflate** library. The application reopens the archive to verify paths and file contents.

GitHub Pages hosts the static application. Playwright drives headless Firefox through the actual buttons, file and folder pickers, previews, corrections, and downloads. The tests unzip downloaded archives and compare their bytes, rather than treating a success message as proof.

The PackCheck interface, validation logic, worker integration, and workflow tests are project work. fflate and the development/testing tools are existing dependencies. The demo video uses an existing demo-recorder tool with project-specific scenes and presentation frames. Prior art and dependencies are credited in the repository.

## Challenges we ran into

Archive paths needed more care than simple filename validation. Case variants can collide when extracted, and a file can conflict with a directory at the same path. These checks must stay consistent with the paths actually written to the ZIP.

Another challenge was preserving a clear relationship between source files and output paths. The interface keeps the original name visible and invalidates an existing ZIP whenever the package changes. HTML previews also needed to display text without executing uploaded markup.

## Accomplishments that we're proud of

The deployed prototype completes the whole file-to-ZIP workflow. It creates downloadable archives, verifies their contents, and leaves the source files unchanged.

Core regression tests and Firefox workflow tests cover both normal use and errors, including duplicate paths, oversized imports, cancellation, and undo. Automated accessibility checks also cover three interface states.

## What we learned

The archive itself is the result that matters. Inspecting downloaded ZIPs caught risks that a screenshot or a green status message could miss.

Product iteration also reinforced the value of concrete actions: selecting a file to satisfy a missing path is more useful than showing a warning alone. Keeping checks explicit makes their limits easier to understand.

## What's next for PackCheck

The next step is to test PackCheck against real student assignment requirements and observe where people still hesitate or make mistakes. It has not yet been validated in a student study.

Reusable assignment templates, imported and exported as local files, are a possible next improvement. The priority is to make repeated submissions easier while preserving local processing and user control over the final package.

# Built with

JavaScript, HTML5, CSS3, fflate, Web Workers, GitHub Pages, Playwright

# Try it out links

- Working prototype: https://georgefifth.github.io/packcheck/
- Source code: https://github.com/Georgefifth/packcheck

# Image gallery

All gallery images are actual screenshots of the deployed prototype using its fictional example. They are PNGs at 1920 × 1280 (3:2), below the 5 MB limit.

1. `gallery/01-required-paths.png` — Required paths and visible packaging issues.
2. `gallery/02-content-preview.png` — Reviewing the README contents before packing.
3. `gallery/03-verified-zip.png` — A verified ZIP ready to download.

# Thumbnail

`thumbnail.png` — AI-generated conceptual brand artwork, made with the built-in imagegen tool. PNG, 1536 × 1024 (3:2), approximately 1.14 MiB. Exact generation prompt: `thumbnail-prompt.txt`.
