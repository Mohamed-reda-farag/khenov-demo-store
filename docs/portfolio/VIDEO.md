# 30-second video

Silent (muted) product walkthrough for the portfolio card. Target: **under 4 MB, MP4 (H.264), 1280 × 720 or 1920 × 1080, no audio**.
The portfolio auto-plays muted, so every message is on screen text.

## Before recording

1. Deploy, or run `npm run build` and `npm run preview`.
2. Open a **Guest window** in Chrome (no extensions, no bookmarks bar, no profile pictures).
3. Open the home page with `?demo=fast` so nothing waits: `https://<your-address>/ar/?demo=fast`.
4. Press **Reset demo** in the footer to start from an empty cart and no orders.
5. Browser zoom 100%, window maximised at **1920 × 1080**, Windows display scaling 100% if you can (otherwise record a region of 1920 × 1080).
6. Close notifications (Windows Focus Assist on) and hide the taskbar if possible.
7. Rehearse once. Move the mouse slowly and in straight lines; pause 0.5 s before each click.

## Script

| Time        | What happens on screen                                                                                                                                   | On-screen text (AR)                      | On-screen text (EN)                             |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------------------------------------- |
| 0:00 – 0:03 | Arabic home page, hero visible. Slow scroll down one screen.                                                                                             | «أثر» · متجر أحذية خيالي · عرض من KHENOV | ATHAR · a fictional shoe store · demo by KHENOV |
| 0:03 – 0:08 | Hover **Shop** in the header (mega menu opens), click a category. The grid loads; hover a card to show its second photo.                                 | تصفّح سريع بفلاتر وأقسام                  | Browse with filters and categories              |
| 0:08 – 0:13 | Open a product. Click through the gallery photos, switch colour, pick a size.                                                                            | ألوان ومقاسات حسب المتاح                 | Colours and sizes by availability               |
| 0:13 – 0:17 | Press **Add to cart**: the drawer opens, the badge pops. Press **View cart**, type `ATHAR10`, press **Apply**.                                           | سلة وأكواد خصم                           | Cart and promo codes                            |
| 0:17 – 0:23 | **Checkout**: the form is pre-filled in the recording by pasting (see tip). Choose cash on delivery, place the order. The order page shows the timeline. | طلب كامل بخطوات واضحة (محاكاة)           | A complete order flow (simulated)               |
| 0:23 – 0:27 | Press the language button: the whole page flips from right-to-left Arabic to English.                                                                    | عربي · English — اتجاه RTL/LTR كامل      | Arabic · English, full RTL/LTR                  |
| 0:27 – 0:30 | End card (add in the editor): the ATHAR logo and one line.                                                                                               | عرض تجريبي — متجر وهمي بلا دفع حقيقي     | Demo — fictional store, no real payments        |

Tip for the checkout part: type the form once while rehearsing and **cut the typing** in the editor, or paste ready values
(Chrome autofill works in a Guest window only if you have saved a profile, so pasting is simpler). Do not show a real email or phone number:
use `demo@example.com` and `01000000000`.

Keep the on-screen text short, in the same font as the site if you can (Readex Pro for Arabic, Bricolage Grotesque for English; both are free).
Put the Arabic line on top and the English line under it, or run two versions of the video (AR and EN) if the portfolio supports it.

## Recording on Windows (free tools)

| Tool                                           | Notes                                                                                                      |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Xbox Game Bar** (`Win + G`, `Win + Alt + R`) | Built in, records one window at 1080p, 30 fps. Simplest. It records only the active window.                |
| **OBS Studio** (<https://obsproject.com>)      | Free. Settings → Video: base and output 1920 × 1080, 30 fps. Output: MP4, quality "High", no audio source. |
| **Clipchamp** (Windows 11)                     | Built in; can record the screen and also edit, add text and export 1080p.                                  |

Record at 30 fps with the mouse cursor visible. Record a few seconds more than you need at the start and the end.

## Editing checklist

- [ ] Trim to **30 seconds or less**. Cut waiting, typing and mistakes.
- [ ] Every action in the script is visible for at least 1.5 seconds.
- [ ] On-screen text is readable on a phone (large, high contrast, not over busy photos).
- [ ] No real personal data, no browser UI, no notifications, no taskbar.
- [ ] The "Demo by KHENOV" badge is visible in at least the first and last seconds.
- [ ] No audio track (export without audio).
- [ ] Export 1080p MP4 (H.264), then compress as below.
- [ ] Watch the compressed file once at full size and once on a phone.

Free editors: **Clipchamp** (Windows 11), **DaVinci Resolve** (free version) or **Shotcut**.

## Compress with ffmpeg

Install once (PowerShell): `winget install Gyan.FFmpeg`, then open a new window.

```powershell
# 1280x720, no audio, web-friendly. CRF 28 is a good start for screen recordings.
ffmpeg -i raw.mp4 -vf "scale=1280:-2,fps=30" -an -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p -movflags +faststart athar-demo.mp4

# Check the size in MB. If it is over 4, raise -crf to 30 or 32 and run it again.
"{0:N2} MB" -f ((Get-Item athar-demo.mp4).Length / 1MB)

# Poster image (the frame shown before the video plays), taken at 2 seconds.
ffmpeg -i athar-demo.mp4 -ss 00:00:02 -frames:v 1 -quality 85 athar-demo-poster.webp
```

If a 30-second clip is still above 4 MB at CRF 32, lower the output size (`scale=960:-2`) rather than going higher: screen recordings
compress very well but fine text turns blurry past CRF 32.
