/**
 * E2E Test Teardown
 * Runs after all tests complete
 */

export default async function globalTeardown() {
  // Clean up any resources
  console.log('E2E tests completed. Cleaning up...');

  // Give time for any async operations to complete
  await new Promise(resolve => setTimeout(resolve, 1000));
}
