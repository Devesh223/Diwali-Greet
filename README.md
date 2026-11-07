# The Journey of Light 🪔 — A Cinematic Diwali Experience
By **Indian Pixel** · *Turning dreams into design.*

Ek single shareable link: log sirf "Happy Diwali" nahi padhte, Diwali ki kahani **dekhte** hain.

## Story (≈ 1 min, phir final wish)
1. **The First Flame** – andhera, ek spark, ek diya jalta hai
2. **The Homecoming** – Ayodhya, Sarayu par hazaaron diye, marigold petals
3. **The Blessing** – khilta kamal, sone ke sikke, roshni ki kirnein
4. **Across Generations** – rangoli banti hai, diye jalte hain
5. **The City of Lights** – shehar jagmagata hai, tap karo → fireworks
6. **A Wish For You** – शुभ दीपावली, tap karo → sky lantern chhodo

## Personalised links
`https://YOUR-APP.onrender.com/?to=Aarav&from=Priya`
Site ke andar "Personalise" button se link + WhatsApp message ban jaata hai. WhatsApp preview me bhi "A Diwali wish for Aarav" dikhta hai (server.js OG tags inject karta hai).

## Deploy on Render (2 min)
1. Folder ko GitHub repo me push karo.
2. Render → **New + → Blueprint** (render.yaml auto-detect) — ya **New Web Service**: Runtime *Node*, Build Command *(khali)*, Start Command `node server.js`.
3. Deploy. Link share karo. Koi npm install / build nahi chahiye.

## Local run
`node server.js` → http://localhost:3000

## Customise
- Scenes & timing: `public/js/scenes.js` (`CHAPTERS` array: duration, captions)
- Music: `public/js/audio.js` (procedural Raag Yaman — tanpura, bansuri, bells, piano)
- Look & text: `public/css/style.css`, `public/index.html`
- Link-preview image: `public/og.png` (1200×630)

Note: Browser autoplay rules ki wajah se music "Light the diya & begin" tap ke baad hi shuru hota hai.
