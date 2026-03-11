export function replaceBrWithNewLine(str: string | null) {
  if (!str) return str;
  return str.replace(/<br\s*\/?>/gi, "\n");
}
