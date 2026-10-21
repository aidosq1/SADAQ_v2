// News content is stored as HTML (rich text editor) or, for older news, as plain text.

const HTML_TAG_PATTERN = /<\/?(p|br|h[1-6]|ul|ol|li|strong|em|b|i|u|s|a|blockquote|img|figure|figcaption|hr|div|span)(\s[^>]*)?\/?>/i;

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function isHtmlContent(content: string): boolean {
  return HTML_TAG_PATTERN.test(content);
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

// Blank lines split paragraphs, single line breaks become <br>
export function plainTextToHtml(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

// Returns HTML for any stored content; sanitize the result before rendering
export function toNewsHtml(content: string | null | undefined): string {
  if (!content) return '';
  return isHtmlContent(content) ? content : plainTextToHtml(content);
}
