/**
 * Minimum interactive-target sizes — the ONE place the kit states its hit-target floor.
 *
 * ## Why this lives here
 *
 * Before this constant existed, every package invented its own interactive height and the
 * numbers drifted below the floor without anyone noticing: `ui-buttons` shipped a 44px `md`
 * button, `ui-forms`' select trigger came out at 41px, and `ThemedTextInput` — the package's
 * self-declared "ONE source of truth for the input look" — carried NO box metrics at all and
 * rendered a **19px** text input. A CMS page audited live measured 22 of 22 buttons and 10 of
 * 10 inputs under the floor. Nothing failed; every control was just too small to hit.
 *
 * A shared floor is only enforceable if it is a shared symbol. `@dloizides/a11y` is the
 * accessibility seam every kit package already depends on, and it is dependency-free, so it
 * can be imported from `ui-buttons`, `ui-forms`, `ui-layout` and friends without adding a
 * dependency edge that points the wrong way.
 *
 * ## Why 48 and not 24
 *
 * WCAG 2.2 SC 2.5.8 (Target Size, Minimum) is **AA at 24px**; SC 2.5.5 (Target Size) is
 * **AAA at 44px**. {@link MIN_TOUCH_TARGET_PX} is 48 — above both — because it matches the
 * platform guidance the estate already writes down (Material's 48dp, Apple's 44pt) and because
 * the surfaces this kit renders include content-authoring tools used by non-technical people.
 * The AA figure is exported as {@link MIN_TOUCH_TARGET_AA_PX} so a genuinely dense surface can
 * state the weaker bar it is holding itself to EXPLICITLY, rather than by silently shipping a
 * number nobody checked.
 */

/**
 * The kit's hit-target floor, in px. Any control a user is expected to click or tap should be
 * at least this tall AND this wide. Prefer raising the control's own `minHeight` to this over
 * `hitSlop`: a hit area that is invisible is one the user cannot aim at.
 */
export const MIN_TOUCH_TARGET_PX = 48;

/**
 * The WCAG 2.2 SC 2.5.8 (AA) floor, in px. Use ONLY on a deliberately dense surface, and say
 * so at the call site — this is the bar below which the control fails an accessibility audit
 * outright, not a target to design toward.
 */
export const MIN_TOUCH_TARGET_AA_PX = 24;

/**
 * True when `size` clears the kit floor. Exported so a package's own tests can assert their
 * size scales rather than restating `48` and drifting from it.
 */
export function meetsTouchTarget(size: number): boolean {
  return size >= MIN_TOUCH_TARGET_PX;
}
