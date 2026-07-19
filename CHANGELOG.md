# Changelog

All notable changes to `@dloizides/a11y` are documented here.

## 1.0.0

Initial release — the accessibility platform seam for the dloizides.com RN-web UI kit.

### Added

- **`a11y(contract)`** — pure adapter. One semantic contract (`label` / `hint` / `role` /
  `state` / `testID`) emitted as platform-correct props: RN `accessibility*` on native,
  real ARIA on web.
- **`useA11y(contract)`** — returns `{ a11yProps, hintNode }` from ONE call, generating a
  stable collision-free id from React's `useId()`, plus a dev-only runtime guard that
  `console.error`s when the described-by target is not in the document.
- **`<A11yHint>`** — the visually-hidden description node that makes `aria-describedby`
  point at something real.
- **`toAriaRole()`** — total RN-role → ARIA-role table, typed so an undecided role is a
  compile error.
- **The dual-platform Jest gate** — the suite runs under both `react-native-web` (jsdom +
  ts-jest) and the real `react-native` (react-test-renderer + babel-jest), asserting the
  emitted output per platform.

### Why

`accessibilityHint` has no ARIA equivalent, so react-native-web discards it. Every portal
in the fleet has been shipping decorative hints for years, and no DOM assertion could have
caught it: a threaded hint and a dropped hint render identically. This package makes the
hint real on web via `aria-describedby` → a visually-hidden node, and makes the difference
between the two platforms testable.
