import { MIN_TOUCH_TARGET_AA_PX, MIN_TOUCH_TARGET_PX, meetsTouchTarget } from './touchTarget';

describe('touch target floor', () => {
  it('states a floor at or above the WCAG 2.2 AAA target size', () => {
    // 44 is SC 2.5.5 (AAA). The kit floor must not regress below it.
    const WCAG_AAA_TARGET_PX = 44;
    expect(MIN_TOUCH_TARGET_PX).toBeGreaterThanOrEqual(WCAG_AAA_TARGET_PX);
  });

  it('keeps the AA figure strictly below the kit floor', () => {
    // If these ever converge, the "dense surface" escape hatch has silently become the default.
    expect(MIN_TOUCH_TARGET_AA_PX).toBeLessThan(MIN_TOUCH_TARGET_PX);
  });

  it('accepts a control exactly on the floor', () => {
    // The boundary is inclusive: a 48px control passes. A 47px one does not.
    expect(meetsTouchTarget(MIN_TOUCH_TARGET_PX)).toBe(true);
    expect(meetsTouchTarget(MIN_TOUCH_TARGET_PX - 1)).toBe(false);
  });
});
