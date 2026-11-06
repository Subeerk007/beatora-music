# Beatora — Next.js Music Landing Page

## Stack
- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Lucide React icons
- Canvas + Web Audio API audio visualizer

## Run
```bash
npm install
npm run dev
```
Open http://localhost:3000

## Add music
Put your own MP3 files in `public/music/` with these names:
- `midnight-vibes.mp3`
- `neon-dreams.mp3`
- `afterglow.mp3`

The audio visualizer reads the actual audio frequencies through the Web Audio API while a track is playing. When no MP3 is present, the player UI and idle animated bars still render, but playback cannot start.

## Main files
- `components/BeatoraLanding.tsx` — landing page, player and audio visualizer
- `app/globals.css` — neon theme, responsive layout and CSS animations
- `app/page.tsx` — page entry
