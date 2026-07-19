/**
 * `@dloizides/a11y` — the accessibility platform seam for the dloizides.com UI kit.
 *
 * One authored contract (`label` / `hint` / `role` / `state` / `testID`) emitted as
 * platform-correct props: React Native `accessibility*` on native, real ARIA on web —
 * including the hint, which react-native-web otherwise DROPS SILENTLY because
 * `accessibilityHint` has no ARIA equivalent.
 *
 * Consumed by the kit packages (ui-buttons, ui-nav, ui-forms, ui-tables, ui-layout,
 * ui-feedback), not by apps directly.
 */
export { a11y, isWebPlatform } from './a11y';
export { useA11y } from './useA11y';
export type { UseA11yContract, UseA11yResult } from './useA11y';
export { A11yHint } from './A11yHint';
export type { A11yHintProps } from './A11yHint';
export { toAriaRole } from './roleMap';
export type {
  A11yContract,
  A11yProps,
  A11yRole,
  A11yState,
  NativeA11yProps,
  WebA11yProps,
} from './types';
