/**
 * `A11yHint` — the visually-hidden node that MAKES the hint real on web.
 *
 * `aria-describedby` is a POINTER: without a rendered element carrying the id, the
 * attribute references nothing and assistive technology announces nothing. So the
 * description has to exist in the document. It must also stay in the accessibility
 * tree, which rules out the obvious ways of hiding things:
 *
 *   display: none / visibility: hidden  -> removed from the a11y tree entirely
 *   opacity: 0                          -> unreliable across AT; some prune it
 *   left: -10000                        -> breaks under RTL, and can extend the
 *                                          scrollable area on some engines
 *
 * The 1x1 + `overflow: hidden` + absolutely-positioned clip below is the technique
 * that survives all three, and is expressible in the RN StyleSheet subset (no
 * `clip-path`), so the same component compiles on both platforms.
 */
import React from 'react';

import { StyleSheet, Text } from 'react-native';

import { HIDDEN_NODE_SIZE } from './constants';

const styles = StyleSheet.create({
  hidden: {
    position: 'absolute',
    width: HIDDEN_NODE_SIZE,
    height: HIDDEN_NODE_SIZE,
    overflow: 'hidden',
    top: 0,
    left: 0,
  },
});

export interface A11yHintProps {
  /** Must match the `aria-describedby` emitted by {@link a11y}. */
  id: string;
  /** The description text, already localized by the caller. */
  text: string;
}

/**
 * Render inside the host component, alongside its visible children. Being a
 * DESCENDANT (rather than a sibling) means it mounts and unmounts with the host —
 * a dangling `aria-describedby` pointing at a node that outlived its owner is not
 * possible.
 */
export const A11yHint = ({ id, text }: A11yHintProps): React.ReactElement => (
  <Text nativeID={id} style={styles.hidden}>
    {text}
  </Text>
);
