/**
 * React Native `accessibilityRole` -> ARIA `role`.
 *
 * WHY a table and not a pass-through: the two vocabularies overlap but are NOT the
 * same set. Passing an RN role straight through to `role=` produces attributes that
 * are invalid ARIA, which browsers and AT ignore — i.e. it fails the same silent way
 * `accessibilityHint` did. The divergences that matter:
 *
 *   RN            ARIA           why
 *   ----------    -----------    -------------------------------------------------
 *   none          presentation   `presentation` is the universally supported spelling.
 *   header        heading        `header` IS a valid ARIA role (a banner-ish landmark),
 *                                so passing it through is WORSE than dropping it: every
 *                                heading in the fleet would silently become a landmark.
 *   image         img            ARIA spells it `img`.
 *   search        searchbox      ARIA's `search` is a LANDMARK; RN's `search` means a
 *                                search FIELD. Pass-through mislabels an input as a
 *                                page region.
 *   imagebutton   button         no ARIA equivalent; the interactive half is what
 *   keyboardkey   button         matters to assistive technology.
 *   adjustable    slider         RN's name for a slider.
 *   text          (omitted)      ARIA has no "text" role. Better to emit nothing than
 *   summary       (omitted)      to assert a role the author did not mean.
 *
 * The table is TOTAL — every `A11yRole` is listed explicitly and the value type is
 * React Native's `Role` (which is the ARIA vocabulary). So adding a role to
 * `A11yRole` without deciding its ARIA spelling is a COMPILE ERROR, not a silently
 * invalid attribute. No cast, no fallthrough.
 */
import type { Role } from 'react-native';

import type { A11yRole } from './types';

/** `undefined` means: emit NO `role` attribute (no faithful ARIA equivalent). */
const ARIA_ROLE_BY_RN_ROLE: Readonly<Record<A11yRole, Role | undefined>> = {
  // --- genuinely different spellings -------------------------------------------
  none: 'presentation',
  header: 'heading',
  image: 'img',
  search: 'searchbox',
  imagebutton: 'button',
  keyboardkey: 'button',
  adjustable: 'slider',
  // --- no faithful ARIA equivalent ---------------------------------------------
  text: undefined,
  summary: undefined,
  // --- identical in both vocabularies ------------------------------------------
  button: 'button',
  link: 'link',
  alert: 'alert',
  checkbox: 'checkbox',
  combobox: 'combobox',
  menu: 'menu',
  menubar: 'menubar',
  menuitem: 'menuitem',
  progressbar: 'progressbar',
  radio: 'radio',
  radiogroup: 'radiogroup',
  scrollbar: 'scrollbar',
  spinbutton: 'spinbutton',
  switch: 'switch',
  tab: 'tab',
  tablist: 'tablist',
  timer: 'timer',
  toolbar: 'toolbar',
  list: 'list',
};

/**
 * Translate an RN role to its ARIA spelling.
 *
 * @returns the ARIA role, or `undefined` when the role has no faithful ARIA
 *          equivalent (in which case no `role` attribute should be emitted).
 */
export function toAriaRole(role: A11yRole | undefined): Role | undefined {
  return role === undefined ? undefined : ARIA_ROLE_BY_RN_ROLE[role];
}
