/**
 * THE DUAL-PLATFORM TEST GATE.
 *
 * The bug this package fixes survived for years because the ONLY renderer anyone ever
 * tested under was react-native-web — every package in the kit maps `react-native` ->
 * `react-native-web` in its Jest config. Under that single renderer a threaded hint and
 * a dropped hint are indistinguishable, so no assertion could ever have failed.
 *
 * So the adapter is tested under BOTH renderers, as two genuinely separate Jest
 * projects with different transforms, environments and module resolution:
 *
 *   project   `react-native` resolves to   Platform.OS   renderer            transform
 *   -------   --------------------------   -----------   -----------------   ---------
 *   web       react-native-web             'web'         @testing-library    ts-jest
 *                                                        /react -> jsdom DOM
 *   native    react-native (the REAL one)  'ios'         react-test-renderer babel-jest
 *                                                                            (RN preset)
 *
 * Test-file convention:
 *   *.test.ts(x)         run in BOTH projects (platform-agnostic logic)
 *   *.web.test.tsx       web project only
 *   *.native.test.tsx    native project only
 *
 * If you ever find yourself making the two projects agree by weakening an assertion,
 * stop: the disagreement IS the product.
 */

/** Shared by both projects — the parts that are genuinely platform-independent. */
const common = {
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: ['src/**/*.ts', 'src/**/*.tsx', '!src/**/*.d.ts', '!src/**/index.ts'],
};

/** WEB — react-native-web under jsdom. This is what all 7 portals actually ship today. */
const webProject = {
  ...common,
  displayName: 'web',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.web.ts'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  testPathIgnorePatterns: ['\\.native\\.test\\.tsx?$'],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
};

/**
 * NATIVE — the REAL react-native, via its own Jest preset (babel-jest + the RN
 * resolver + the RN test environment). Note the deliberate ABSENCE of a
 * `react-native` moduleNameMapper: adding one here would quietly collapse this
 * project back into a second copy of the web project, which is precisely the
 * failure mode the gate exists to prevent.
 */
const nativeProject = {
  ...common,
  displayName: 'native',
  preset: 'react-native',
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  testPathIgnorePatterns: ['\\.web\\.test\\.tsx?$'],
};

/** @type {import('jest').Config} */
module.exports = {
  projects: [webProject, nativeProject],
  coverageReporters: ['text', 'lcov', 'html'],
};
