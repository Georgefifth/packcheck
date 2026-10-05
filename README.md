# PackCheck

[Use PackCheck](https://georgefifth.github.io/packcheck/) · [Research and competitors](./RESEARCH.md)

Prepare a submission ZIP from local files. Rename output copies, check explicit required files/folders, exclude metadata, and download the actual archive. No account, file upload, analytics, or persistent browser storage.

## Short flow

1. Add your files or a folder. Nested folders are preserved; the selected outer folder is omitted.
2. Set the ZIP filename and optional exact required paths and size limit. For a missing path, select its corresponding file and apply the new path directly.
3. Preview content and resolve the displayed issues. Package options can wrap all files in an outer directory and change compression.
4. Build and download. The archive is reopened and every included byte is compared with its source. Upload it to your course portal yourself.

Removal has one-step undo. Original files never change. A fictional example is included; do not submit it as coursework.

## Run and verify

```sh
npm ci
npx playwright install --with-deps firefox
npm start
```

Open http://localhost:8000/.

```sh
npm test
npm run test:e2e
```

13 core regression tests and headless Firefox cover requirements, collisions, path fixes, undo, folder imports/wrapping, compression/size limits, previews, actual ZIP byte contents, download, English/Chinese, mobile layouts, storage and network behavior. axe checks three page states. These are synthetic checks, not a student study or complete accessibility certification. GitHub Actions retains screenshots and generated test archives for seven days.

To test the live deployment:

```sh
PACKCHECK_BASE_URL=https://georgefifth.github.io/packcheck/ npm run test:e2e
```

## Limits

300 imported files / 20 MiB per tab. Requirements are explicit paths; arbitrary assignment instructions are not interpreted. PDF/PNG/JPEG checks inspect basic headers, not document correctness. No input ZIP extraction, format conversion, grading, or LMS integration. Refreshing clears files.

Runtime ZIP code: [fflate 0.8.3](https://github.com/101arrowz/fflate), MIT; bundled source/license in vendor/. See RESEARCH.md for credited prior art and the reasons for the browser prototype.
