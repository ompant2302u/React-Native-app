# Meal Collection

A React Native app built with Expo, developed live across the course. It shows a
collection of meals as cards that reflow from one column on a phone to two on a
tablet.

Built on **Expo SDK 54** / React Native 0.81 / React 19, with the New
Architecture enabled.

---

## Before you start

**Node.js 20.19.4 or newer.** This is a hard requirement from React Native
itself, not a suggestion — older versions fail in confusing ways. Check yours:

```bash
node -v
```

If it's too old, install a current version from [nodejs.org](https://nodejs.org)
or via [nvm](https://github.com/nvm-sh/nvm).

You also need **one place to actually run the app**. Pick whichever you have:

| Option | What you need |
|---|---|
| Your own phone | The **Expo Go** app, from the App Store or Play Store |
| iOS Simulator | **Xcode** (macOS only) |
| Android Emulator | **Android Studio**, with a virtual device created |
| Web browser | Nothing extra |

Your own phone is the easiest starting point and the closest to the real thing.

---

## Getting it running

Clone the repo and install dependencies:

```bash
git clone https://github.com/ashrestha27/Meal-Collection.git
cd Meal-Collection
npm install
```

Start the development server:

```bash
npm start
```

A QR code appears in the terminal. From there:

- **On your phone** — make sure the phone and your computer are on the **same
  Wi-Fi network**, then scan the QR code. Android: scan from inside Expo Go.
  iOS: scan with the normal Camera app.
- **In a simulator** — press `i` for iOS or `a` for Android in the terminal
  where the server is running.
- **In a browser** — press `w`.

You can also skip the QR code and go straight to a target:

```bash
npm run ios       # iOS simulator
npm run android   # Android emulator
npm run web       # browser
```

The app reloads automatically as you save files. Press `r` in the terminal to
force a reload, or `j` to open the debugger.

The meal images are loaded from TheMealDB over the internet, so cards will have
blank image areas if you're offline. Everything else still works.

---

## How the project is laid out

```
index.js                    registers the app with Expo
App.js                      root component
src/
  components/
    ListScreen.jsx          the screen — a FlatList of meal cards
    MealItem.jsx            one meal card (exports MealCard)
    TagItem.jsx             the row of tag pills (exports Tags)
  constants/
    responsive.js           scales sizes across phones and tablets
    theme.js                design tokens — colours, spacing, fonts
  data/
    seed.js                 starter meals, replaced with your own later
assets/                     icons and splash screen
```

There's no navigation library yet — the app is a single screen.

### One rule worth knowing early

**Colours, spacing, font sizes and radii never get typed directly into a
component.** They come from `src/constants/theme.js`:

```jsx
import { colors, spacing, fontSize } from "../constants/theme";

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
});
```

Right now there's one screen, so writing `'#2563eb'` directly would feel
harmless. By the end of the course that colour appears in about thirty places,
and changing it means thirty edits — and you *will* miss some. One file, one
edit, whole app changes.

`theme.js` and `responsive.js` are both heavily commented and explain the
reasoning in full. They're worth reading properly rather than skimming.

---

## When something goes wrong

**Stale or bizarre errors after changing dependencies** — clear the Metro cache:

```bash
npx expo start -c
```

**Phone can't find the server** — it's almost always the network. Both devices
must be on the same Wi-Fi, and some university, workplace and guest networks
block the connection. Use `npx expo start --tunnel` to route around it (slower,
but works nearly anywhere).

**Dependency versions look wrong** — these two check and fix alignment with the
SDK:

```bash
npx expo install --check
npx expo-doctor
```

Always install new packages with `npx expo install <package>` rather than
`npm install`. It picks the version that matches Expo SDK 54; `npm install`
grabs the latest, which is often incompatible.

**A truly stuck project** — delete and reinstall:

```bash
rm -rf node_modules
npm install
```

---

## Notes

There are no tests or linting configured in this project — you verify changes by
running the app and looking at it.

There are no `ios/` or `android/` folders, and that's intentional. This is a
managed Expo project: the native projects are generated when needed. Adding a
library that requires native code means creating a development build rather than
editing native source.

When writing code against Expo APIs, use the SDK 54 documentation
specifically — [docs.expo.dev/versions/v54.0.0](https://docs.expo.dev/versions/v54.0.0/).
Expo has changed a lot between versions, and older tutorials and blog posts will
send you wrong.
