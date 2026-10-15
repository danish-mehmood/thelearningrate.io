# The Learning Rate

A hand-drawn / illustrated ML explainer blog, built with **Astro + React islands + rough.js**.

## Run it

```bash
npm install
npm run dev      # local dev at http://localhost:4321
npm run build    # static build into dist/
npm run preview  # preview the build
```

## How it's organized

```
src/
  styles/global.css          ← the whole visual identity lives here (tokens at the top)
  content.config.ts          ← blog post schema (title, description, pubDate, tags, draft)
  content/posts/*.mdx        ← your posts; write Markdown + drop in components
  components/
    LossCurve.tsx            ← React island: sketchy diagram with a rolling ball
    Annotate.tsx             ← React island: self-drawing underline/circle/etc.
    Figure.astro             ← captioned card with a sketched border
    MarginNote.astro         ← rotated aside with a sketched border
  layouts/
    BaseLayout.astro         ← page shell, fonts, and the sketch-border script
    PostLayout.astro         ← post header + prose
  pages/
    index.astro              ← post list (home)
    about.astro
    posts/[...slug].astro    ← renders each post
```

## Writing a post

Create `src/content/posts/my-post.mdx`:

```mdx
---
title: My explainer
description: One-line summary for the home page.
pubDate: 2026-10-20
tags: ['intuition']
draft: false
---

import Annotate from '../../components/Annotate.tsx';

Plain Markdown, plus <Annotate client:visible type="circle">a circled phrase</Annotate>.
```

Interactive components need a `client:*` directive (`client:visible` is a good default).

## Make it yours

- **Colors / fonts:** edit the tokens at the top of `src/styles/global.css`.
- **New diagram types:** copy `LossCurve.tsx` as a starting point — it shows the rough.js +
  theme-aware + replay pattern.
- **Sketchy borders:** add `data-sketch-frame` to any element.
