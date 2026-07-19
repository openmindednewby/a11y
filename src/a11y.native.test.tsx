/**
 * NATIVE project only (the REAL react-native, via its Jest preset + react-test-renderer).
 *
 * There is no DOM here — `document` does not exist and `aria-describedby` is meaningless.
 * The platform expresses a description as a first-class prop, so that is what we assert.
 * The two suites deliberately assert DIFFERENT things about the SAME fixture: if they
 * ever converge, the gate has stopped testing two platforms.
 */
import React from 'react';

import { Platform, View } from 'react-native';
import TestRenderer from 'react-test-renderer';

import { HintedBox } from './__fixtures__/HintedBox';

const HINT = 'Generates a QR code for this menu';

/**
 * The props the RN host `View` actually received.
 *
 * `act()` is not optional here: without it react-test-renderer schedules the render
 * on a later tick, which lands AFTER the test has finished and the Jest environment
 * has been torn down — react-native's lazily-getter'd `index.js` then throws
 * "trying to import a file after the Jest environment has been torn down".
 */
function hostProps(element: React.ReactElement): Record<string, unknown> {
  let renderer: TestRenderer.ReactTestRenderer | undefined;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(element);
  });
  if (renderer === undefined) {
    throw new Error('render did not produce a tree');
  }
  return renderer.root.findByType(View).props as Record<string, unknown>;
}

describe('native platform', () => {
  it('runs under the real react-native, NOT react-native-web', () => {
    // The single most important assertion in this file. If a `react-native` ->
    // `react-native-web` moduleNameMapper ever leaks into the native Jest project,
    // this project silently becomes a duplicate of the web one and the gate dies.
    expect(Platform.OS).not.toBe('web');
    expect(['ios', 'android']).toContain(Platform.OS);
    expect(typeof document).toBe('undefined');
  });

  it('threads the hint through as accessibilityHint', () => {
    const props = hostProps(<HintedBox label="QR" hint={HINT} role="button" testID="qr" />);

    expect(props.accessibilityHint).toBe(HINT);
    expect(props.accessibilityLabel).toBe('QR');
    expect(props.accessible).toBe(true);
    expect(props.testID).toBe('qr');
  });

  it('emits NO web description machinery', () => {
    const props = hostProps(<HintedBox label="QR" hint={HINT} testID="qr" />);

    // `aria-describedby` on a native host would be an inert, unread prop — and a
    // hidden node would be a real, laid-out element nobody can see.
    expect(props['aria-describedby']).toBeUndefined();
    expect(props['aria-label']).toBeUndefined();
    expect(props.children).toBeNull();
  });

  it('keeps the RN role vocabulary rather than the ARIA one', () => {
    const props = hostProps(<HintedBox label="Title" role="header" testID="h" />);

    // The exact inverse of the web suite, which asserts 'heading'.
    expect(props.accessibilityRole).toBe('header');
    expect(props.role).toBeUndefined();
  });

  it('passes state through as accessibilityState', () => {
    const state = { disabled: true, busy: true, expanded: false };
    const props = hostProps(<HintedBox label="Save" role="button" state={state} testID="save" />);

    expect(props.accessibilityState).toEqual(state);
    expect(props['aria-disabled']).toBeUndefined();
  });

  it('omits accessibilityHint entirely when there is no hint', () => {
    const props = hostProps(<HintedBox label="Plain" testID="plain" />);
    expect(props.accessibilityHint).toBeUndefined();
  });
});
