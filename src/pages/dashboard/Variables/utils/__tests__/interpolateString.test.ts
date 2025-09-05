import { interpolateString } from '../interpolateString';

describe('interpolateString', () => {
  const testData = {
    name: 'John',
    age: 30,
    city: 'New York',
    server: 'localhost',
    user_name: 'john_doe',
  };

  test('should handle $variableName format', () => {
    const result = interpolateString('Hello $name, you are $age years old', testData);
    expect(result).toBe('Hello John, you are 30 years old');
  });

  test('should handle ${variableName} format', () => {
    const result = interpolateString('Hello ${name}, you live in ${city}', testData);
    expect(result).toBe('Hello John, you live in New York');
  });

  test('should handle [[variableName]] format', () => {
    const result = interpolateString('Server: [[server]], User name: [[user_name]]', testData);
    expect(result).toBe('Server: localhost, User name: john_doe');
  });

  test('should handle mixed formats', () => {
    const result = interpolateString('$name is ${age} years old and lives in [[city]]', testData);
    expect(result).toBe('John is 30 years old and lives in New York');
  });

  test('should handle empty string', () => {
    const result = interpolateString('', testData);
    expect(result).toBe('');
  });

  test('should handle string without variables', () => {
    const result = interpolateString('No variables here', testData);
    expect(result).toBe('No variables here');
  });

  test('should handle $undefined_var format gracefully', () => {
    const result = interpolateString('Hello $undefined_var', testData);
    expect(result).toBe('Hello $undefined_var');
  });

  test('should handle ${undefined_var} format gracefully', () => {
    const result = interpolateString('Hello ${undefined_var}', testData);
    expect(result).toBe('Hello ${undefined_var}');
  });

  test('should handle [[undefined_var]] format gracefully', () => {
    const result = interpolateString('Hello [[undefined_var]]', testData);
    expect(result).toBe('Hello [[undefined_var]]');
  });

  test('should return original string on error', () => {
    const result = interpolateString(null as any, testData);
    expect(result).toBe(null);
  });

  test('should handle string with additional suffix', () => {
    const result = interpolateString('Hello $name_var', testData);
    expect(result).toBe('Hello John_var');
  });

  test('should handle underscore variables', () => {
    const result = interpolateString('Hello $user_name', testData);
    expect(result).toBe('Hello john_doe');
  });

  test('should handle mixed underscore scenarios', () => {
    const result = interpolateString('$user_name and $user_nameSuffix', testData);
    expect(result).toBe('john_doe and john_doeSuffix');
  });
});
