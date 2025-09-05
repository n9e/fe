export function stringStartsAsRegEx(str: string): boolean {
  if (!str) {
    return false;
  }

  return str[0] === '/';
}

export default function stringToRegex(str: string): RegExp | false {
  if (!stringStartsAsRegEx(str)) {
    let regex;
    try {
      regex = new RegExp(`^${str}$`);
    } catch (e) {
      return false;
    }
    return regex;
  }

  const match = str.match(new RegExp('^/(.*?)/(g?i?m?y?)$'));

  if (match) {
    try {
      return new RegExp(match[1], match[2]);
    } catch (e) {
      return false;
    }
  } else {
    return false;
  }
}
