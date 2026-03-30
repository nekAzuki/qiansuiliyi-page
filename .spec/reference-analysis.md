# Reference Website Analysis: diehikari.top

## Overview

**URL**: https://www.diehikari.top/
**Type**: Personal music playlist / streaming showcase website
**Creator**: 蝶蝶Hikari — a live-streaming content creator (likely on Bilibili or similar platform)
**Tagline**: "和她不一定拿手的610首歌" (610 songs she's not necessarily good at)

---

## Site Structure & Layout

### Header / Profile Section
- Background banner image
- Avatar (profile picture)
- Username display
- Brief descriptive tagline

### Main Content — Playlist Display
- A single-page application centered around a large curated playlist (610 songs)
- Each song entry includes:
  - Album artwork thumbnail (96×96px)
  - Song title (clickable to copy)
  - Artist/performer name
  - Recording date/timestamp
  - Engagement reactions (❤️ hearts, 😅 laughs)
  - Paid content tier indicator (30元 / 100元 / 200元 / 1000元 / 10000元 SC)
  - Special tags (e.g. "上船当日限定" — boarding day exclusive)

### Filtering / Navigation
- **Genre filters**: Pop, Hip-hop, Rock, Folk, Jazz, etc.
- **Language filters**: Mandarin, Italian, Japanese, Cantonese, English, etc.
- **Category tags**: All playable, Ship day exclusive, Paid songs, 二次元 (Anime), Original creations
- Multiple filters can be applied simultaneously

---

## Key Features

| Feature | Description |
|---|---|
| Multi-dimensional filtering | Filter songs by genre, language, and category simultaneously |
| Copy song name | Click song title to copy to clipboard |
| Engagement metrics | Per-song heart and laugh reaction counts |
| Paid content tiers | SC (SuperChat) price indicators with color-coded icons |
| Recording history | Timestamps showing when each song was recorded |
| Special tags | Limited/exclusive song markers |

---

## Visual & Design Elements

- **Theme**: Clean, minimal, dark-toned aesthetic
- **Layout**: Responsive grid/list for song cards
- **Typography**: Chinese characters with emoji accents
- **Color coding**: Pricing tiers distinguished by color
- **Images**: Album artwork thumbnails, profile avatar, banner background

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js** (inferred from `/_next/image` URLs, image optimization) |
| Image hosting | **Cloudflare R2** storage CDN |
| Album art API | **Firefly API** (eikasia30.workers.dev) |
| Styling | Modern responsive CSS |
| Deployment | Likely Vercel or Cloudflare Pages |

---

## External Integrations

- **Cloudflare R2** — image/asset CDN
- **Firefly API** — dynamic album artwork retrieval
- **SuperChat payment system** — tiered paid song indicators
- **Live-streaming platform** — Bilibili-style membership ("上舰") references

---

## Core Concept Summary

The site is essentially a **searchable, filterable song catalog** for a live-streaming singer. It serves as a companion tool for viewers/fans to:

1. Browse the streamer's full repertoire
2. Filter by genre, language, or category
3. Copy song names to request them during live streams
4. See which songs require paid SC (SuperChat) donations
5. Track recording history and engagement

The nature of the site is a **single-purpose personal showcase/tool page** — not a blog or portfolio, but a focused interactive catalog tied to a content creator's streaming activity.
