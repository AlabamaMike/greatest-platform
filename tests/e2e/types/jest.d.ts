/**
 * Custom Jest matchers type declarations
 */

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidJWT(): R;
    }
  }

  function sleep(ms: number): Promise<void>;
}

export {};
