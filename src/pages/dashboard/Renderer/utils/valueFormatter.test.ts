jest.mock('lodash', () => {
  const actual = jest.requireActual('lodash');

  return {
    __esModule: true,
    default: actual,
    ...actual,
  };
});

import valueFormatter from './valueFormatter';

describe('valueFormatter', () => {
  test('should format SI bits and bytes through unit fn', () => {
    expect(valueFormatter({ unit: 'bitsSI', decimals: 2 }, 1500)).toEqual({
      value: '1.5',
      unit: 'kb',
      text: '1.5 kb',
      stat: 1500,
    });

    expect(valueFormatter({ unit: 'bytesSI', decimals: 2 }, 1500)).toEqual({
      value: '1.5',
      unit: 'kB',
      text: '1.5 kB',
      stat: 1500,
    });
  });

  test('should format IEC bits and bytes through unit fn', () => {
    expect(valueFormatter({ unit: 'bitsIEC', decimals: 2 }, 2048)).toEqual({
      value: '2',
      unit: 'Kib',
      text: '2 Kib',
      stat: 2048,
    });

    expect(valueFormatter({ unit: 'bytesIEC', decimals: 2 }, 2048)).toEqual({
      value: '2',
      unit: 'KiB',
      text: '2 KiB',
      stat: 2048,
    });
  });

  test('should format IEC data units with offset-aware fn', () => {
    const result = valueFormatter({ unit: 'kibibytes', decimals: 2 }, 1536);

    expect(result).toEqual({
      value: '1.5',
      unit: 'MiB',
      text: '1.5 MiB',
      stat: 1536,
    });
  });

  test('should format SI data units with offset-aware fn', () => {
    const result = valueFormatter({ unit: 'kilobytes', decimals: 2 }, 1500);

    expect(result).toEqual({
      value: '1.5',
      unit: 'MB',
      text: '1.5 MB',
      stat: 1500,
    });
  });

  test('should format IEC data rate units with offset-aware fn', () => {
    const result = valueFormatter({ unit: 'kibibitsSec', decimals: 2 }, 2048);

    expect(result).toEqual({
      value: '2',
      unit: 'Mib/s',
      text: '2 Mib/s',
      stat: 2048,
    });
  });

  test('should format SI data rate units with offset-aware fn', () => {
    const result = valueFormatter({ unit: 'kilobitsSec', decimals: 2 }, 1500);

    expect(result).toEqual({
      value: '1.5',
      unit: 'Mb/s',
      text: '1.5 Mb/s',
      stat: 1500,
    });
  });

  test('should format base data rate units through unit fn', () => {
    expect(valueFormatter({ unit: 'bitsSecSI', decimals: 2 }, 1500)).toEqual({
      value: '1.5',
      unit: 'kb/s',
      text: '1.5 kb/s',
      stat: 1500,
    });

    expect(valueFormatter({ unit: 'bytesSecIEC', decimals: 2 }, 2048)).toEqual({
      value: '2',
      unit: 'KiB/s',
      text: '2 KiB/s',
      stat: 2048,
    });
  });

  test('should format packets per second through unit fn', () => {
    const result = valueFormatter({ unit: 'packetsSec', decimals: 2 }, 1500);

    expect(result).toEqual({
      value: '1.5',
      unit: 'kp/s',
      text: '1.5 kp/s',
      stat: 1500,
    });
  });

  test('should avoid duplicate spaces for fixed unit formatters', () => {
    const result = valueFormatter({ unit: 'inch', decimals: 2 }, 12.34);

    expect(result).toEqual({
      value: '12.34',
      unit: 'in',
      text: '12.34 in',
      stat: 12.34,
    });
  });

  test('should fall back to custom units when formatter is unknown', () => {
    const result = valueFormatter({ unit: 'customUnit', decimals: 2 }, 12.345);

    expect(result).toEqual({
      value: 12.35,
      unit: 'customUnit',
      text: '12.35 customUnit',
      stat: 12.345,
    });
  });

  describe('unit: none', () => {
    test('should round value with specified decimals', () => {
      const result = valueFormatter({ unit: 'none', decimals: 2 }, 3.14159);

      expect(result).toEqual({
        value: 3.14,
        unit: '',
        text: 3.14,
        stat: 3.14159,
      });
    });

    test('should round value with decimals=0', () => {
      const result = valueFormatter({ unit: 'none', decimals: 0 }, 3.99);

      expect(result).toEqual({
        value: 4,
        unit: '',
        text: 4,
        stat: 3.99,
      });
    });

    test('should use default decimals (6) when decimals is not specified', () => {
      const result = valueFormatter({ unit: 'none' }, 3.1415926535);

      expect(result).toEqual({
        value: 3.141593,
        unit: '',
        text: 3.141593,
        stat: 3.1415926535,
      });
    });

    test('should not round string values — only number type is rounded', () => {
      const result = valueFormatter({ unit: 'none', decimals: 1 }, '3.45');

      expect(result).toEqual({
        value: '3.45',
        unit: '',
        text: '3.45',
        stat: '3.45',
      });
    });

    test('should handle null value', () => {
      const result = valueFormatter({ unit: 'none', decimals: 2 }, null);

      expect(result).toEqual({
        value: '',
        unit: '',
        text: '',
        stat: '',
      });
    });

    test('should handle undefined value', () => {
      const result = valueFormatter({ unit: 'none', decimals: 2 }, undefined);

      expect(result).toEqual({
        value: '',
        unit: '',
        text: '',
        stat: '',
      });
    });

    test('should handle empty string value', () => {
      const result = valueFormatter({ unit: 'none', decimals: 2 }, '');

      expect(result).toEqual({
        value: '',
        unit: '',
        text: '',
        stat: '',
      });
    });

    test('should return the raw string for non-numeric string', () => {
      const result = valueFormatter({ unit: 'none', decimals: 2 }, 'abc');

      expect(result).toEqual({
        value: 'abc',
        unit: '',
        text: 'abc',
        stat: 'abc',
      });
    });
  });
});
