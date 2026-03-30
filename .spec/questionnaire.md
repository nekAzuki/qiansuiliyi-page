# Song Catalog Site — Design Questionnaire

Please fill in your answers below each question. Write "you decide" if you'd like me to propose a default.

---

## Streamer & Content

**1. Streamer name / alias?** (for branding the site)

> Name is 千穗梨衣_lily, homepage is at https://space.bilibili.com/279148275 (find her avatar and I guess it would be useful)

**2. What platform do they stream on?** (Bilibili, Twitch, etc. — affects terminology like "上舰" vs "subscribe")

> Bilibili only, the language should be in Simplified Chinese only (no English terms in the website!)

**3. Roughly how many songs are in their repertoire currently?**

> Start with 150.

**4. What languages do they sing in?**

> Vast majority Chinese, very few in English, Japanese and Korean.

**5. Do they have specific genre categories they'd want, or should we keep it simple?**

> I'd like the genre categories to be something configurable by the entry of the song. 

---

## Features — What to Keep / Drop / Add

**6. Paid tiers (SC pricing) — does this streamer have paid song request tiers? If so, how many levels?**

> Drop this

**7. Reactions (hearts/laughs per song) — keep, drop, or replace with something else?**

> Like (heart) as the only option so far.

**8. Click-to-copy song name — keep as the primary action? Or prefer something else (e.g. link to a music platform)?**

> Click to copy name is fine

**9. Search — the reference site only has tag filters, no text search. I'd recommend adding a search bar. Thoughts?**

> Great suggestion! The search should support ping-ying search. So "发如雪" should be seachable with "faruxue", and the search result should update live as the user type.

**10. Special tags — does the streamer have equivalents to "ship day exclusive", "original song", "30s preview", etc.?**

> So far no, but I'd like to keep this option open.

---

## Self-Editing (Streamer edits without developer)

**11. How technical is the streamer?** This drives the editing solution. Options below — pick one or suggest your own.

- **Option A**: Simple admin UI with login (most user-friendly, needs a backend/database)
- **Option B**: Google Sheet / Notion table that the site reads from (no backend, familiar tools)
- **Option C**: JSON/YAML file in GitHub repo via a simple web form (lightweight, Git-backed)
- **Option D**: Headless CMS like Sanity / Contentful (powerful but heavier)

> Option A or C, I'd like to host it on Cloudflare for simplicity as I don't expect much traffic on this site. But I'm open to other options. My thought on B is: the streamer is located inside Mainland China and thus access Google/Notion might be restricted. Option C sounds simple but it would be extra overhead if requires the non-technical streamer to edit a file on github. Probably not option D.

**12. Any constraints on hosting costs?** (Must be free? Small budget OK?)

> Current plan is to use cloudflare worker/pages. Ok if there is a small fee if we need to use other things that requires backend compute.

---

## Style & Aesthetics

**13. What vibe / aesthetic are you going for?** (e.g. dark mode, pastel, cyberpunk, cozy, minimalist, glassmorphism, etc.)

> I'd like to start with the referenced site: https://www.diehikari.top/ vibe. Let's not deviate too much from it for now. But I do want the flexibility to later change it. Let's save this as a roadmap item on refine/customize the style once I work more with the streamer on what she wants.

**14. Does the streamer have brand colors or a visual identity to match?**

> I think the color for her is purple (light) ish.  

**15. Art assets from the reference site — which ones were you thinking of reusing?** (Album artwork API? Background images? Layout patterns?)

> I think something like fonts, Layout is good. I'm not sure how their album/song display worked, wether it is using pure CSS or external widgits etc.

---

## Tech & Hosting

**16. Tech stack preference?** The reference uses Next.js. Are you comfortable with that, or prefer something else (Vue/Nuxt, Astro, plain HTML, etc.)?

>Nextjs is fine, I want you do evaluate the options assess on 1) ease of maintain, 2) ease of use/development 3) extendability

**17. Custom domain — do you already have one?**

>Yes I already have one, but we might get one specifically for her site only in the future.

---

## Anything Else

**18. Any other features, ideas, or constraints not covered above?**

> I don't like the way songs are displayed for the referenced site, I'd like to introduce some smart paging/auto-loading etc to avoid a huge page load upfront. This page is really just a starting point, as we go there might be more things added to the site, like ability for the fans to create account and check their reward balance etc, and even redeem gifts using their rewards. 
