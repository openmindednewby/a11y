/**
 * Platform-AGNOSTIC. Runs in BOTH Jest projects (no `.web.`/`.native.` infix), which
 * is itself a small proof that the shared half of the suite really is executed twice.
 */
import { toAriaRole } from './roleMap';

describe('toAriaRole', () => {
  it('renames the roles ARIA spells differently', () => {
    expect(toAriaRole('header')).toBe('heading');
    expect(toAriaRole('image')).toBe('img');
    expect(toAriaRole('adjustable')).toBe('slider');
    expect(toAriaRole('none')).toBe('presentation');
    // RN's `search` is a search FIELD; ARIA's `search` is a landmark region.
    expect(toAriaRole('search')).toBe('searchbox');
  });

  it('collapses RN-only interactive roles onto button', () => {
    expect(toAriaRole('imagebutton')).toBe('button');
    expect(toAriaRole('keyboardkey')).toBe('button');
  });

  it('emits NO role where ARIA has no faithful equivalent', () => {
    // Better to say nothing than to assert a role the author did not mean.
    expect(toAriaRole('text')).toBeUndefined();
    expect(toAriaRole('summary')).toBeUndefined();
    expect(toAriaRole(undefined)).toBeUndefined();
  });

  it('passes through roles whose names already agree', () => {
    expect(toAriaRole('button')).toBe('button');
    expect(toAriaRole('link')).toBe('link');
    expect(toAriaRole('checkbox')).toBe('checkbox');
    expect(toAriaRole('tablist')).toBe('tablist');
  });

  it('does NOT pass "header" through, which would silently create a landmark', () => {
    // `header` is a real ARIA role (a banner-ish landmark). Passing it through would
    // turn every heading in the fleet into a landmark — worse than dropping it.
    expect(toAriaRole('header')).not.toBe('header');
  });
});
