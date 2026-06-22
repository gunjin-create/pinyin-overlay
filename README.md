# Pinyin Overlay (Android)

Draws **pinyin above Chinese text in any app** (WeChat, Chrome, menus, etc.).

It uses an Android **AccessibilityService** to read on-screen text and a system
**overlay** to paint pinyin labels on top. Everything runs **on-device** —
text never leaves the phone.

---

## Architecture

```
┌─────────────────────────────┐   Expo / TypeScript (App.tsx)
│  Onboarding · permissions   │   – guides setup, edits settings
│  · tone style · text size   │   – calls the native module
└──────────────┬──────────────┘
               │  Expo Modules bridge (modules/pinyin-overlay/index.ts)
┌──────────────▼──────────────┐   Native Kotlin (modules/pinyin-overlay/android)
│ PinyinOverlayModule.kt      │   – permission checks, opens settings, stores prefs
│ PinyinAccessibilityService  │   – walks the view tree of the foreground app,
│   .kt                       │     finds Han text nodes + their screen bounds
│ OverlayView.kt              │   – Canvas view that paints pinyin bubbles
│ PinyinConverter.kt          │   – Hanzi → pinyin (pinyin4j, offline, tone marks)
│ OverlaySettings.kt          │   – SharedPreferences shared module ↔ service
└─────────────────────────────┘
```

### Key constraint (read this)
Accessibility data gives you each text node's **string** and the **bounding box
of the whole text view** — *not* per-glyph pixel positions. So the overlay
covers each Chinese text run with a **translucent mask and fits the pinyin
across that box** (Google-Translate live-camera style), replacing the run in
place. This is reliable across apps. True per-*character* alignment would require
OCR (camera route) or app-specific hacks.

---

## One-time setup

You need the Android toolchain (not yet installed on this machine):

1. **Install Android Studio** → https://developer.android.com/studio
   During first launch let it install the **Android SDK (API 34)** and an
   **emulator** image, or enable USB debugging on a physical phone.
2. Set the env vars (PowerShell, then restart the terminal):
   ```powershell
   setx ANDROID_HOME "$env:LOCALAPPDATA\Android\Sdk"
   setx JAVA_HOME "C:\Program Files\Microsoft\jdk-17"   # or your JDK 17 path
   ```
3. Install JS deps:
   ```powershell
   npm install
   ```

## Build & run

Because this app ships **custom native code**, it can't run in Expo Go — it uses
a dev client / prebuild:

```powershell
npx expo prebuild --platform android   # generates the android/ project
npx expo run:android                    # builds + installs on device/emulator
```

## Enable it on the device

1. Open **Pinyin Overlay**.
2. **Step 1** → tap *Open Accessibility settings* → turn on “Pinyin Overlay”.
3. **Step 2** → tap *Open overlay permission* → allow “Display over other apps”.
4. Switch to any app with Chinese text — pinyin bubbles appear above it.

Toggle the overlay, tone style (`nǐ hǎo` / `ni3 hao3` / `ni hao`), and text size
from the app’s Settings card at any time.

---

## Roadmap / good next steps
- **Tap-to-define**: make labels touchable → show a dictionary gloss (CC-CEDICT).
- **Per-app allowlist**: only overlay in chosen apps.
- **Word segmentation**: group characters into words for more natural spacing.
- **Camera mode**: ML Kit OCR for signs/menus where there's no text node.
- **Polyphone accuracy**: pinyin4j returns the first reading; add context rules.

## Project layout
| Path | Purpose |
|------|---------|
| `App.tsx` | Settings / onboarding UI |
| `modules/pinyin-overlay/index.ts` | TS API surface for the native module |
| `modules/pinyin-overlay/android/.../PinyinAccessibilityService.kt` | Reads screen text, drives the overlay |
| `modules/pinyin-overlay/android/.../OverlayView.kt` | Paints pinyin labels |
| `modules/pinyin-overlay/android/.../PinyinConverter.kt` | Hanzi → pinyin |
| `modules/pinyin-overlay/android/.../PinyinOverlayModule.kt` | JS ↔ native bridge |
