# Changelog

## 1.3.1

**One touch-target floor for the whole kit.**

The kit had no shared definition of the minimum interactive size, so each package
re-decided it independently — and the Digital Kin CMS shipped **22 of 22 buttons and
10 of 10 inputs below the standard**, with text inputs **19px tall**, while every
package believed it was doing the right thing.

This exports the floor and a helper so `ui-buttons`, `ui-forms` and `ui-layout`
enforce one number instead of three opinions. **Publish this first** — the other
three declare `^1.3.0`.


All notable changes to `@dloizides/a11y` are documented here.

## 1.0.1

Docs + one new test. No runtime change.

- Pins that the hint **never leaks into the accessible NAME**. The hidden node is a
  descendant of the host, so `textContent` includes the hint — but `aria-label` takes
  precedence over content per the ARIA spec, which is what keeps every
  `getByRole('button', { name })` locator in the fleet working. That precedence silently
  disappearing would be an E2E-wide breakage, so it is now asserted rather than assumed.
- Documents the trade-off and the residual exposure (raw `textContent` assertions on
  interactive elements) in the README.

## 1.0.0

Initial supported release — the accessibility platform seam for the dloizides.com RN-web
UI kit. **Consume this, not 0.10.0.**

> `0.10.0` was published first by a mis-aimed bump (`-Bump minor` from the 0.9.0 seed
> version yields 0.10.0, not 1.0.0). It is byte-identical in behaviour to 1.0.0 but a
> `0.x` range signals "unstable" to every consumer, which this is not. Left on the
> registry rather than unpublished — deleting versions breaks lockfiles — but nothing
> should depend on it.

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
