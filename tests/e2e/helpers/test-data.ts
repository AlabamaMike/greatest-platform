/**
 * Test Data Generators and Fixtures
 */

export const generateTestUser = (overrides: Partial<any> = {}) => ({
  email: `test-${Date.now()}@example.com`,
  password: 'Test123!@#',
  firstName: 'Test',
  lastName: 'User',
  role: 'user',
  ...overrides,
});

export const generateTestPatient = (overrides: Partial<any> = {}) => ({
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1990-01-01',
  gender: 'male',
  email: `patient-${Date.now()}@example.com`,
  phone: '+1234567890',
  address: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'USA',
  },
  ...overrides,
});

export const generateTestProvider = (overrides: Partial<any> = {}) => ({
  firstName: 'Dr. Jane',
  lastName: 'Smith',
  email: `provider-${Date.now()}@example.com`,
  phone: '+1234567891',
  specialty: 'General Practice',
  licenseNumber: `LIC-${Date.now()}`,
  ...overrides,
});

export const generateTestAppointment = (patientId: string, providerId: string, overrides: Partial<any> = {}) => ({
  patientId,
  providerId,
  appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
  duration: 30,
  type: 'consultation',
  status: 'scheduled',
  ...overrides,
});

export const generateTestStudent = (overrides: Partial<any> = {}) => ({
  firstName: 'Alice',
  lastName: 'Johnson',
  email: `student-${Date.now()}@example.com`,
  grade: 10,
  enrollmentDate: new Date().toISOString(),
  ...overrides,
});

export const generateTestCourse = (overrides: Partial<any> = {}) => ({
  title: `Test Course ${Date.now()}`,
  description: 'A comprehensive test course',
  instructor: 'Prof. Test',
  duration: 8,
  level: 'intermediate',
  category: 'programming',
  ...overrides,
});

// Wait for condition with timeout
export const waitForCondition = async (
  condition: () => boolean | Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error(`Condition not met within ${timeout}ms`);
};

// Random string generator
export const randomString = (length: number = 10): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Delay helper
export const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));
