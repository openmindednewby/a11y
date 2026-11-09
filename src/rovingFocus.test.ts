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
