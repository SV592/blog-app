---
title: "Checkerboarding - Why Your Page Tears Open During a Fast Scroll"
date: "2026-11-06"
description: How Chrome paints pages in tiles, why fast scrolling exposes the layer underneath, and how to trace and reduce checkerboarding.
tags: ["Chrome", "Performance", "CSS"]
image: "/blogImages/checkerboard.jpg"
slug: checkerboarding
---

## When the Background Breaks Through

Picture a page with a photo pinned behind a column of content cards. Scroll slowly and everything looks perfect. Flick the mouse wheel hard and, for a split second, the cards and text vanish. The bare photo shows through in rectangular patches, and then the content pops back in a frame or two later.

That flash has a name: **checkerboarding**. It comes from the way Chrome draws pages, and once you understand the mechanism, you can measure it, shrink it, and choose what your users see when it happens.

## How Chrome Paints a Page

Chrome splits rendering across threads. The main thread runs JavaScript, style and layout, and records paint commands. The **compositor thread** takes those recordings, turns them into pixels (rasterization), and assembles the final frame on the GPU.

Rasterization happens in **tiles**, square-ish chunks of a layer roughly 256 pixels on a side. Chrome rasters the tiles in the viewport first, then keeps going into an "interest area" around it, so the next stretch of the page is ready before you scroll to it.

Scrolling belongs to the compositor. When you turn the wheel, the compositor moves the already-rastered tiles and produces a new frame right away, without waiting on the main thread. This is what makes scrolling in Chrome feel smooth even while JavaScript is busy.

## Where the Holes Come From

The compositor draws whatever tiles are ready. When you scroll faster than raster can keep up, the frame reaches parts of the page whose tiles are still being painted. Chrome draws those spots empty, and whatever sits beneath the layer shows through.

On a plain page, the gap shows a background color and the effect is barely visible. On a page with a pinned photo behind the content, the gap shows the photo itself, with every card and line of text missing. The photo is innocent. It is simply the thing behind the hole. A frame or two later the tiles finish rastering and the content fills in.

![Two browser viewports side by side. On the left, every raster tile is painted and the content cards sit over a pinned sunset photo. On the right, a fast scroll has outrun raster: the lower tiles are missing, so the bare photo shows through where the cards should be.](/blogImages/checkerboarding-diagram.svg)

The name comes from early mobile browsers, which filled unpainted areas with a gray checkerboard pattern so users knew more content was on its way.

## Tracing It

Guessing at scroll jank wastes time. A trace shows the mechanism directly.

**Make the tiles visible.** Open DevTools, press `Ctrl+Shift+P` (`Cmd+Shift+P` on macOS), and run **Show Rendering**. Turn on:

- **Layer borders**, which outlines composited layers and the tile grid inside them.
- **Paint flashing**, which highlights regions as they repaint.

Scroll quickly and watch the tile grid fill in behind the viewport.

**Record a compositor trace.** Open [ui.perfetto.dev](https://ui.perfetto.dev) (or `chrome://tracing`), start a Chrome recording with the `cc` and `viz` categories enabled, and perform a few fast wheel scrolls. The `cc` category covers the compositor: tile management, raster tasks, and frame production. Look for frames that were drawn with missing tiles and for raster tasks that run long.

In one trace of a page like the one above, every fast wheel scroll produced four to six frames with missing tiles. A consistent count like that confirms the diagnosis: raster falls behind on fast scrolls, every time, and the photo appears through the gaps.

**Reproduce it consistently.** Test on the hardware your users have. A fast desktop GPU hides problems that a mid-range laptop exposes. In the DevTools **Performance** panel, CPU throttling slows raster as well and makes the checkerboarding easy to catch.

## Making Raster Cheaper

Every millisecond saved in raster shrinks the holes. Start with the most expensive paint operations.

**Go easy on costly effects.** Large blur radii, `filter: blur()`, `backdrop-filter`, and big soft `box-shadow`s all multiply raster work, and they hurt most when repeated on every card in a long list.

```css
/* Expensive when repeated across dozens of cards */
.card {
  backdrop-filter: blur(16px);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.45);
}

/* Cheaper: a solid tinted surface and a tighter shadow */
.card {
  background-color: rgba(20, 24, 32, 0.92);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
```

**Size images for their slots.** Raster includes image decoding. A 4000-pixel photo shown in a 400-pixel card costs far more to decode than one that fits. Serve sized images with `srcset` and let decoding run off the critical path:

```html
<img
  src="/images/card-800.jpg"
  srcset="/images/card-400.jpg 400w, /images/card-800.jpg 800w"
  sizes="(max-width: 600px) 100vw, 400px"
  decoding="async"
  alt="..."
/>
```

## Handling the Pinned Background

A common way to pin a photo is `background-attachment: fixed` on the body. Chrome can end up repainting that background as the page scrolls, which piles more raster work onto exactly the moment raster is already struggling.

A dedicated fixed element works better. It gets its own composited layer, rastered once, and the compositor keeps it in place for free:

```css
/* Before */
body {
  background: url("/images/backdrop.jpg") center / cover fixed;
}

/* After */
.backdrop {
  position: fixed;
  inset: 0;
  z-index: -1;
  background: url("/images/backdrop.jpg") center / cover;
  will-change: transform;
}
```

Use `will-change` sparingly. Each promoted layer costs GPU memory, and promoting dozens of elements creates its own performance problems. One full-screen backdrop is a sensible use.

## Designing for the Gap

At extreme scroll speeds, some checkerboarding will survive every optimization. Raster has a speed limit, and a determined flick can outrun it. The final lever is choosing what users see in that moment.

- **Tone down the backdrop.** A darkened or blurred photo, with the blur baked into the image file, makes a brief gap look like part of the design.
- **Match colors.** When the backdrop's dominant color sits close to the card color, a missing tile reads as a soft flicker and the jarring flash disappears.
- **Keep the scroller opaque where it matters.** For content that has to stay readable, a solid background color on the scrolling container means a gap shows that color, a far calmer effect than a full photo.

## Summary

Checkerboarding happens when scrolling outruns rasterization. Chrome paints the page in tiles ahead of the viewport, and a fast enough scroll reaches tiles that are still being painted. Whatever lies beneath the layer shows through until they finish. Measure it with layer borders and a `cc` trace, shrink it by making raster cheaper and giving pinned backgrounds their own layer, and decide deliberately what appears in the gap that remains.

## References and Further Reading

- **[Inside Look at Modern Web Browser (Part 3)](https://developer.chrome.com/blog/inside-browser-part3)**
  Chrome's own walkthrough of the rendering pipeline, including tiling, rasterization, and the compositor thread.

- **[RenderingNG Architecture](https://developer.chrome.com/docs/chromium/renderingng-architecture)**
  A deeper look at how Chromium splits work between the main thread, compositor, and GPU process.

- **[Perfetto UI](https://ui.perfetto.dev)**
  The trace recorder and viewer for Chrome, with support for the `cc` and `viz` categories.

- **[Chrome DevTools: Rendering Tab](https://developer.chrome.com/docs/devtools/rendering/performance)**
  Reference for layer borders, paint flashing, and other rendering overlays.

- **[MDN: will-change](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change)**
  Guidance on when layer promotion helps and when it costs more than it saves.
