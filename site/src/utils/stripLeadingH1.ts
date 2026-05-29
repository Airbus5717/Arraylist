const LEADING_H1_PATTERN = /^#\s+[^\n]+\n+/

export function stripLeadingH1(markdown: string): string {
  return markdown.replace(LEADING_H1_PATTERN, '')
}
