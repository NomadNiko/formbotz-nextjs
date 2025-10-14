/**
 * Parse custom link syntax in messages
 * Syntax: <src="URL">Link Text</>
 * Example: <src="https://example.com">Click Here</>
 */

export interface ParsedMessage {
  type: 'text' | 'link';
  content: string;
  url?: string;
}

/**
 * Parse a message with custom link syntax into structured parts
 */
export function parseMessageLinks(message: string): ParsedMessage[] {
  const parts: ParsedMessage[] = [];
  const linkRegex = /<src="([^"]+)">([^<]+)<\/>/g;

  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(message)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      const textBefore = message.substring(lastIndex, match.index);
      if (textBefore) {
        parts.push({
          type: 'text',
          content: textBefore,
        });
      }
    }

    // Add the link
    parts.push({
      type: 'link',
      content: match[2], // Link text
      url: match[1],      // URL
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last link
  if (lastIndex < message.length) {
    const textAfter = message.substring(lastIndex);
    if (textAfter) {
      parts.push({
        type: 'text',
        content: textAfter,
      });
    }
  }

  // If no links found, return the original message as text
  if (parts.length === 0) {
    parts.push({
      type: 'text',
      content: message,
    });
  }

  return parts;
}

/**
 * Convert parsed message parts to React-friendly format
 */
export function renderMessageWithLinks(message: string): Array<{ type: string; content: string; url?: string }> {
  return parseMessageLinks(message);
}
