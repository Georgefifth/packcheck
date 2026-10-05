# PackCheck demo script

Final video: 168.88 seconds. English narration with burned-in captions.

## 0.0–9.0s: cover

Your assignment is finished. PackCheck helps you prepare the submission ZIP with the required filenames and folder structure.

## 9.0–19.1s: problem

This fictional assignment requires a report, README, and source folder. The laptop has different filenames and an extra system file.

## 19.1–27.6s: load-example

I load the fictional example in the working prototype. You can import your own files through pickers or drag and drop.

## 27.6–38.4s: exact-requirements

Requirements use exact paths, one per line. Missing paths appear immediately. Blocking issues keep the Build button disabled.

## 38.4–47.5s: fix-report

I select the report and apply its required path. The original stays unchanged, with its filename visible underneath.

## 47.5–56.5s: fix-readme

Next, I apply the README path. This changes its place in the ZIP. The contents still need your review.

## 56.5–67.3s: preview-contents

The preview lets me read the README before packing. Text stays plain text, including HTML. Images also have a preview.

## 67.3–76.7s: show-conflict

I deliberately create a duplicate path. PackCheck blocks building, preventing one file from silently replacing another in the ZIP.

## 76.7–84.6s: repair-conflict

Restoring the README path clears the conflict. You can edit paths directly and undo a removal.

## 84.6–93.4s: exclude-metadata

System metadata stays excluded by default and visible for review. Your selected files keep their folder paths.

## 93.4–103.0s: package-options

I add an outer folder here. All selected files go inside it. Requirements still describe the contents within.

## 103.0–113.1s: verification-method

A local worker builds the ZIP. PackCheck reopens it, compares every file byte, and checks the actual compressed size.

## 113.1–122.1s: build-verified-zip

I build the ZIP. The result shows its actual size and file count, confirming its contents match the inputs.

## 122.1–131.1s: download-zip

This downloads the ZIP with our chosen outer folder. Review the package, then upload it to your course portal.

## 131.1–140.5s: download-file-list

The file list downloads separately for review. It stays outside the assignment ZIP, which only contains your selected files.

## 140.5–149.7s: switch-language

Switching to Chinese preserves the settings and generated ZIP. Smaller screens get an adapted layout and a packaging shortcut.

## 149.7–158.4s: scope-and-privacy

Files stay in this tab and clear on refresh. You remain responsible for assignment contents and final submission.

## 158.4–168.8s: closing

PackCheck is available now, with source on GitHub. Try your files. Next, we will test it against real student assignments.
