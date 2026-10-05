# PackCheck: why this prototype exists

## The work it performs

Input: local submission files, an output ZIP name, and optional exact required paths and size limit.

Output: a real ZIP with the selected files and edited paths. The generator reopens the archive and compares every included byte with the selected source. Originals are never modified. No check report is silently added to the submission ZIP.

This is a core prototype for evaluating whether that task is worth building further. It is not validated with students and does not claim to prevent all submission mistakes.

## Evidence for the task

- [Cornell CS2112 A3 submission instructions](https://www.cs.cornell.edu/courses/cs2112/2025fa/hw/a3/a3.pdf?1759517455=): a specific source directory is required; OS metadata and certain compiled files must be excluded. This is one course's policy, not a universal template.
- [Harvard CSCI E-23a project submission instructions](https://cs50.harvard.edu/extension/games/2022/fall/projects/8/helicopter/): discusses removing `__MACOSX` and unnecessary folders when preparing an oversized submission. PackCheck does not assume its project-specific exclusions apply elsewhere.
- [CUHK SEEM3460 assignment naming guidance](https://www1.se.cuhk.edu.hk/~seem3460/tutorial/lab/lab1/QA-assgn1-2021.pdf): specifies a student-ID-based ZIP filename.
- [A public student report about metadata in a submission](https://www.reddit.com/r/GlasgowUni/comments/1s1i5bp/submitted_correct_work_but_moodle_shows/): an anecdotal report of a ZIP being seen as empty or invalid because of `._` entries. This has not been independently verified and does not establish frequency.

## Existing solutions checked first

| Tool | Publicly described capability | Reason for this prototype |
| --- | --- | --- |
| [SubmitReady](https://submitmate.itch.io/submitready) | Local rules check filenames, formats, missing files and size; prepares renamed copies and ZIPs | Very close to this concept. Its listed download is currently Windows-only. PackCheck tests a browser version that runs without installing an executable. This is not a claim of a new category or superior accuracy. |
| [Cornell submission-checker](https://github.com/nwtnni/submission-checker) | Validates submission directories with configured assignment whitelists and Cornell CMS integration | Designed around an institutional submission workflow rather than a student opening a standalone page. |
| [PASS](https://github.com/nlct/pass) | Applications for preparing programming assignments, including submission checks | A broader installation-based workflow. This prototype deliberately tests only a short file-to-ZIP task. |
| [fflate](https://github.com/101arrowz/fflate) | Maintained JavaScript ZIP/compression library | Used directly rather than implementing an archive format. Bundled browser module and MIT license are in `vendor/`. |

No code was copied from the other submission tools. fflate is the only third-party runtime component. PackCheck is an independently deployed browser prototype.

## Exact limits

- 300 imported files and 20 MiB of imported bytes per tab. ZIP archives are not unpacked as input; add their original files or folders.
- Requirements are explicit paths entered by the user. Arbitrary assignment prose is not interpreted. Folder imports omit the selected outer folder, preserve nested folders, and show the resulting paths before packing.
- Required paths are case-sensitive. Case variants in output filenames are blocked to avoid extraction collisions on common filesystems. File/directory conflicts and unsafe paths are also blocked.
- PDF, PNG, and JPEG checks compare only basic signatures. They do not prove that a document is valid, complete, readable, or the correct assignment. Renaming does not convert a format.
- Empty files produce a warning because some source files are intentionally empty. Common OS metadata and `.git` folders are excluded by default, but can be included explicitly. Other dotfiles are retained.
- Files stay in memory. Refreshing clears them. Unknown/HTML files are downloaded for inspection rather than executed as an embedded preview.
- No LMS integration, grading, plagiarism detection, format conversion, or proof of submission.

## Try the core flow

1. Click **Try a messy example**. It contains four fictional files.
2. Rename `report-final.pdf` to `report.pdf`, and `notes.txt` to `README.md` using the path fields.
3. Preview the text. Observe that `.DS_Store` is excluded and all three specified requirements are met.
4. Build and download `123456_A2.zip`. Extract it with a normal archive tool: it contains `report.pdf`, `README.md`, and `src/main.py`.
5. Replace the demo with your own files and your actual assignment requirements. Do not submit the fictional demo.

## Development verification

From this project:

```sh
npm ci
npx playwright install --with-deps firefox
npm test
npm run test:e2e
```

The 13 core tests cover unsafe paths, exact requirements, exclusions, collisions, basic signatures, empty files, limits, and a ZIP byte round-trip. The headless Firefox test imports real files and a temporary directory, fixes paths, previews content, creates/downloads/reopens ZIPs, compares their actual bytes, checks size-limit rejection, downloads a manifest, tests clearing, and checks Chinese/mobile states. It also runs axe on three page states and checks for unexpected requests, execution of pasted markup, and storage writes. These are synthetic regression checks, not a student study or complete accessibility certification.

To test the deployment, set `PACKCHECK_BASE_URL=https://georgefifth.github.io/packcheck/` when running `npm run test:e2e`. Generated screenshots and archives are saved to the ignored `test-artifacts/` directory. GitHub Actions retains them for seven days.

## Competitive review and resulting changes — 5 October 2026

Public product descriptions were checked; these are not independently benchmarked claims.

| Tool | Relevant capability | PackCheck change |
| --- | --- | --- |
| [ezyZip](https://www.ezyzip.com/zip-files-online.html) | Browser-local ZIP creation, folder structure, configurable compression | Added optional outer folder and compression choices. A size-limit failure offers a stronger compression retry without changing file contents. |
| [Files2Zip](https://www.files2zip.com/) | Browser-local creation/extraction, previews, folder inputs and archive name | Reduced the add-files panel after import and added a mobile package shortcut so editing and downloading require less scrolling. |
| [SubmitReady](https://submitmate.itch.io/submitready) | Windows tool that checks explicit submission requirements and prepares renamed copies | Missing required paths now offer a direct file selector and apply button. The user chooses the source; PackCheck does not guess document contents. |

A single-step undo restores the last removed file without requiring another file picker. Imports and clearing reset this undo state to keep memory bounded. Folder wrappers are optional and hidden under Package options. Required paths refer to the contents inside that wrapper; actual ZIP paths and the downloadable file list include it. Compression never converts or resizes document/image contents.
