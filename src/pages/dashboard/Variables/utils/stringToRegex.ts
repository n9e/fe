export function stringStartsAsRegEx(str: string): boolean {
  if (!str) {
    return false;
  }

  return str[0] === '/';
}

export default function stringToRegex(str?: string): RegExp | null {
  if (!str) return null;
  if (!stringStartsAsRegEx(str)) {
    let regex;
    try {
      regex = new RegExp(`^${str}$`);
    } catch (e) {
      return null;
    }
    return regex;
  }

  const match = str.match(new RegExp('^/(.*?)/(g?i?m?y?)$'));

  if (match) {
    try {
      return new RegExp(match[1], match[2]);
    } catch (e) {
      return null;
    }
  } else {
    return null;
  }
}
