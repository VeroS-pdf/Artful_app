# Artful

*For when ideas just randomly hit!*

A pastel idea-catcher. Open the app and it asks **"What's the idea?"**: type anything, drop it into a
colorful folder, and check it off when it's done.

## Features

- **Landing page** with an open text box. Attach pictures, pick a folder (or make a new one), and save.
- **Folders as vertical tabs** down the left side. Rename a folder by clicking its title, and change its
  color from the swatch next to the title (10 pastels, teal by default).
- **Reminders-style lists**: each note shows its first three lines and a check circle.
  Click a note to open the expanded view (full text, folder, pictures, delete).
- **Completing a note** moves it into the folder's **Completed** subfolder and into the global
  **Completed** archive (bottom of the sidebar), which collects finished notes from every folder.
  Un-check a note anywhere to bring it back.
- **Pictures** stay hidden until you click the little image icon on a note. The icon only appears on
  notes that actually have pictures.
- Deleting a folder deletes its open notes, but completed notes stay in the archive.

## Run it

```bash
npm install
npm run dev
```

Other scripts: `npm run typecheck`, `npm run build`, `npm run preview`.

## How it's built

React 19 + TypeScript + Vite, no UI library.

| Piece | Where |
| --- | --- |
| Pastel palette (and the per-folder accent variables) | `src/colors.ts` |
| State: reducer, persistence, actions | `src/store/` |
| Screens and components | `src/components/` |
| Styles (tokens in `theme.css`, everything else in `app.css`) | `src/styles/` |

## Where your data lives

Everything stays in your browser; nothing is sent anywhere.

- Folders and notes: `localStorage` (key `artful-app:v1`)
- Pictures: IndexedDB (database `artful-app`), loaded only when you open them. Pictures over 1.5 MB
  are shrunk to at most 2000px before saving.

Clearing site data for the page erases your notes.
