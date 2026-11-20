import { RovingAxis } from './RovingAxis';
import { rovingArrowTarget, rovingTabIndexes } from './rovingFocus';

describe('rovingTabIndexes', () => {
  it('with the second of three active, gives only that one the Tab stop', () => {
    const indexes = rovingTabIndexes(3, 1);

    expect(indexes).toEqual([-1, 0, -1]);
  });
});

describe('rovingArrowTarget', () => {
  it('with ArrowRight on the last control, wraps to the first', () => {
    expect(rovingArrowTarget('ArrowRight', 2, 3)).toBe(0);
  });

  it('with ArrowLeft on the first control, wraps to the last', () => {
    expect(rovingArrowTarget('ArrowLeft', 0, 3)).toBe(2);
  });

  it('with any other key, moves nothing', () => {
    expect(rovingArrowTarget('Enter', 1, 3)).toBeUndefined();
  });
});

describe('rovingArrowTarget with RovingAxis.Both', () => {
  it('with ArrowDown on the last control, wraps to the first', () => {
    expect(rovingArrowTarget('ArrowDown', 2, 3, RovingAxis.Both)).toBe(0);
  });

  it('with ArrowUp on the first control, wraps to the last', () => {
    expect(rovingArrowTarget('ArrowUp', 0, 3, RovingAxis.Both)).toBe(2);
  });

  it('with ArrowRight in the middle, moves to the next control', () => {
    expect(rovingArrowTarget('ArrowRight', 1, 3, RovingAxis.Both)).toBe(2);
  });
});

describe('rovingArrowTarget with the default horizontal axis', () => {
  it('with ArrowDown, moves nothing', () => {
    expect(rovingArrowTarget('ArrowDown', 1, 3)).toBeUndefined();
  });
});
