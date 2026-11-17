const COLLECT_TAG_PREFIX = '__collect__:';

export function splitSnmpTemplateTags(tags: string[] = []) {
  const normalTags: string[] = [];
  const templateNames: string[] = [];
  for (const tag of tags) {
    if (!tag.startsWith(COLLECT_TAG_PREFIX) || tag.length === COLLECT_TAG_PREFIX.length) {
      normalTags.push(tag);
      continue;
    }
    const name = tag.slice(COLLECT_TAG_PREFIX.length);
    try {
      templateNames.push(decodeURIComponent(name));
    } catch {
      // Preserve legacy template names containing a literal or malformed percent escape.
      templateNames.push(name);
    }
  }
  return { normalTags, templateNames: Array.from(new Set(templateNames)) };
}

export function mergeSnmpTemplateTags(tags: string[], templateName?: string) {
  return Array.from(new Set([...tags, ...(templateName ? [`${COLLECT_TAG_PREFIX}${encodeURIComponent(templateName)}`] : [])]));
}
