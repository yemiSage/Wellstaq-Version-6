export function humanizeIdentifier(value: string | null | undefined): string {
  if (!value) return "Unknown";
  return value
    .trim()
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
