# Solana AI City Audio Files

## Audio Assets

| File | Description | Duration |
|------|-------------|----------|
| `voice-1770516767619.mp3` | Welcome/Promo Audio | ~15s |
| `voice-1770516773719.mp3` | Game Features Audio | ~15s |

## Usage

```html
<audio controls>
  <source src="audio/voice-1770516767619.mp3" type="audio/mpeg">
  Your browser does not support the audio element.
</audio>
```

## Scripts

Use `tts.py` to generate new audio:

```python
from tts import text_to_speech

audio = text_to_speech("Your text here")
```

## Audio Files Location

```
solana-ai-city/
  audio/
    voice-1770516767619.mp3  (Welcome)
    voice-1770516773719.mp3  (Features)
```

---
*Generated: 2026-02-08*
