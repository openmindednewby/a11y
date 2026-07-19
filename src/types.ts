/**
 * The semantic accessibility contract — what the AUTHOR means, stated once,
 * independent of which platform renders it.
 *
 * Everything here is platform-neutral on purpose. `a11y()` is the only place
 * that knows how each platform actually expresses these ideas.
 */
import type { Role } from 'react-native';

/**
 * Interaction/selection state. Deliberately a subset of RN's `AccessibilityState`:
 * only the members with a faithful expression on BOTH platforms are modelled, so a
 * contract can never promise something one platform silently drops (the exact bug
 * class this package exists to close).
 */
export interface A11yState {
  /** Interaction is unavailable. -> `accessibilityState.disabled` / `aria-disabled`. */
  disabled?: boolean;
  /** Currently chosen within a set. -> `accessibilityState.selected` / `aria-selected`. */
  selected?: boolean;
  /** Owns collapsible content that is currently open. -> `aria-expanded`. */
  expanded?: boolean;
  /** An async operation is in flight. -> `aria-busy`. */
  busy?: boolean;
  /** Checkbox/switch/radio state. `'mixed'` is the tri-state (indeterminate). */
  checked?: boolean | 'mixed';
}

/**
 * The roles this adapter accepts. These are React Native `accessibilityRole`
 * names — the RN vocabulary is the source of truth because it is the smaller,
 * stricter set, and mapping RN -> ARIA is lossless in a way ARIA -> RN is not.
 *
 * See `roleMap.ts` for the (non-1:1) translation to ARIA.
 */
export type A11yRole =
  | 'none'
  | 'button'
  | 'link'
  | 'search'
  | 'image'
  | 'imagebutton'
  | 'keyboardkey'
  | 'text'
  | 'adjustable'
  | 'header'
  | 'summary'
  | 'alert'
  | 'checkbox'
  | 'combobox'
  | 'menu'
  | 'menubar'
  | 'menuitem'
  | 'progressbar'
  | 'radio'
  | 'radiogroup'
  | 'scrollbar'
  | 'spinbutton'
  | 'switch'
  | 'tab'
  | 'tablist'
  | 'timer'
  | 'toolbar'
  | 'list';

/** What the author declares. One shape, both platforms. */
export interface A11yContract {
  /** The accessible NAME. Already localized by the caller. */
  label: string;
  /**
   * Supplementary DESCRIPTION — the thing RN-web drops on the floor.
   * On web this is materialised as a visually-hidden node + `aria-describedby`.
   */
  hint?: string;
  /** Semantic role. Omit for a plain container. */
  role?: A11yRole;
  /** Interaction/selection state. */
  state?: A11yState;
  /** Playwright / a11y test hook. */
  testID: string;
  /**
   * The id of the hidden description node. Supplied by `useA11y`; only needed
   * when calling the pure `a11y()` adapter directly.
   */
  hintId?: string;
}

/** Props to spread onto a React Native host component (native platforms). */
export interface NativeA11yProps {
  accessible: true;
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityRole?: A11yRole;
  accessibilityState?: A11yState;
  testID: string;
}

/** Props to spread onto a react-native-web host component (web). */
export interface WebA11yProps {
  'aria-label': string;
  'aria-describedby'?: string;
  /**
   * Typed as React Native's `Role` — which IS the ARIA role vocabulary — rather than
   * `string`. That makes an invalid ARIA role a compile error instead of an attribute
   * browsers and AT quietly ignore, i.e. it fails the mapping table LOUDLY.
   */
  role?: Role;
  'aria-disabled'?: boolean;
  'aria-selected'?: boolean;
  'aria-expanded'?: boolean;
  'aria-busy'?: boolean;
  'aria-checked'?: boolean | 'mixed';
  /**
   * Left as `testID`, NOT `data-testid`: react-native-web converts `testID` into
   * `data-testid` on the host element itself, and that conversion is what every
   * existing Playwright selector in the fleet already depends on. Emitting
   * `data-testid` here would rely on RNW forwarding an arbitrary `data-*` prop
   * instead — a second, unverified path to the same attribute.
   */
  testID: string;
}

/** The union actually returned by `a11y()`. */
export type A11yProps = NativeA11yProps | WebA11yProps;
