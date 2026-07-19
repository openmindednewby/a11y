/**
 * WEB project only (react-native-web + jsdom).
 *
 * The assertions here go through the DOM the way a screen reader would: resolve
 * `aria-describedby` to an element id, then read that element's text. A test that
 * merely asserted "the hint prop was passed" would have passed against the original
 * bug too — that is exactly how the bug survived.
 */
import { render } from '@testing-library/react';
import { Platform } from 'react-native';

import { HintedBox } from './__fixtures__/HintedBox';

const HINT = 'Generates a QR code for this menu';

/** Resolve `aria-describedby` the way assistive technology does: id -> element -> text. */
function resolveDescription(host: HTMLElement): string | null {
  const id = host.getAttribute('aria-describedby');
  if (id === null) {
    return null;
  }
  return host.ownerDocument.getElementById(id)?.textContent ?? null;
}

describe('web platform', () => {
  it('runs under react-native-web', () => {
    // Guards the gate itself: if this project silently stopped resolving
    // `react-native` to `react-native-web`, every assertion below would be testing
    // the wrong platform while still passing.
    expect(Platform.OS).toBe('web');
  });

  it('makes the hint REAL — aria-describedby resolves to the hint text', () => {
    const { getByTestId } = render(<HintedBox label="QR" hint={HINT} role="button" testID="qr" />);
    const host = getByTestId('qr');

    expect(host).toHaveAttribute('aria-describedby');
    expect(resolveDescription(host)).toBe(HINT);
  });

  it('does NOT emit accessibilityHint to the DOM (the original bug, pinned)', () => {
    // This documents WHY the package exists. `accessibilityHint` has no ARIA
    // equivalent; before the adapter, this was the ONLY thing a component emitted,
    // which is to say: nothing at all reached the DOM.
    const { getByTestId } = render(<HintedBox label="QR" hint={HINT} testID="qr" />);
    const host = getByTestId('qr');

    expect(host.getAttribute('accessibilityHint')).toBeNull();
    expect(host.getAttribute('accessibilityhint')).toBeNull();
    // ...and yet the description is still announced, via the supported mechanism.
    expect(resolveDescription(host)).toBe(HINT);
  });

  it('hides the description node visually while keeping it in the document', () => {
    const { getByTestId } = render(<HintedBox label="QR" hint={HINT} testID="qr" />);
    const host = getByTestId('qr');
    const id = host.getAttribute('aria-describedby') ?? '';
    const node = host.ownerDocument.getElementById(id);

    expect(node).not.toBeNull();
    // Never `display:none` / `visibility:hidden` — both would remove it from the
    // accessibility tree and silently undo the whole fix.
    const style = node === null ? null : getComputedStyle(node);
    expect(style?.display).not.toBe('none');
    expect(style?.visibility).not.toBe('hidden');
  });

  it('emits the ARIA spelling of the role, not the RN one', () => {
    const { getByTestId } = render(<HintedBox label="Title" role="header" testID="h" />);
    expect(getByTestId('h')).toHaveAttribute('role', 'heading');
  });

  it('maps state onto aria-*', () => {
    const { getByTestId } = render(
      <HintedBox
        label="Save"
        role="button"
        state={{ disabled: true, busy: true, expanded: false }}
        testID="save"
      />,
    );
    const host = getByTestId('save');

    expect(host).toHaveAttribute('aria-disabled', 'true');
    expect(host).toHaveAttribute('aria-busy', 'true');
    expect(host).toHaveAttribute('aria-expanded', 'false');
    // Unset members must not appear at all — an absent state is not a false one.
    expect(host.hasAttribute('aria-checked')).toBe(false);
    expect(host.hasAttribute('aria-selected')).toBe(false);
  });

  it('emits no aria-describedby when there is no hint', () => {
    const { getByTestId } = render(<HintedBox label="Plain" testID="plain" />);
    expect(getByTestId('plain').hasAttribute('aria-describedby')).toBe(false);
  });

  it('gives each instance a distinct, collision-free id', () => {
    const { getByTestId } = render(
      <>
        <HintedBox label="A" hint="first" testID="a" />
        <HintedBox label="B" hint="second" testID="b" />
      </>,
    );
    const a = getByTestId('a').getAttribute('aria-describedby');
    const b = getByTestId('b').getAttribute('aria-describedby');

    expect(a).not.toBe(b);
    expect(resolveDescription(getByTestId('a'))).toBe('first');
    expect(resolveDescription(getByTestId('b'))).toBe('second');
    // Usable in a CSS selector without escaping (React's raw useId contains colons).
    expect(a).toMatch(/^[a-zA-Z0-9_-]+$/);
  });

  it('does NOT let the hint leak into the accessible NAME', () => {
    // The hidden node lives INSIDE the host, so the host's raw `textContent` now
    // includes the hint. That is a real, visible consequence of this design, and the
    // thing it must never do is change the accessible NAME — every Playwright locator
    // in the fleet is `getByRole('button', { name })`, which resolves the name, and
    // `aria-label` takes precedence over content per the ARIA spec. Pinned here so the
    // precedence can never be quietly lost (e.g. by dropping aria-label for a
    // content-derived name).
    const { getByTestId, getByRole } = render(
      <HintedBox label="Save" hint={HINT} role="button" testID="save" />,
    );

    expect(getByRole('button', { name: 'Save' })).toBe(getByTestId('save'));
    expect(getByTestId('save')).toHaveAttribute('aria-label', 'Save');
    // The hint IS in the raw text content — documenting the trade-off explicitly.
    expect(getByTestId('save').textContent).toContain(HINT);
  });

  it('shouts in dev when the caller spreads the props but drops the hidden node', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    render(<HintedBox label="QR" hint={HINT} testID="broken" omitHintNode />);

    expect(spy).toHaveBeenCalledWith(expect.stringContaining('broken'));
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('NOT being announced'));
    spy.mockRestore();
  });

  it('stays quiet when the node IS rendered', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    render(<HintedBox label="QR" hint={HINT} testID="fine" />);

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
