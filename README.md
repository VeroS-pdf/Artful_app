# Artful

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
- **Instagram inspiration** tab: a place to dump Instagram posts you want to remember. Paste any number
  of links at once (or import the file from Instagram's "Download your information" export) and add a
  note on why each one inspires you. "Show post" loads a post from Instagram only when you click it.

Instagram doesn't allow apps to read your Saved posts, so there is no automatic sync. Posts are kept as
links, and the post itself always stays on Instagram.

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

Everything stays in your browser; nothing is sent anywhere. The one exception is the Instagram
"Show post" button, which loads that post from Instagram when you click it.

- Folders, notes and saved Instagram links: `localStorage` (key `artful-app:v1`)
- Pictures: IndexedDB (database `artful-app`), loaded only when you open them. Pictures over 1.5 MB
  are shrunk to at most 2000px before saving.

Clearing site data for the page erases your notes.
