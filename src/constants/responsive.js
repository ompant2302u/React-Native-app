// src/constants/responsive.js
//
// Turns design values measured on ONE reference phone into values that make
// sense on every phone and tablet.
//
// THE PROBLEM THIS SOLVES
// You design against an iPhone 13. You write padding: 16 and fontSize: 16.
// On a small phone (320 wide) that is proportionally too big — the layout
// feels cramped. On a tablet (768+) it is proportionally too small — the app
// looks like a phone app blown up, with tiny text marooned in white space.

import { Dimensions, PixelRatio } from "react-native";

const { width, height } = Dimensions.get("window");

// HOW TO CHOOSE THESE:
//   BASE_WIDTH is the width of the device your MOCKUPS were measured on —
//   NOT the device you happen to be testing on. Ask the designer.
//   No designer? 390 is a safe default (iPhone 13/14/15).
//   Other common values: 375 (older iPhones, SE), 428 (Pro Max).
//
//   Getting it wrong is not catastrophic — it shifts everything by one
//   constant. On a 390 phone, a token of 16 comes out as:
//       BASE 360 -> 17.3   (8% too big, everywhere)
//       BASE 390 -> 16.0   (correct)
//       BASE 428 -> 14.6   (9% too small, everywhere)
//
//   THE RULE: pick it once, never change it mid-project. Changing it later
//   silently re-scales every screen you have already signed off.
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

// Use the SHORTEST side, not width.
// Why: in landscape, width becomes 844. If we scaled off width, rotating a
// phone would suddenly give it tablet-sized text. The shortest side is stable
// across rotation, so it is a much better proxy for "how big is this device".
const shortest = Math.min(width, height);
const longest = Math.max(width, height);

// --------------------------------------------------------------------------
// scale — pure proportional. Rarely what you want on its own.
// --------------------------------------------------------------------------
// 16 on a 390-wide phone  -> 16
// 16 on a 320-wide phone  -> 13.1
// 16 on a 768-wide tablet -> 31.5   <-- absurd for body text
export const scale = (size) => (shortest / BASE_WIDTH) * size;

// Vertical equivalent, for things that should track screen HEIGHT —
// a hero image, a bottom sheet, a splash logo.
//
// WHY IT DIFFERS FROM scale(): tablets are proportionally WIDER than phones,
// not taller. On an iPad 10" portrait, a token of 16 gives:
//       scale(16)         -> 31.5   (explodes)
//       verticalScale(16) -> 19.4   (barely moves)
// That is exactly why heights use this one and everything else does not.
export const verticalScale = (size) => (longest / BASE_HEIGHT) * size;

// --------------------------------------------------------------------------
// moderateScale — scale, but damped. THIS is the one you use.
// --------------------------------------------------------------------------
// Factor sweep, iPad 10" (768), token 16:
//       0.0 -> 16.0   identical on every device
//       0.3 -> 20.7   <- TEXT
//       0.5 -> 23.8   <- SPACING
//       1.0 -> 31.5   = scale(), too much
//
// WHICH FUNCTION TO USE:
//   fontSize .................. ms(n, 0.3)
//   padding / margin / gap .... ms(n, 0.5)
//   borderRadius .............. ms(n, 0.5)
//   icon sizes ................ ms(n, 0.4)
//   hero / splash HEIGHTS ..... verticalScale(n)
//   hairline, borderWidth ..... never scale
//   min touch target (44) ..... never scale
//
// Default to moderateScale. If you cannot articulate why something needs
// scale() or verticalScale(), it does not.
export const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// --------------------------------------------------------------------------
// px — snap to a real device pixel
// --------------------------------------------------------------------------
// Scaling produces values like 14.56. Rendering on a half pixel gives you
// slightly blurry edges and inconsistent 1px borders. This rounds to
// something the screen can actually draw.
export const px = (size) => PixelRatio.roundToNearestPixel(size);

// Convenience: scaled AND snapped, which is what the theme uses.
export const ms = (size, factor = 0.5) => px(moderateScale(size, factor));

// --------------------------------------------------------------------------
// Device facts
// --------------------------------------------------------------------------
export const isTablet = shortest >= 600;

// The user's system font-size setting (Accessibility → Display → Text Size).
// 1.0 is default; a user who has enlarged text might be at 1.3 or higher.
export const systemFontScale = PixelRatio.getFontScale();

export const screen = { width, height, shortest, longest, isTablet };

// --------------------------------------------------------------------------
// IMPORTANT LIMITATION — say this in class
// --------------------------------------------------------------------------
// Dimensions.get() is read ONCE, when this module is first imported.
// These values do NOT update when the device rotates.
//
// That is fine here, and deliberate: spacing and font sizes should not jump
// around mid-rotation, and a stylesheet is built once anyway.
//
// But anything that makes a LAYOUT DECISION from screen size — how many
// columns, is this landscape — must use the useWindowDimensions() hook
// instead, because that DOES re-render on rotation.
//
//   tokens  (padding, fontSize)  -> this file, computed once
//   layout  (columns, direction) -> useWindowDimensions(), live
