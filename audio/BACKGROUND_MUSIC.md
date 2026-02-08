# Solana AI City Background Music

## Background Music Requirements

### Game Audio Needs

|场景|音乐风格|时长|
|---|-------|---|
|Main Menu|Epic/Cinematic|Loop|
|City Building|Ambient/Chill|Infinite|
|Dungeon Explore|Heroic/Intense|Infinite|
|Victory Fanfare|Triumphant|10-30s|
|Defeat/Sad|Melancholic|10-30s|

### Free Music Sources

1. **YouTube Audio Library** - Royalty-free
2. **Free Music Archive** - Creative Commons
3. **Incompetech** - Kevin MacLeod
4. **Bensound** - Free for non-commercial
5. **Pixabay Music** - Royalty-free

### Recommended Tracks

#### Epic/Game Music
- "Cyberpunk City" style
- "Journey" ambient
- "Epic Orchestra"

#### Chill/Build Mode
- "Sunny Morning"
- "Cozy Campfire"
- "Floating Steps"

---

## Music Integration Plan

```html
<!-- Game background music -->
<audio id="bgm" loop>
  <source src="music/epic-theme.mp3">
</audio>

<!-- Sound effects -->
<audio id="sfx-build" src="sfx/build.mp3"></audio>
<audio id="sfx-coin" src="sfx/coin.mp3"></audio>
```

---

## Generate with AI (Optional)

Use these services for custom game music:

1. **Suno AI** - suno.ai
   - Prompt: "Epic game soundtrack, city building, adventure, orchestral"

2. **Udio** - udio.com
   - Prompt: "Chill background music, city builder game, loop"

3. **AIVA** - aiva.ai
   - Compose custom game music

---

## Current Status

| Item | Status |
|------|--------|
| Voice/Audio | ✅ Done |
| Background Music | ⏳ Pending |
| Sound Effects | ⏳ Pending |

---

## Quick Wins

1. **Download free game music** from Pixabay
2. **Add to audio/music/** folder
3. **Update index.html** with music player
