import { formatString } from '../formatString';

describe('formatString', () => {
  const testData = {
    name: 'John',
    age: 30,
    city: 'New York',
    server: 'localhost',
    user_name: 'john_doe',
    var: '1',
    '__field.labels.ident': 'dev-n9e-02',
  };

  test('should handle ${__field.labels.ident} and ${var} format', () => {
    const result = formatString('http://example.com?ident=${__field.labels.ident}&var=${var}', testData);
    expect(result).toBe('http://example.com?ident=dev-n9e-02&var=1');
  });

  test('should handle $variableName format', () => {
    const result = formatString('Hello $name, you are $age years old', testData);
    expect(result).toBe('Hello John, you are 30 years old');
  });

  test('should handle ${variableName} format', () => {
    const result = formatString('Hello ${name}, you live in ${city}', testData);
    expect(result).toBe('Hello John, you live in New York');
  });

  test('should handle [[variableName]] format', () => {
    const result = formatString('Server: [[server]], User name: [[user_name]]', testData);
    expect(result).toBe('Server: localhost, User name: john_doe');
  });

  test('should handle mixed formats', () => {
    const result = formatString('$name is ${age} years old and lives in [[city]]', testData);
    expect(result).toBe('John is 30 years old and lives in New York');
  });

  test('should handle empty string', () => {
    const result = formatString('', testData);
    expect(result).toBe('');
  });

  test('should handle string without variables', () => {
    const result = formatString('No variables here', testData);
    expect(result).toBe('No variables here');
  });

  test('should handle $undefined_var format gracefully', () => {
    const result = formatString('Hello $undefined_var', testData);
    expect(result).toBe('Hello $undefined_var');
  });

  test('should handle ${undefined_var} format gracefully', () => {
    const result = formatString('Hello ${undefined_var}', testData);
    expect(result).toBe('Hello ${undefined_var}');
  });

  test('should handle [[undefined_var]] format gracefully', () => {
    const result = formatString('Hello [[undefined_var]]', testData);
    expect(result).toBe('Hello [[undefined_var]]');
  });

  test('should return original string on error', () => {
    const result = formatString(null as any, testData);
    expect(result).toBe(null);
  });

  test('should handle string with additional suffix', () => {
    const result = formatString('Hello $name_var', testData);
    expect(result).toBe('Hello John_var');
  });

  test('should handle underscore variables', () => {
    const result = formatString('Hello $user_name', testData);
    expect(result).toBe('Hello john_doe');
  });

  test('should handle mixed underscore scenarios', () => {
    const result = formatString('$user_name and $user_nameSuffix', testData);
    expect(result).toBe('john_doe and john_doeSuffix');
  });
});
