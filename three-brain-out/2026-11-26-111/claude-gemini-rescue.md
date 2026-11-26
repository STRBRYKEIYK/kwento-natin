**Blocker: No supported route exists without new credentials.**

Gemini CLI's OAuth login targets **Code Assist**, a paid Google Cloud subscription product. Your account isn't subscribed — that's the `UNSUPPORTED_CLIENT` / `IneligibleTierError`. This isn't a version bug; 0.71.1 behaves identically.

**The only free path:** Generate a `GEMINI_API_KEY` at [aistudio.google.com](https://aistudio.google.com) (free tier, ~30 seconds, uses your existing Google account). Set it:

```
export GEMINI_API_KEY=your_key
```

That's technically a "new credential" but costs nothing and requires no subscription. Without it, Vertex config, or a Code Assist subscription, the CLI has no authentication path. There is no workaround.
