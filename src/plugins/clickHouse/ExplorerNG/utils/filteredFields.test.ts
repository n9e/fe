import filteredFields from './filteredFields';

describe('filteredFields', () => {
  describe('内置系统字段过滤', () => {
    it('始终过滤掉 ___raw___ 和 ___id___ 字段', () => {
      const fields = ['name', 'age', '___raw___', '___id___'] as const;
      expect(filteredFields([...fields], [])).toEqual(['name', 'age']);
    });

    it('始终过滤掉 __time 和 __package_offset__ 字段', () => {
      const fields = ['__time', '__package_offset__', 'level', 'message'] as const;
      expect(filteredFields([...fields], [])).toEqual(['level', 'message']);
    });

    it('所有内置字段同时出现时全部过滤', () => {
      const systemFields = ['__time', '__package_offset__', '___raw___', '___id___'] as const;
      const userFields = ['host', 'service'] as const;
      expect(filteredFields([...systemFields, ...userFields], [])).toEqual([...userFields]);
    });
  });

  describe('organizeFields 为空时', () => {
    it('返回所有非系统字段', () => {
      const fields = ['level', 'message', 'host'] as const;
      expect(filteredFields([...fields], [])).toEqual([...fields]);
    });

    it('输入为空数组时返回空数组', () => {
      expect(filteredFields([], [])).toEqual([]);
    });
  });

  describe('organizeFields 非空时的过滤与排序', () => {
    it('只保留 organizeFields 中包含的字段', () => {
      const fields = ['level', 'message', 'host', 'service'] as const;
      const organizeFields = ['host', 'level'] as const;
      const result = filteredFields([...fields], [...organizeFields]);
      expect(result).toEqual(['host', 'level']);
    });

    it('按照 organizeFields 中的顺序排序', () => {
      const fields = ['level', 'message', 'host'] as const;
      const organizeFields = ['host', 'message', 'level'] as const;
      const result = filteredFields([...fields], [...organizeFields]);
      expect(result).toEqual(['host', 'message', 'level']);
    });

    it('organizeFields 中不存在的字段被过滤掉', () => {
      const fields = ['level', 'unknown_field', 'host'] as const;
      const organizeFields = ['host', 'level'] as const;
      const result = filteredFields([...fields], [...organizeFields]);
      expect(result).not.toContain('unknown_field');
    });

    it('支持通过字段名前缀匹配（点号分隔）', () => {
      const fields = ['tags.region', 'tags.env', 'host'] as const;
      const organizeFields = ['tags', 'host'] as const;
      const result = filteredFields([...fields], [...organizeFields]);
      expect(result).toContain('tags.region');
      expect(result).toContain('tags.env');
      expect(result).toContain('host');
    });

    it('前缀匹配的字段按前缀在 organizeFields 中的位置排序', () => {
      const fields = ['host', 'tags.env', 'tags.region'] as const;
      const organizeFields = ['tags', 'host'] as const;
      const result = filteredFields([...fields], [...organizeFields]);
      // tags 在 organizeFields 中排在 host 前面
      const tagsIdx = result.findIndex((f) => f.startsWith('tags.'));
      const hostIdx = result.indexOf('host');
      expect(tagsIdx).toBeLessThan(hostIdx);
    });

    it('organizeFields 非空时仍然过滤系统字段', () => {
      const fields = ['___raw___', 'host', 'level'] as const;
      const organizeFields = ['host', 'level', '___raw___'] as const;
      const result = filteredFields([...fields], [...organizeFields]);
      expect(result).not.toContain('___raw___');
    });
  });
});
