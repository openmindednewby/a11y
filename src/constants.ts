/** Shared numeric/string constants (no magic numbers at the call sites). */

/**
 * Size of the visually-hidden description node. 1x1 with `overflow: hidden` is the
 * portable RN + RN-web way to keep a node in the accessibility tree while removing it
 * visually. Deliberately NOT `left: -10000` (breaks under RTL) and NOT `opacity: 0`
 * or `display: none` (both risk removing the node from the accessibility tree, which
 * would silently un-do the entire point of this package).
 */
export const HIDDEN_NODE_SIZE = 1;

/** Prefix for generated description-node ids. */
export const HINT_ID_PREFIX = 'a11y-hint';

/** Characters React's `useId()` emits that are awkward in ids (`:` breaks CSS selectors). */
export const UNSAFE_ID_CHARS = /[^a-zA-Z0-9_-]/g;

/** Replacement for {@link UNSAFE_ID_CHARS}. */
export const ID_CHAR_REPLACEMENT = '-';
