# NotePin — build instructions for Mozilla reviewers

NotePin is built with **Vite + React + TypeScript**. The uploaded XPI/ZIP contains the production build output.

## Requirements

- Node.js 20+ (or current LTS)
- npm

## Build steps

```bash
cd notepin
npm ci
npm run build
```

Output directory: `notepin/dist/`

To produce the Firefox package used for AMO (patches `background.scripts`, gecko id, icon32):

```bash
# from repository root
python prepare_firefox_zip.py
```

That script runs `npm run build`, then packs `NotePin Firefox.zip`.

## No obfuscation

Source under `notepin/src/` is the readable TypeScript/React source. The packaged JS is standard Vite production output (bundled/minified by Rollup/esbuild), not intentionally obfuscated beyond the normal production build.
