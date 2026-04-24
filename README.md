<div align="center">
  <img width="1200" height="475" alt="NotePin" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# NotePin

Smart layer annotations for the web.

NotePin lets you pin sticky notes directly on any page via a right-click hold. Notes are saved locally in your browser (and can optionally use Chrome Sync when available).

## Features

- Pin notes anywhere on any website (right-click hold)
- Drag, resize, and layer notes
- Saved notes list + search
- Export/import backup (JSON)
- Settings page + “Wall of Fame” support section

## Install (load unpacked)

1. Build the extension:

   ```bash
   cd notepin
   npm install
   npm run build
   ```

2. Open Chrome → `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select: `notepin/dist`

## Development

```bash
cd notepin
npm install
npm run dev
```

## Build

```bash
cd notepin
npm run build
```

## Privacy

- No analytics
- No tracking
- Notes are stored in Chrome storage (local/sync)

## Support

Buy me a coffee: https://buymeacoffee.com/nrnworld