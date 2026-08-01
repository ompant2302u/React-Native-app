// src/constants/theme.js
//
// Design tokens. Every colour, space and size in the app comes from here.
//
// WHY THIS FILE EXISTS — say this in class:
// Right now you have one screen, so hard-coding '#2563eb' feels fine. By Day 9
// you will have five screens and that colour will appear in about thirty
// places. Changing it then means thirty edits and you WILL miss some.
//
// One file. One edit. Whole app changes.

import { Platform, StyleSheet } from "react-native";
import { isTablet, ms } from "./responsive";

export const colors = {
  bg: "#f4f5f7",
  surface: "#ffffff",
  primary: "#2563eb",
  primaryDark: "#1e40af",
  text: "#111827",
  textMuted: "#6b7280",
  textFaint: "#9ca3af",
  border: "#e5e7eb",
  tagBg: "#e0e7ff",
  tagText: "#3730a3",
  danger: "#dc2626",
  favourite: "#f59e0b",
};

// --------------------------------------------------------------------------
// SPACING — a 4-point scale, adapted to the device
// --------------------------------------------------------------------------
// The raw numbers are what you would measure on an iPhone 13 mockup.
// ms() adapts them: smaller on a small phone, larger on a tablet, damped so
// nothing becomes cartoonish.
//
// factor 0.5 (the ms default) — layout can breathe more on a big screen.
export const spacing = {
  xs: ms(4),
  sm: ms(8),
  md: ms(12),
  lg: ms(16),
  xl: ms(24),
  xxl: ms(32),
};

export const radius = {
  sm: ms(6),
  md: ms(10),
  lg: ms(14),
  pill: 999, // NOT scaled — 999 just means "fully round"
};

// --------------------------------------------------------------------------
// FONT SIZES — scaled LESS aggressively than spacing
// --------------------------------------------------------------------------
// factor 0.3, not 0.5. Text that grows with the screen looks wrong much
// faster than spacing does — 24pt body text on a tablet reads like a
// children's book. Whitespace can stretch; text mostly should not.
export const TEXT_FACTOR = 0.3;

export const fontSize = {
  xs: ms(12, TEXT_FACTOR),
  sm: ms(14, TEXT_FACTOR),
  md: ms(16, TEXT_FACTOR),
  lg: ms(18, TEXT_FACTOR),
  xl: ms(24, TEXT_FACTOR),
  xxl: ms(30, TEXT_FACTOR),
};

// Line height that tracks the font size. 1.4 is a readable default for UI.
export const lineHeight = (size) => Math.round(size * 1.4);

// --------------------------------------------------------------------------
// Things that must NOT scale
// --------------------------------------------------------------------------
export const fixed = {
  // A hairline is a hairline on every device. Scaling makes borders fuzzy.
  hairline: StyleSheet.hairlineWidth,

  // Minimum tappable size. Apple and Google both say ~44dp.
  // This is an accessibility floor, not a design value — it must NOT shrink
  // on a small phone, because fingers are the same size everywhere.
  minTouch: 44,
};

// --------------------------------------------------------------------------
// Platform-specific shadow, in ONE place.
// iOS reads the four shadow* props. Android reads only elevation.
// --------------------------------------------------------------------------
export const shadow = (level = 1) =>
  Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.06 + level * 0.02,
      shadowRadius: level * 6,
      shadowOffset: { width: 0, height: level * 2 },
    },
    android: {
      elevation: level * 2,
    },
    default: {},
  });

export { isTablet };

export default {
  colors,
  spacing,
  radius,
  fontSize,
  lineHeight,
  fixed,
  shadow,
  isTablet,
};
