# Globe Berita Dunia Mobile (APK)

Aplikasi mobile interaktif berita dunia dengan visualisasi globe 3D, pembaca berita in-app, kalender ekonomi, AI Gemini chat, dan instalasi PWA/APK.

## Tech Stack
- **Frontend**: React 19 + Vite 8 + Tailwind CSS 4
- **Backend**: Express.js + TypeScript (tsx)
- **AI**: Google Gemini 3.5 Flash / 3.1 Pro
- **News API**: GNews + NewsAPI
- **PWA**: vite-plugin-pwa (installable as Android APK)

## Deploy

### Environment Variables (set in Render/Railway dashboard)
```
NEWS_API_KEY=your_newsapi_key
GNEWS_API_KEY=your_gnews_key
GEMINI_API_KEY=your_gemini_key
NODE_ENV=production
PORT=3000
```

### Render.com (Recommended - Free)
1. Connect GitHub repo to Render
2. Build Command: `npm install --legacy-peer-deps && npm run build`
3. Start Command: `npm start`

## Local Development
```bash
npm install --legacy-peer-deps
npm run dev
```
Open http://localhost:3000