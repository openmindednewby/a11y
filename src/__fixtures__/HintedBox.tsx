/**
 * The single component both Jest projects render.
 *
 * Using ONE fixture across both projects is deliberate: it removes the "maybe the two
 * suites just test different components" escape hatch, so any difference in the
 * assertions is attributable to the renderer and nothing else.
 */
import React from 'react';

import { View } from 'react-native';

import { useA11y } from '../useA11y';
import type { A11yRole, A11yState } from '../types';

export interface HintedBoxProps {
  label: string;
  hint?: string;
  role?: A11yRole;
  state?: A11yState;
  testID: string;
  /**
   * Deliberately drop the hidden node while still spreading the props — the mistake
   * the dev guard exists to catch. Only a test should ever set this.
   */
  omitHintNode?: boolean;
}

export const HintedBox = ({
  label,
  hint,
  role,
  state,
  testID,
  omitHintNode = false,
}: HintedBoxProps): React.ReactElement => {
  const { a11yProps, hintNode } = useA11y({ label, hint, role, state, testID });
  return <View {...a11yProps}>{omitHintNode ? null : hintNode}</View>;
};
