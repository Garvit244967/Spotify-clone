# Spotify Clone — corrected files

## Folder structure
- `index.html`
- `styles.css`
- `script.js`
- `music/` — put your licensed MP3 files here.

## Run it
Open the folder in VS Code and use **Live Server** on `index.html`.
Keep the three files in the same folder.

## Included fixes
- Removed the duplicate JavaScript include.
- Removed the broken duplicate loader script and made the loading overlay dismiss reliably.
- Repaired malformed profile/navbar HTML.
- Connected back/forward navigation to browser history.
- Kept search, song rows, player, liked songs, and demo login wired to the provided JavaScript.

## Music filenames
The first three tracks are configured for:
- `music/52 Bars.mp3`
- `music/Mexico Full Song.mp3`
- `music/Winning Speech Karan Aujla.mp3`

Make sure the third filename matches your actual file exactly. Other tracks are configured in `script.js`;
if you do not have their MP3 files, those entries will show an audio-path error until you add the files.

## Login note
Login/signup is a **browser-only demo** using `localStorage`; it is not secure production authentication.
Google/Facebook login and real accounts require an authentication backend/provider.
