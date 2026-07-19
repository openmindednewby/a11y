/**
 * `a11y()` — the platform seam.
 *
 * ONE authored contract in, platform-correct props out. This exists because the
 * two platforms express the same three ideas in genuinely different ways, and the
 * difference is not cosmetic:
 *
 *   idea          native                      web
 *   -----------   -------------------------   -----------------------------------
 *   name          accessibilityLabel          aria-label
 *   description   accessibilityHint           aria-describedby -> a hidden node
 *   role          accessibilityRole (RN set)  role (ARIA set — see roleMap.ts)
 *
 * The middle row is the whole reason this package exists. `accessibilityHint` has
 * NO ARIA equivalent, so react-native-web drops it silently — an element authored
 * with a hint renders `aria-label` + `role` + `tabindex` and nothing else. Every
 * portal in the fleet has been shipping decorative hints for years, and no DOM
 * assertion could ever have caught it: a threaded hint and a dropped hint render
 * identically. The only fix is to stop pretending `accessibilityHint` is a web
 * concept and materialise it as what the web platform actually has —
 * `aria-describedby` pointing at a real, visually-hidden element.
 */
import { Platform } from 'react-native';

import { toAriaRole } from './roleMap';
import type { A11yContract, A11yProps, A11yState, NativeA11yProps, WebA11yProps } from './types';

/** True when running under react-native-web. */
export function isWebPlatform(): boolean {
  return Platform.OS === 'web';
}

/** Emit `aria-*` only for the state members the author actually set. */
function buildAriaState(state: A11yState | undefined): Partial<WebA11yProps> {
  if (state === undefined) {
    return {};
  }
  const out: Partial<WebA11yProps> = {};
  if (state.disabled !== undefined) out['aria-disabled'] = state.disabled;
  if (state.selected !== undefined) out['aria-selected'] = state.selected;
  if (state.expanded !== undefined) out['aria-expanded'] = state.expanded;
  if (state.busy !== undefined) out['aria-busy'] = state.busy;
  if (state.checked !== undefined) out['aria-checked'] = state.checked;
  return out;
}

function buildNative(contract: A11yContract): NativeA11yProps {
  const props: NativeA11yProps = {
    accessible: true,
    accessibilityLabel: contract.label,
    testID: contract.testID,
  };
  // Native is the platform where the hint is a first-class concept — pass it straight
  // through. No hidden node is rendered (or needed) here.
  if (contract.hint !== undefined) props.accessibilityHint = contract.hint;
  if (contract.role !== undefined) props.accessibilityRole = contract.role;
  if (contract.state !== undefined) props.accessibilityState = contract.state;
  return props;
}

function buildWeb(contract: A11yContract): WebA11yProps {
  const props: WebA11yProps = {
    'aria-label': contract.label,
    testID: contract.testID,
    ...buildAriaState(contract.state),
  };

  const ariaRole = toAriaRole(contract.role);
  if (ariaRole !== undefined) props.role = ariaRole;

  // The hint is only expressible on web as a POINTER to a node. Without an id there
  // is nothing to point at, so we emit nothing rather than a dangling reference —
  // `useA11y` always supplies one, and its dev guard shouts if the node is missing.
  const hasHint = contract.hint !== undefined && contract.hint !== '';
  const hasHintId = contract.hintId !== undefined && contract.hintId !== '';
  if (hasHint && hasHintId) props['aria-describedby'] = contract.hintId;

  return props;
}

/**
 * Build the accessibility props for the CURRENT platform.
 *
 * Prefer {@link useA11y} in components — it generates the `hintId`, hands back the
 * hidden node to render, and dev-guards against that node being forgotten. Use this
 * function directly only where hooks are unavailable.
 */
export function a11y(contract: A11yContract): A11yProps {
  return isWebPlatform() ? buildWeb(contract) : buildNative(contract);
}
