/**
 * `useA11y` — the ergonomics decision.
 *
 * The adapter can only return PROPS, but on web the hint also needs a rendered node.
 * Two things to remember is exactly how the original bug happened, so the design goal
 * here is: make the second thing impossible to forget QUIETLY.
 *
 * Three layers, in order of how early they catch a mistake:
 *
 *   1. ONE call returns BOTH.  `const { a11yProps, hintNode } = useA11y(...)`. You
 *      cannot obtain the props without the node landing in the same destructure, in
 *      your editor, one identifier away. There is no separate import to discover.
 *   2. DEV RUNTIME GUARD.  After commit, on web, we check the described-by target is
 *      actually in the document. If the caller spread the props but dropped the node,
 *      it reports itself loudly instead of silently degrading — which converts this
 *      package's own failure mode into the one thing the original bug never was:
 *      NOISY. (`accessibilityHint` hid for years precisely because nothing complained.)
 *   3. THE DUAL TEST GATE.  Web assertions resolve `aria-describedby` to real text, so
 *      a component that forgot the node fails its test rather than passing vacuously.
 *
 * Note who the callers are: APPS never touch this — they keep passing
 * `accessibilityHint` to `<Button>`. Only the ~10 KIT components call `useA11y`, which
 * is a small, reviewed, fully-tested surface. The forgetting risk is bounded by
 * construction, and layer 2 covers the rest.
 */
import React, { useEffect, useId } from 'react';

import { a11y, isWebPlatform } from './a11y';
import { A11yHint } from './A11yHint';
import { HINT_ID_PREFIX, ID_CHAR_REPLACEMENT, UNSAFE_ID_CHARS } from './constants';
import type { A11yContract, A11yProps } from './types';

/** What the caller authors — `hintId` is generated, never supplied. */
export type UseA11yContract = Omit<A11yContract, 'hintId'>;

export interface UseA11yResult {
  /** Spread onto the host component. */
  a11yProps: A11yProps;
  /**
   * Render as a child of that same host component. `null` on native (where the hint
   * is a first-class prop) and when there is no hint — so an unconditional
   * `{hintNode}` in JSX is always correct.
   */
  hintNode: React.ReactNode;
}

/**
 * Stable, collision-free id derived from React's `useId()`.
 *
 * `useId` is the right generator: it is stable across re-renders, unique per component
 * instance, and — unlike a module-level counter — consistent between the server and
 * client render, so it does not break hydration. Its raw output contains colons
 * (`:r3:`), which are legal in an HTML id and fine for `getElementById`/
 * `aria-describedby`, but NOT in a CSS selector; we normalise them so the id is usable
 * everywhere without escaping.
 */
function useHintId(): string {
  const reactId = useId();
  return `${HINT_ID_PREFIX}-${reactId.replace(UNSAFE_ID_CHARS, ID_CHAR_REPLACEMENT)}`;
}

/** Dev-only: shout if the caller spread the props but never rendered the node. */
function useHintNodeGuard(hintId: string, expected: boolean, testID: string): void {
  useEffect(() => {
    const shouldCheck = expected && process.env.NODE_ENV !== 'production';
    if (!shouldCheck || typeof document === 'undefined') {
      return;
    }
    if (document.getElementById(hintId) === null) {
      // Making the failure LOUD is the entire point of this guard — a silent degrade
      // is the exact bug this package exists to fix, so `no-console` is waived here.
      // eslint-disable-next-line no-console
      console.error(
        `[@dloizides/a11y] "${testID}" declared an accessibility hint but its <A11yHint> node ` +
          `("${hintId}") is not in the document. The hint is NOT being announced. ` +
          `Render the "hintNode" returned by useA11y() inside the same host component.`,
      );
    }
  }, [hintId, expected, testID]);
}

/**
 * Build platform-correct accessibility props plus (on web) the hidden description node.
 *
 * @example
 * const { a11yProps, hintNode } = useA11y({ label, hint, role: 'button', testID });
 * return <TouchableOpacity {...a11yProps}>{children}{hintNode}</TouchableOpacity>;
 */
export function useA11y(contract: UseA11yContract): UseA11yResult {
  const hintId = useHintId();

  const hasHint = contract.hint !== undefined && contract.hint !== '';
  const needsHintNode = hasHint && isWebPlatform();

  useHintNodeGuard(hintId, needsHintNode, contract.testID);

  // Deliberately not memoized: every member is compared by value when spread onto a
  // host element, so a fresh object costs nothing and a stale memo would be a real bug.
  const a11yProps = a11y({ ...contract, hintId });

  const hintNode = needsHintNode ? <A11yHint id={hintId} text={contract.hint ?? ''} /> : null;

  return { a11yProps, hintNode };
}
