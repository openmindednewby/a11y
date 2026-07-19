# @dloizides/a11y

The accessibility **platform seam** for the dloizides.com RN-web UI kit.

One authored contract in, platform-correct props out — including the hint, which
react-native-web otherwise **drops silently**.

```bash
npm install @dloizides/a11y
```

---

## The bug this exists to fix

All seven portals are React Native + Expo but ship **web only**. On web,
react-native-web maps `accessibilityLabel` → `aria-label`, but **`accessibilityHint` has
no ARIA equivalent and is discarded**. An element authored like this:

```tsx
<TouchableOpacity accessibilityLabel="QR code" accessibilityHint="Opens the QR modal" />
```

renders `aria-label` + `role` + `tabindex` and **no hint attribute at all**.

The repo-wide rule *"every interactive element needs testID + accessibilityLabel +
accessibilityHint"* therefore bought **nothing on web**.

It hid for years because **a DOM assertion cannot distinguish a threaded hint from a
dropped one** — both render identically. No test could see it, so nothing ever failed.

---

## Usage

```tsx
import { useA11y } from '@dloizides/a11y';

const { a11yProps, hintNode } = useA11y({
  label: 'Save',
  hint: 'Saves the menu and returns to the list',
  role: 'button',
  state: { disabled, busy: loading },
  testID: 'save-button',
});

return (
  <TouchableOpacity {...a11yProps} onPress={onPress}>
    {children}
    {hintNode}
  </TouchableOpacity>
);
```

`hintNode` is `null` on native and when there is no hint, so an unconditional
`{hintNode}` is always correct.

### What comes out

| authored | native | web |
|---|---|---|
| `label` | `accessibilityLabel` | `aria-label` |
| `hint` | `accessibilityHint` | `aria-describedby` → a rendered, visually-hidden node |
| `role` | `accessibilityRole` (RN vocabulary) | `role` (ARIA vocabulary — see below) |
| `state` | `accessibilityState` | `aria-disabled` / `-selected` / `-expanded` / `-busy` / `-checked` |
| `testID` | `testID` | `testID` (RN-web emits `data-testid`) |

---

## Design notes

### Why the hint becomes a node, not an attribute

`aria-describedby` is a **pointer**. Without a rendered element carrying the id, the
attribute references nothing and assistive technology announces nothing. So the
description has to genuinely exist in the document — visually hidden, but present.

The node is rendered as a **descendant** of the host, so it mounts and unmounts with it;
a dangling reference to a node that outlived its owner is not possible. It is hidden with
`position:absolute` + 1×1 + `overflow:hidden` — never `display:none`, `visibility:hidden`
or `opacity:0`, all of which risk removing it from the accessibility tree and silently
undoing the entire fix.

### Why it can't be forgotten quietly

Three layers, earliest-catching first:

1. **One call returns both.** You cannot obtain `a11yProps` without `hintNode` landing in
   the same destructure, one identifier away. No separate import to discover.
2. **Dev runtime guard.** After commit, on web, the hook checks the described-by target is
   actually in the document and `console.error`s if not. The failure mode becomes
   **noisy** — the one thing the original bug never was.
3. **The dual test gate.** Web assertions resolve `aria-describedby` to real text, so a
   component that dropped the node fails rather than passing vacuously.

Note who calls this: **apps never do.** They keep passing `accessibilityHint` to
`<Button>`. Only the kit components call `useA11y`, which is a small, reviewed surface.

### Why the role table is total

RN's role vocabulary and ARIA's overlap but are not the same set. Pass-through produces
invalid ARIA, which browsers ignore — failing the same silent way the hint did. The
notable divergences:

| RN | ARIA | why |
|---|---|---|
| `header` | `heading` | `header` **is** valid ARIA (a landmark) — pass-through would silently turn every heading into a landmark. Worse than dropping it. |
| `search` | `searchbox` | ARIA's `search` is a landmark; RN's means a search *field*. |
| `none` | `presentation` | |
| `image` | `img` | |
| `adjustable` | `slider` | |
| `imagebutton`, `keyboardkey` | `button` | no ARIA equivalent |
| `text`, `summary` | *(omitted)* | no faithful equivalent — better to say nothing |

The table lists **every** `A11yRole` explicitly and is typed `Record<A11yRole, Role>`, so
adding a role without deciding its ARIA spelling is a **compile error**.

---

## The dual-platform test gate

`npm test` runs the suite under **two** Jest projects with different transforms,
environments and module resolution:

| project | `react-native` resolves to | `Platform.OS` | renderer | transform |
|---|---|---|---|---|
| `web` | `react-native-web` | `'web'` | @testing-library/react → jsdom | ts-jest |
| `native` | the **real** `react-native` | `'ios'` | react-test-renderer | babel-jest (RN preset) |

```bash
npm test           # both
npm run test:web
npm run test:native
```

Each project asserts what its platform actually emits — the web suite resolves
`aria-describedby` through the DOM to real text; the native suite asserts
`accessibilityHint === X`. **The disagreement is the product.** If you ever find yourself
making the two agree by weakening an assertion, stop.

Both projects also assert their own platform identity (`Platform.OS`), so a
`moduleNameMapper` leaking into the native project — which would quietly collapse it into
a second copy of the web project — fails loudly instead of passing.
